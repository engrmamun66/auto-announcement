<script setup>
import moment from 'moment/moment'
import { inject, ref, reactive, onMounted, onBeforeUnmount, computed, watch } from "vue";
import Ahelper from "./../attendacnceHelper";
import myTable from '../../../components/myTable.vue'
import Pagination from '../../../components/Pagination.vue'
import BaseSelectMultiple from './../../../components/BaseSelectMultiple.vue'
import EmDateTimePicker from './../../../components/EmDateTimePicker.vue'
import Btn from './../../../components/Btn.vue'
import MontheRanger from './../../../components/MontheRanger.vue'
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

let attendence_full_history = ref([])
let leaves_and_vacations = ref([])

console.log('=====:::ReportingOverview.vue')

// For multiple select of students
async function onChangeMonthRange([start_date, end_date]){
  leaves_and_vacations.value = await callbacks.getLeavesAndVacations({start_date, end_date})  

  for(const eachClass of classes.value){
    let index = classes.value.indexOf(eachClass); 

    let class_short = eachClass.class_short

    let payloadData = {
      weekends,
      class_short,
      leaveData: leaves_and_vacations.value,
      classwise_students: all_students_non_copied.value.map(s => ({dakhela: s.dakhela, class_short: s.class_short})) 
    }
    let data = await getAttendeceListFullHistory(payloadData, {start_date, end_date, action: 'classwise_data' }) 
    classes.value[index]["attendance_data"] = data
  }
}  

 function handleDateChange(event) {
    console.log(event.target.name, event.target.value)
  }
  
let defaultStart = ref('2025-11-01')
let defaultEnd = ref('2025-11-01')
</script>


<template>
  <div>
    {{ defaultStart }}
    <hr>
    {{ defaultEnd }}
    <div class="row">
      <div class="col-6">
        <MontheRanger @change="onChangeMonthRange"></MontheRanger>
      </div>
      <div class="col-6">

        <MonthPicker 
        :onChange="handleDateChange"
        :defaultStartValue="defaultStart"
        :defaultEndValue="defaultEnd"
        :dayOfMonth="1"
        ></MonthPicker>
      </div>

    </div>   
  </div>
</template>



<style scoped>
 

</style>
