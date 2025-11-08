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
let defaultEnd = ref(moment().endOf('month').format('Y-MM-DD'))

 
async function handleDateChange(dates) {
  defaultStart.value = dates[0]
  defaultEnd.value = dates[1]
  await onChangeMonthRange(dates) 
}


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
      classwise_students: all_students_non_copied.value.map(s => ({dakhela: s.dakhela, class_short: s.class_short})) 
    }
    let data = await getAttendeceListFullHistory(payloadData, {start_date, end_date, action: 'classwise_data' })
    classes.value[index]["data"] = data
  }
}  


onMounted(()=>{
  onChangeMonthRange([defaultStart.value, defaultEnd.value])
})

</script>


<template>
  <div> 
    <div class="row"> 
      <div class="col-6">

        <MonthPicker 
        :onChange="handleDateChange"
        :defaultStartValue="defaultStart"
        :defaultEndValue="defaultEnd"
        :dayOfMonth="1"
        ></MonthPicker>
      </div>
      <div class="col-6">
        <select class="form-control">
          <template v-for="cls in classes" :key="cls.class_short">
            <option :value="cls.class_short">{{ cls.class_name }}</option> 
          </template>

        </select>
      </div>

    </div>   
     
        
    <div class="row mt-3">
      <template v-for="cls in classes" :key="cls.class_short">
        <div class="col-md-4 mb-3">
          <div class="card attendance-card">
            <div class="card-body text-center">
              <h4 class="card-title">{{ cls.class_name }}</h4>
              <p class="card-text">Students: {{ all_students_non_copied.filter(s => s.class_short === cls.class_short).length }} </p>
              <p class="card-text">Attendance: {{ cls?.data?.total_in || 0 }} </p>
            </div>
          </div>
        </div>
      </template> 
    </div>

  </div>
</template>



<style scoped>
 

</style>
