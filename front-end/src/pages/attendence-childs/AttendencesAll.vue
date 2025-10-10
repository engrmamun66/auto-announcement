<script setup>
import moment from 'moment/moment'
import { inject, ref, reactive, onMounted, onBeforeUnmount, computed, watch } from "vue";
import Ahelper from "./attendacnceHelper";
import myTable from '../../components/myTable.vue'
import Pagination from '../../components/Pagination.vue'
import AdvanceSearchForm from './AdvanceSearchForm.vue'
import NormalSearchForm from './NormalSearchForm.vue'

const CONFIG = inject("CONFIG");
const classes = inject("classes");
const all_students = inject("all_students");
const helper = inject("helper");
const callbacks = inject("callbacks");
const attendenceList = inject("attendenceList");
const attendenceParams = inject("attendenceParams");
const liveAttendenceList = inject("liveAttendenceList");

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

const getStudent = ({ student_id }) =>
  all_students.value.find((std) => std.dakhela == student_id);


let queryparams = {
    student_id: null,
    class_short: null,
    start_date: null,
    end_date: null,
    date: null,
    sort_by : "late_in_minute",  // default sort
    sort_direction : "ASC"  // default order
}
 
onMounted(()=>{

  callbacks.getAttendeceList()

  setTimeout(() => {
    isMounted.value = true
  }, 500);
})



</script>



<template>
  <div class="row">

    <div class="col-md-4">
      <NormalSearchForm
      @onBtnClear=" callbacks.getAttendeceList({page_no: 1})"
      @onBtnSubmit="(other_params) => {
        callbacks.getAttendeceList({page_no: 1, other_params})
      }"
      >
      <div v-if="pagiation_positon.startsWith('bottom')" class="d-flex mt-4" :class="[getPositionClass]">
          <Pagination v-if="attendenceParams?.totalPages > 1" v-model="attendenceParams" @jumpToPage="(page_no) => {
            callbacks.getAttendeceList({page_no})
          }" ></Pagination>
      </div> 
    
    </NormalSearchForm>
    </div>
    
     
    
    <div class="col-md-8">
      <myTable class="transformY-5px" style="--transformY: -8px">
        <template #thead>
          <thead>
            <tr> 
              <th>ID</th>
              <th>Name</th>
              <th>Class</th>  
              <th>Date</th>  
              <th>Status</th>  
              <th>Shift</th>  
            </tr>
          </thead>
        </template>
        <template #rows>
          <template v-if="attendenceList?.length">
            <template v-for="(item, i) in attendenceList">
              <tr>
                  
                <td> {{ item.id }} </td> 
                <td @auxclick.stop="log(item)"> {{ getStudent(item)?.name }} </td>                   
                <td> {{ getStudent(item)?.class }} </td>                   
                <td style="width: 130px;"> <span class="inline">{{ item.date }}</span> </td>                   
                <td> 
                  <div style="width: 170px" class="d-flex justify-content-between">
                    <span class="badge text-white bg-secondary">
                      {{ item.in_time ? 'IN' : 'OUT' }}
                    </span> 
                    <template v-if="item.status == 'Late'" >
                      <span class="badge text-white bg-danger">
                        {{ item.status }}
                      </span> 
                      <span class="badge text-white bg-danger">
                        {{ item?.late_in_minute || 0 }} {{ helper.wordForm('minute', item?.late_in_minute ) }}
                      </span> 
                    </template>

                    <template v-else>
                      <span class="badge text-white bg-success">
                        {{ item.status }}
                      </span> 
                      <span class="badge text-white bg-success">
                        {{ item?.late_in_minute || 0 }} {{ helper.wordForm('minute', item?.late_in_minute ) }}
                      </span> 
                    </template>
                  </div>
                </td>                   
                <td>{{ Ahelper.printShift(item?.shift_duration) }}</td> 
                                
                <!-- <td> 
                  <div class="d-flex justify-content-center action-icons">
                      <i  class='bx bx-barcode cp size-1p5' ></i>
                      
                      <span tooltip="Copy barcode">
                        <i  class='bx bxs-copy-alt cp px-1' style="font-size: 18px" ></i>
                      </span>
                      

                      <span tooltip="Delete student">
                        <i   class='bx bx-trash text-danger cp' ></i>
                      </span>
          
                    </div>  
                </td>                    -->
                                
          
                
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
