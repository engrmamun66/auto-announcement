<script setup>
import moment from 'moment/moment'
import { inject, ref, reactive, onMounted, onBeforeUnmount, computed, watch } from "vue";
import { useRoute } from 'vue-router';
import Ahelper from "./../attendacnceHelper";
import myTable from '../../../components/myTable.vue'
import Pagination from '../../../components/Pagination.vue'
import BaseSelectMultiple from './../../../components/BaseSelectMultiple.vue'
import EmDateTimePicker from './../../../components/EmDateTimePicker.vue'
import Btn from './../../../components/Btn.vue'

const CONFIG = inject("CONFIG");
const classes = inject("classes");
const all_students = inject("all_students");
const helper = inject("helper");
const callbacks = inject("callbacks");
const attendenceList = inject("attendenceList");
const attendenceParams = inject("attendenceParams");
const liveAttendenceList = inject("liveAttendenceList");
const pagination_perpage = inject("pagination_perpage");
const sort_direction = inject("sort_direction");
const sortby_column = inject("sortby_column");

 

const emit = defineEmits(['onBtnSubmit', 'onBtnClear']);
let log = console.log

// For multiple select of students
const route = useRoute()
let selectedStudents = ref([])
let search_text = ref('')

// Auto-select student from query param
if (route.query.dakhela && !selectedStudents.value.length) {
  const dakhela = Number(route.query.dakhela)
  const studentToSelect = all_students.value.find(s => s.dakhela == dakhela)
  if (studentToSelect) {
    selectedStudents.value = [studentToSelect]
  }
}

let attPayload = reactive({ 
  //-------------
  date: null,
  student_id: null, 
  class_short: null,
  sort_by : "late_in_minute",  // default sort
  sort_direction : sort_direction.value  // default order
}) 

watch(()=> attPayload.class_short, (_class_short) => {
  if(!_class_short){
    attPayload.student_id = null
  }
  selectedStudents.value = []
  search_text.value = ''
},{deep: true})

watch(pagination_perpage, (newVal) => {
  submitSearch({...pickerModelValue.value})
})
watch(sort_direction, (newVal) => {
  attPayload.sort_direction = newVal
  submitSearch({...pickerModelValue.value})
})
watch(sortby_column, (newVal) => {
  attPayload.sort_by = newVal
  submitSearch({...pickerModelValue.value})
})
 

let dateRangePickerRef = ref(null)
let pickerModelValue = ref({startDate: moment().format('YYYY-MM-DD')})


let filteredAllStudents = computed(() => {
  let students = helper.clone(all_students.value)
  
  if(attPayload.class_short){
    students = students.filter(student => student.class_short === attPayload.class_short)
  }  
  if(search_text.value){
    let text = search_text.value.toLowerCase()
    students = students.filter(student => 
      student.name.toLowerCase().includes(text) ||   
      (student.dakhela + '').toLowerCase().includes(text) 
    )
  }  
  return students
}) 


 


function clearSearch() {  
  attPayload.date = null,
  attPayload.student_id = null, 
  attPayload.class_short = null,
  attPayload.sort_by = "late_in_minute", 
  attPayload.sort_direction = "ASC"  
  selectedStudents.value = []
  search_text.value = ''
  emit('onBtnClear', {...attPayload})
}

function submitSearch(eventData={}) { 
  try {
    if(eventData?.startDate){
      pickerModelValue.value = eventData || pickerModelValue.value
    }
    let data = { 
      // student_ids: [attPayload.student_id].filter(Boolean),
      student_ids: selectedStudents.value.map(s => (typeof s ==='number' ? s : s.dakhela)).filter(Boolean),
      class_shorts: [attPayload.class_short].filter(Boolean),
      sort_by: attPayload.sort_by,
      sort_direction: attPayload.sort_direction,
    } 
    if(pickerModelValue.value?.startDate){
      data.date = moment(pickerModelValue.value.startDate).format('YYYY-MM-DD')
    }
    if(pagination_perpage.value){
      data.limit = pagination_perpage.value
    } 
    emit('onBtnSubmit', data)
  } catch (submitSearch_error) {
    console.warn({submitSearch_error});
    
  }
}

function clearPicker(){
  dateRangePickerRef.value.clearPicker()
  pickerModelValue.value.startDate = null
}

onMounted(()=>{
  submitSearch({...pickerModelValue.value})
})
 

defineExpose({
  udpateSelectedStudentAndSearch(student){
    selectedStudents.value = [student]
    search_text.value = ''
    submitSearch()
  }
})


</script>


<template>
  <div>
    
    <div class="row">
      <div class="col-12">
        <div class="d-flex flex-column gap-2 overflow-x-auto">

          <div class="form-group d-flex justify-content-center">
            <select v-model="attPayload.class_short" class="form-control cb-input" @change="submitSearch" style="width:350px">
              <option :value="null">-class-</option>
              <template v-for="(cls, index) in classes" :key="index">
                <option :value="cls.class_short">{{cls.class_name}}</option>
              </template>                  
            </select>
          </div> 

          <div class="w-100 d-flex justify-content-center">
            <BaseSelectMultiple v-model="selectedStudents" :data="filteredAllStudents" :search="true" 
              @searching="(text) => search_text = text" 
              @change="submitSearch()" 
              :searchDelayTime="50" displayKey="full_name" valueKey="dakhela" :limit="1" style="width:350px" placeholder="-Select Student-">
              <template #loopItem1="{item, index}">
                <span class="badge text-dark bg-body-secondary ms-1">
                  {{ item.class_short }}
                </span>
              </template>
              <template #loopItem="{item, index}">
                <span class="badge text-dark bg-body-secondary">
                  {{ item.class_short }}
                </span>
              </template>
            </BaseSelectMultiple> 

          </div>

          <!-- <div v-if="true" class="form-group">
            <select v-model="attPayload.student_id" class="form-control cb-input" @change="submitSearch" >
              <option :value="null">-Student-</option>
              <template v-for="(student, index) in filteredAllStudents" :key="index">
                <option :value="student.id">[{{ student.id }}] {{student.name}} ({{ student.class_short }})</option>
              </template>                  
            </select>
          </div>  -->


          <EmDateTimePicker ref="dateRangePickerRef"
            v-model="pickerModelValue"
            modelValueType="object"
            @change="submitSearch"
            @initialized_="helper.delay(clearPicker, 0)"
            @close="false"
            :displayFormat="'DD-MMM-Y'"
            :rangePicker="false" 
            :timePicker="false" 
            :startDate="pickerModelValue"  
            :minDate="null"
            :isDisabled="false"
            :autoOpen="false"
            :pickerHideEachClick="true"
            :use24FormatTimeForEvents="true"
            :invisible="true"
            :sticky="true"
            displayIn_="bottom_left" 
            displayIn="inline_center" 
            :_buttons="{applyBtn: 'Apply', todayBtn: true}"
            :buttons="false"
            :useCustomRange="CONFIG?.date_range_list ?? true"
            style="width: 232px"
            >
          </EmDateTimePicker>

          
        </div> 
      </div> 
 
      <div class="col-12 mt-3">
        <div class="d-flex justify-content-center gap-3">
          <Btn @click.stop="clearPicker(); submitSearch()" cbinput="cbinput" class="red">Clear All</Btn> 
          <Btn @click.stop="clearSearch()" cbinput="cbinput" class="red">Clear</Btn>
        </div>
      </div>

      <slot></slot>

    </div>   
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
.tooglerIcon{
  position: absolute;
  right: 5px;
  top: 10px;
  font-size: 20px;
  cursor: pointer;
  color: var(--primaryColor)
}

</style>
