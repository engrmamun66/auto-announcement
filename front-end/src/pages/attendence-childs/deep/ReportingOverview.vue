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

const emit = defineEmits(['onBtnSubmit', 'onBtnClear']);
let log = console.log
const weekends = CONFIG.value?.settings?.attendance?.weekends || [] // ['Friday']

let attendence_list_full_history = ref([])
let leaves_and_vacations = ref([])


// For multiple select of students
async function onChangeMonthRange([start_date, end_date]){
  attendence_list_full_history.value = await getAttendeceListFullHistory({start_date, end_date }) 
  leaves_and_vacations.value = await callbacks.getLeavesAndVacations({start_date, end_date})  
  calculateClassWiseData()
}

let classWiseData = ref()

async function calculateClassWiseData(){
  let groupByClass = helper.listGroupBy(attendence_list_full_history.value, 'class_short')
  console.log(groupByClass);
}

onMounted(() => {
  
})
 
 

  


</script>


<template>
  <div>
    
    <div class="row">
      <div class="col-6">
        <MontheRanger @change="onChangeMonthRange"></MontheRanger>
      </div>

    </div>   
  </div>
</template>



<style scoped>
 

</style>
