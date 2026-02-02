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
const getAttendeceReports = inject("getAttendeceReports");
const all_students_non_copied = inject("all_students_non_copied");

const emit = defineEmits(['onBtnSubmit', 'onBtnClear']);
let log = console.log
const weekends = CONFIG.value?.settings?.attendance?.weekends || [] // ['Friday']

console.log('=====:::ReportingOverview.vue')

let defaultStart = ref(moment().startOf('month').format('Y-MM-DD'))
let defaultEnd = ref(moment().add(0, 'month').endOf('month').format('Y-MM-DD'))

function checkEndDate(){
  let end = moment(defaultEnd.value, 'YYYY-MM-DD');
  if (end.isSame(moment(), 'month')) {
    defaultEnd.value = moment().format('YYYY-MM-DD'); 
  }
}
checkEndDate()
 
async function handleDateChange(dates) {
  defaultStart.value = dates[0]
  defaultEnd.value = dates[1]
  checkEndDate()
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
let reports = ref({
  classWise: {},
  classRanking: [],
})
let activeReportTab = ref('summary')
const reportTabs = [
  { key: 'summary', label: 'Summary' },
  { key: 'monthly', label: 'Monthly' },
  { key: 'ranking', label: 'Ranking' },
  { key: 'cards', label: 'Cards' },
]
let selectedSummaryClass = ref(null)

const monthKeys = computed(() => {
  let classWise = reports.value?.classWise || {}
  let firstClass = Object.keys(classWise || {})[0]
  if(!firstClass) return []
  return Object.keys(classWise[firstClass] || {}).filter(k => k !== 'all').sort()
})

function getClassReport(class_short, monthKey='all'){
  return reports.value?.classWise?.[class_short]?.[monthKey] || {}
}

function openClassSummary(cls){
  selectedSummaryClass.value = cls
  activeReportTab.value = 'summary'
}

function closeClassSummary(){
  selectedSummaryClass.value = null
}


// For multiple select of students
async function onChangeMonthRange([start_date, end_date]){
  let leaves_and_vacations = await callbacks.getLeavesAndVacations({start_date, end_date})  

  let payloadData = {
    weekends, 
    leaveData: leaves_and_vacations,
    all__students: all_students_non_copied.value.map(s => ({dakhela: s.dakhela, class_short: s.class_short})),
    total_days: countDays(start_date, end_date), // This will helpe to generate attendence report by percentage
  }
  let data = await getAttendeceReports(payloadData, {start_date, end_date})
  reports.value = data || { classWise: {}, classRanking: [] }
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

      <div class="report-tabs mb-3">
        <button
          v-for="tab in reportTabs"
          :key="tab.key"
          class="report-tab"
          :class="{ active: activeReportTab === tab.key }"
          @click="activeReportTab = tab.key"
        >
          {{ tab.label }}
        </button>


      </div>
    </div>   
      

    <div v-if="activeReportTab === 'summary' && Object.keys(reports?.classWise || {}).length" class="mb-3">
      <myTable topMarginClass="mt-2">
        <template #thead>
          <thead>
            <tr>
              <th>Class</th>
              <th>Students</th>
              <th>Presentable Days</th>
              <th>Present</th>
              <th>Absent</th>
              <th>Present(%)</th>
              <th>Action</th>
            </tr>
          </thead>
        </template>
        <template #rows>
          <tr v-for="cls in classes" :key="'sum-' + cls.class_short">
            <td>{{ cls.class_name }}</td>
            <td>{{ getClassReport(cls.class_short)?.total_students || 0 }}</td>
            <td>{{ getClassReport(cls.class_short)?.total_presentable_days || 0 }}</td>
            <td>{{ getClassReport(cls.class_short)?.total_present || 0 }}</td>
            <td>{{ getClassReport(cls.class_short)?.total_absent || 0 }}</td>
            <td>{{ getClassReport(cls.class_short)?.present_percent || 0 }}%</td>
            <td>
              <button class="btn btn-sm btn-light" @click="openClassSummary(cls)">View</button>
            </td>
          </tr>
        </template>
      </myTable>
    </div>

    <div v-if="activeReportTab === 'summary' && selectedSummaryClass" class="mb-3">
      <div class="d-flex justify-content-between align-items-center mb-2">
        <h5 class="mb-0">Single Class Summary</h5>
        <button class="btn btn-sm btn-outline-secondary" @click="closeClassSummary">Close</button>
      </div>
      <myTable topMarginClass="mt-2">
        <template #thead>
          <thead>
            <tr>
              <th>Class</th>
              <th>Students</th>
              <th>Presentable Days</th>
              <th>Present</th>
              <th>Absent</th>
              <th>Present(%)</th>
            </tr>
          </thead>
        </template>
        <template #rows>
          <tr>
            <td>{{ selectedSummaryClass.class_name }}</td>
            <td>{{ getClassReport(selectedSummaryClass.class_short)?.total_students || 0 }}</td>
            <td>{{ getClassReport(selectedSummaryClass.class_short)?.total_presentable_days || 0 }}</td>
            <td>{{ getClassReport(selectedSummaryClass.class_short)?.total_present || 0 }}</td>
            <td>{{ getClassReport(selectedSummaryClass.class_short)?.total_absent || 0 }}</td>
            <td>{{ getClassReport(selectedSummaryClass.class_short)?.present_percent || 0 }}%</td>
          </tr>
        </template>
      </myTable>
    </div>

    <div v-if="activeReportTab === 'monthly' && monthKeys.length" class="mb-3">
      <myTable topMarginClass="mt-2">
        <template #thead>
          <thead>
            <tr>
              <th>Class</th>
              <th v-for="m in monthKeys" :key="'h-' + m">{{ moment(m).format('MMM YYYY') }}</th>
              <th>All</th>
            </tr>
          </thead>
        </template>
        <template #rows>
          <tr v-for="cls in classes" :key="'mon-' + cls.class_short">
            <td>{{ cls.class_name }}</td>
            <td v-for="m in monthKeys" :key="'c-' + cls.class_short + '-' + m">
              {{ getClassReport(cls.class_short, m)?.present_percent || 0 }}%
            </td>
            <td>{{ getClassReport(cls.class_short, 'all')?.present_percent || 0 }}%</td>
          </tr>
        </template>
      </myTable>
    </div>

    <div v-if="activeReportTab === 'ranking' && reports?.classRanking?.length" class="mb-3">
      <myTable topMarginClass="mt-2">
        <template #thead>
          <thead>
            <tr>
              <th>Ranking</th>
              <th>Class</th>
              <th>Present(%)</th>
            </tr>
          </thead>
        </template>
        <template #rows>
          <tr v-for="(clsShort, idx) in reports.classRanking" :key="'rank-' + clsShort">
            <td>{{ idx + 1 }}</td>
            <td>{{ (classes.find(c => c.class_short === clsShort) || {}).class_name || clsShort }}</td>
            <td>{{ getClassReport(clsShort, 'all')?.present_percent || 0 }}%</td>
          </tr>
        </template>
      </myTable>
    </div>

    <div v-if="activeReportTab === 'cards'" class="row mt-3">
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
                  <div class="info">{{ getClassReport(cls.class_short)?.total_students || 0 }}</div> 
                </div>
                <div class="side-of-card">
                  <div class="sub-title">Present</div>
                  <div class="info">{{ getClassReport(cls.class_short)?.total_present || 0 }}</div> 
                </div>
              </div>
            </div>
          </div>
        </div>
      </template> 
    </div>   
     

  </div>
</template>



<style scoped>
.card{
  border-radius: 30px;
  background-color: #ffffffbe; 
  position: relative;
  overflow: hidden;
}
.report-tabs{
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}
.report-tab{
  border: 1px solid #d9d9d9;
  background-color: #ffffff;
  color: #333333;
  padding: 6px 14px;
  border-radius: 12px;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.15s ease;
}
.report-tab:hover{
  background-color: #f1f1f1;
}
.report-tab.active{
  background-color: var(--primaryColor);
  color: #ffffff;
  border-color: var(--primaryColor);
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
