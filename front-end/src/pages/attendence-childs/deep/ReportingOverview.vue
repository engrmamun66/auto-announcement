<script setup>
import moment from 'moment/moment'
import { inject, ref, reactive, onMounted, onBeforeUnmount, computed, watch } from "vue";
import Ahelper from "./../attendacnceHelper";
import myTable from '../../../components/myTable.vue'
import Pagination from '../../../components/Pagination.vue'
import BaseSelectMultiple from './../../../components/BaseSelectMultiple.vue'
import EmDateTimePicker from './../../../components/EmDateTimePicker.vue'
import Btn from './../../../components/Btn.vue'
import MonthPicker from './../../../components/MonthPicker.vue'
import AttendanceDetailsPopup from './../../../components/AttendanceDetailsPopup.vue'

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
const getAttendeceListFullHistory = inject("getAttendeceListFullHistory");
const all_students_non_copied = inject("all_students_non_copied");

const emit = defineEmits(['onBtnSubmit', 'onBtnClear']);
let log = console.log
const weekends = CONFIG.value?.settings?.attendance?.weekends || [] // ['Friday']

console.log('=====:::ReportingOverview.vue')

let defaultStart = ref(moment().startOf('month').format('Y-MM-DD'))
let defaultEnd = ref(moment().add(0, 'month').endOf('month').format('Y-MM-DD'))

 
async function handleDateChange(dates) {
  defaultStart.value = dates[0]
  defaultEnd.value = dates[1]
  await onChangeMonthRange(dates) 
}


function countDays(start_date, end_date) {
  const start = moment(start_date, 'YYYY-MM-DD');
  let end = moment(end_date, 'YYYY-MM-DD');

  // if end_date is current month, use today
  if (end.isSame(moment(), 'month')) {
    end = moment();
  }

  return end.diff(start, 'days') + 1;
}



let showDetails = ref(false)
let targetData = ref(null)

// For multiple select of students
async function onChangeMonthRange([start_date, end_date]){
  let leaves_and_vacations = await callbacks.getLeavesAndVacations({start_date, end_date})  

  for(const eachClass of classes.value){
    let index = classes.value.indexOf(eachClass); 

    let class_short = eachClass.class_short

    let payloadData = {
      weekends,
      class_short,
      leaveData: leaves_and_vacations,
      classwise_students: all_students_non_copied.value.map(s => ({dakhela: s.dakhela, class_short: s.class_short})),
      total_days: countDays(start_date, end_date),
    }
    console.log({payloadData});

    let data = await getAttendeceListFullHistory(payloadData, {start_date, end_date, action: 'classwise_data' })
    classes.value[index]["data"] = data?.attendance
    if(showDetails.value && targetData.value?.class_short === eachClass.class_short){
      targetData.value = classes.value[index]
    }
  }
}  



function onClickShowDetails(cls){
  showDetails.value = true
  targetData.value = cls
}


onMounted(()=>{
  onChangeMonthRange([defaultStart.value, defaultEnd.value])
})

</script>


<template>
  <div> 
    <div class="d-flex justify-content-between align-content-start"> 
      <MonthPicker 
      :onChange="handleDateChange"
      :defaultStartValue="defaultStart"
      :defaultEndValue="defaultEnd"
      :dayOfMonth="1"
      :inactiveFutureMonth="true"
      ></MonthPicker>
      <Btn @click.stop="showDetails = false" class="red px-5" :disabled="!showDetails" >Back</Btn>
    </div>   
     
    <template v-if="!showDetails">
      <div class="row mt-3">
        <template v-for="cls in classes" :key="cls.class_short">
          <div class="col-md-4 mb-3">
            <div class="card attendance-card">
  
              <div class="overflow-div">
                <button @click.stop="onClickShowDetails(cls)" class="btn btn-light bg-white">Show Details</button>
              </div>
  
  
              <div class="card-body text-center">
                <h4 class="card-title">{{ cls.class_name }}</h4>
                <div class="w-100 d-flex justify-content-around">
                  <div class="side-of-card">
                    <div class="sub-title">Students</div>
                    <div class="info">{{ all_students_non_copied.filter(s => s.class_short === cls.class_short).length }}</div> 
                  </div>
                  <div class="side-of-card">
                    <div class="sub-title">Attendance</div>
                    <div class="info">{{ cls?.data?.total_in || 0 }}</div> 
                  </div>
                </div>
              </div>
            </div>
          </div>
        </template> 
      </div> 

    </template>  
     
    <template v-else> 
  
      <AttendanceDetailsPopup v-if="showDetails" 
      :cls="targetData" 
      :startDate="defaultStart"
      :endDate="defaultEnd"
      ></AttendanceDetailsPopup>

    </template>  
     

  </div>
</template>



<style scoped>
.card{
  border-radius: 30px;
  background-color: #ffffffbe; 
  position: relative;
  overflow: hidden;
}
.card .info{
    color: #5b5b5b;
    font-weight: 700;
    background-color: #f1f1f1;
    padding: 2px 26px;
    border-radius: 24px;
    margin: 2px 14px;
    font-size: 20px;
}
.card .info.yellow{
  color: #d19509; 
}

.side-of-card{
  width: 50%;
  text-align: center;
  border-top: 1px solid #e2e2e2;
}
.side-of-card:first-child{
  border-right: 1px solid #e2e2e2;
}
.sub-title{
 color: #414141;
 font-size: 14px;
}

.card .overflow-div{
  position:absolute;
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #2c3e50ab;
  z-index: 11;
  top: 100%;
  left: 0px;
  /* top: 0;  */
  transition: all 0.2s;
}
.card .overflow-div button{ 
  box-shadow: 0px 3px 5px #00000057; 
  transform: translateY(200px);
  opacity: 0;
  border-radius: 0px;
}
.card:hover .overflow-div button{ 
  transform: translateY(0px);
  opacity: 1;
  border-radius: 20px; 
}
.card:hover .overflow-div{ 
  top: 0; 
}
.card:hover .overflow-div{ 
  top: 0; 
}

</style>
