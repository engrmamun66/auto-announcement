<script setup>
import moment from 'moment/moment'
import { inject, ref, reactive, onMounted, onBeforeUnmount, computed, watch } from "vue";
import Ahelper from "./attendacnceHelper";
import myTable from '../../components/myTable.vue'
import Confirm from '../../components/Confirm.vue'
import NormalSearchForm from './deep/NormalSearchForm.vue'

const CONFIG = inject("CONFIG");
const classes = inject("classes");
const all_students_non_copied = inject("all_students_non_copied");
const http = inject("http");
const helper = inject("helper");
const emitter = inject("emitter");
const callbacks = inject("callbacks");
const attendenceList = inject("attendenceList");
const attendenceParams = inject("attendenceParams");
const liveAttendenceList = inject("liveAttendenceList");
const getAttendeceList = inject("getAttendeceList");

const pagiation_positon = CONFIG.value?.settings?.attendance?.pagination?.pagiation_positon || 'bottom_center'

let getPositionClass = computed(() => {
  if(pagiation_positon.endsWith('left')){
    return 'justify-content-left'
  }
  else if(pagiation_positon.endsWith('center')){
    return 'justify-content-center'
  }
  else if(pagiation_positon.endsWith('right')){
    return 'justify-content-right'
  }
  else{
    return 'justify-content-center'
  }
})

let log = console.log

let isMounted = ref(false)
let NormalSearchFormRef = ref(null)

const getStudent = ({ student_id }) =>
  all_students_non_copied.value.find((std) => std.dakhela == student_id);

 
onMounted(()=>{ 
  isMounted.value = true 
})

let targetItem = ref(null)
let showDeleteConfirmationModal = ref(false)
let selectedItems = ref(new Set())

const selectAll = computed({
  get: () => selectedItems.value.size === attendenceList.value?.length && attendenceList.value?.length > 0,
  set: (val) => {
    if (val) {
      selectedItems.value = new Set(attendenceList.value?.map(item => item.id) || [])
    } else {
      selectedItems.value.clear()
    }
  }
})

function prepareToDelete(item){
  targetItem.value = item
  showDeleteConfirmationModal.value = true
  console.log('prepareToDeleteprepareToDelete');

}
function deleteAttedence(item, note_text = null){
  http.delete(`/attendence-delete/${item.id}`).then(response => {
    if(response.status === 200){
      liveAttendenceList.value = liveAttendenceList.value.filter(_item => _item.id != item.id)
      attendenceList.value = attendenceList.value.filter(_item => _item.id != item.id)
      emitter.emit('toaster-success', {message: helper.t('Attendance deleted!')})
    }
  })
}

async function toggleItemSelection(itemId, checked){
  if(checked){
    selectedItems.value.add(itemId)
  } else {
    selectedItems.value.delete(itemId)
  }
  selectedItems.value = new Set(selectedItems.value)
}

async function deleteMultipleAttendance(){
  if(selectedItems.value.size === 0) return

  const count = selectedItems.value.size
  if(!confirm(helper.t(`Delete {count} attendance record(s)?`, {count}))) return

  try {
    const itemIds = Array.from(selectedItems.value)
    await http.delete('/attendence-delete-bulk', { data: { ids: itemIds } })

    liveAttendenceList.value = liveAttendenceList.value.filter(_item => !selectedItems.value.has(_item.id))
    attendenceList.value = attendenceList.value.filter(_item => !selectedItems.value.has(_item.id))
    selectedItems.value.clear()

    emitter.emit('toaster-success', {message: helper.t(`{count} attendance record(s) deleted!`, {count})})
  } catch(error){
    console.error('deleteMultipleAttendance error:', error)
    emitter.emit('toaster-error', {message: helper.t('Failed to delete records')})
  }
}




</script>



<template>
  <div class="row mt-3">

    <div class="col-md-4">
      <NormalSearchForm ref="NormalSearchFormRef"
      @onBtnClear="getAttendeceList({page_no: 1})"
      @onBtnSubmit="(other_params) => {
          getAttendeceList({page_no: 1, other_params: {...other_params} }) 
      }"
      > 
      </NormalSearchForm>
    </div>
    
     
    
    <div class="col-md-8">
      <div v-if="selectedItems.size > 0" class="d-flex gap-2 mb-3">
        <button class="btn btn-sm btn-danger" @click="deleteMultipleAttendance">
          <i class='bx bx-trash'></i> Delete Selected ({{ selectedItems.size }})
        </button>
        <button class="btn btn-sm btn-secondary" @click="selectedItems.clear()">
          Clear Selection
        </button>
      </div>
      <myTable topMarginClass="">
        <template #thead>
          <thead>
            <tr>
              <th style="width: 40px;">
                <input type="checkbox" v-model="selectAll" />
              </th>
              <th>Name</th>
              <th>Class</th>
              <th>Date</th>
              <th>Summarised Status</th>
              <th>Shift</th>
              <th>Action</th>
            </tr>
          </thead>
        </template>
        <template #rows>
          <template v-if="attendenceList?.length">
            <template v-for="(item, i) in attendenceList">
              <tr>
                <td style="width: 40px;">
                  <input type="checkbox" :checked="selectedItems.has(item.id)" @change="e => toggleItemSelection(item.id, e.target.checked)" />
                </td>
                <td @auxclick.stop="log(item)"> 
                  <span @click.stop="NormalSearchFormRef.udpateSelectedStudentAndSearch(getStudent(item))" class="badge text-white bg-secondary cp" tooltip="Student ID">
                    {{ getStudent(item)?.dakhela }}
                  </span>
                  {{ getStudent(item)?.name }}
                </td>                   
                <td> {{ getStudent(item)?.class }} </td>                   
                <td style="width: 130px;"> <span class="inline">{{ item.date }}</span> </td>                   
                <td> 
                  <div style="width: 170px" class="d-flex justify-content-between">
                    <span class="badge text-white bg-secondary" tooltip="In/Out">
                      {{ item.in_time ? 'IN' : 'OUT' }}
                    </span> 
                    <template v-if="item.status == 'Late'">
                      <span class="badge text-white bg-danger" tooltip="Status">
                        {{ item.status }}
                      </span> 
                      <span class="badge text-white bg-danger" tooltip="Late Time">
                        {{ item?.late_in_minute || 0 }} {{ helper.wordForm('minute', item?.late_in_minute ) }}
                      </span> 
                    </template>

                    <template v-else>
                      <span class="badge text-white bg-success" tooltip="Status">
                        {{ item.status }}
                      </span> 
                      <span class="badge text-white bg-success" tooltip="Late Time">
                        {{ item?.late_in_minute || 0 }} {{ helper.wordForm('minute', item?.late_in_minute ) }}
                      </span> 
                    </template>
                  </div> 
                </td>                   
                <td>{{ Ahelper.printShift(item?.shift_duration) }}</td> 
                                
                <td> 
                  <div class="d-flex justify-content-center action-icons">
                      <span tooltip="Delete student">
                        <i @click.stop="prepareToDelete(item)" class='bx bx-trash text-danger cp' ></i>
                      </span>
                    </div>  
                </td>                   
                
            </tr> 

            
            
            </template>
          </template>
          <template v-else>
            <tr>
                <td colspan="88" class="text-center">No Attendance Found</td>                 
            </tr>
          </template>
        </template>
      </myTable> 

      
    </div>
    <Confirm v-model="showDeleteConfirmationModal" @yes="(note_text) => {
      deleteAttedence(targetItem, note_text)
    }" :tekeNote="false" >
            আপনি কি উপস্থিতিটিকে সম্পূর্ণ বাতিল করতে চান?
    </Confirm>
  </div>
</template>


<style scoped>
.attendance-card {
  background: #fff;
  border-radius: 10px;
  padding: 1rem 1.2rem;
  border: 1px solid #e2e2e2;
  transition: all 0.25s ease;
  color: #333;
  padding-top: 40px;
}

.attendance-card:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.student-name{
  margin-bottom: 10px;
  font-weight: 700;
  border: 1px solid;
  border-bottom: 2px double;
  cursor: pointer;
  padding: 5px;
  border-radius: 5px;
  width: 100%;
  text-align: center;
}

.status-present {
  background-color: #198754; /* Bootstrap success green */
  color: #fff !important;
}

.status-absent {
  background-color: #dc3545; /* Bootstrap danger red */
  color: #fff !important;
}

.status-outtime {
  background-color: #0095b7; /* Bootstrap danger red */
  color: #fff !important;
}

.status-outtime .badge,
.status-present .badge,
.status-absent .badge {
  background: rgba(255, 255, 255, 0.2) !important;
  color: #fff !important;
}

.remarks {
  border-top: 1px dashed rgba(255, 255, 255, 0.4);
  padding-top: 6px;
  font-style: italic;
}

.no-data-card {
  min-height: 250px;
  background-color: #f8f9fa;
  border: 1px dashed #ccc;
}
span[status]{
  background-color: rgba(255, 255, 255, 0.161);
    padding: 1px 8px 3px 6px;
    border-radius: 6px;
    color: #ffffff;
    transform: translateY(-2px);
    border: 1px solid white;
}
.popup{
    position: absolute;
    padding: 5px 15px;
    text-align: center;
    background-color: rgb(255, 255, 255);
    border-radius: 0px 0px 5px 5px;
    top: 1px;
    box-shadow: 0px 1px 0px rgba(0, 0, 0, 0.489), inset 1px 1px 0px rgba(0, 0, 0, 0.175);
    z-index: 1;
  } 
.popup.in-out{  
    left: 50%;
    top: 1px;
    transform: translateX(-50%);
    border-radius: 0px 0px 5px 5px;
} 
li{
  margin-bottom: 6px;
}
.bxs-calendar-x{
  position: absolute;
  right: 5px;
  top: 10px;
  font-size: 20px;
  cursor: pointer;
  color: var(--primaryColor)
}

</style>
