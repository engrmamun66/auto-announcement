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
const getAttendeceReportsForSingleClass = inject("getAttendeceReportsForSingleClass");
const all_students_non_copied = inject("all_students_non_copied");
const http = inject("http");

const emit = defineEmits(['onBtnSubmit', 'onBtnClear']);
let log = console.log
const weekends = CONFIG.value?.settings?.attendance?.weekends || [] // ['Friday']
const preset_count_by = CONFIG.value?.settings?.attendance?.preset_count_by ?? 'if_prent_in_first_shift'

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
  await loadAllClassSummaryReport(dates) 
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
]
let selectedSummaryClass = ref(null)
let singleClassReport = ref(null)
let selectedStudent = ref(null)
let singleStudentAttendance = ref([])
let loadingStudentAttendance = ref(false)
let attendanceViewMode = ref('details')

const monthKeys = computed(() => {
  let classWise = reports.value?.classWise || {}
  let firstClass = Object.keys(classWise || {})[0]
  if(!firstClass) return []
  return Object.keys(classWise[firstClass] || {}).filter(k => k !== 'total').sort()
})

function getClassReport(class_short, monthKey='total'){
  return reports.value?.classWise?.[class_short]?.[monthKey] || {}
}

function openClassSummary(cls){
  selectedSummaryClass.value = cls
  activeReportTab.value = 'single-class-summary'
  selectedStudent.value = null
  singleStudentAttendance.value = []
  attendanceViewMode.value = 'details'
  loadSingleClassSummaryReport(cls.class_short, [defaultStart.value, defaultEnd.value])
}

function closeClassSummary(){
  selectedSummaryClass.value = null
  singleClassReport.value = null
  activeReportTab.value = 'summary'
  selectedStudent.value = null
  singleStudentAttendance.value = []
  attendanceViewMode.value = 'details'
}


// For multiple select of students
async function loadAllClassSummaryReport([start_date, end_date]){
  let leaves_and_vacations = await callbacks.getLeavesAndVacations({start_date, end_date})  

  let payloadData = {
    weekends, 
    leaveData: leaves_and_vacations,
    all__students: all_students_non_copied.value.map(s => ({id: s.id, name: s.name, dakhela: s.dakhela, class_short: s.class_short})),
    total_days: countDays(start_date, end_date), // This will helpe to generate attendence report by percentage
  }
  let data = await getAttendeceReports(payloadData, {start_date, end_date})
  reports.value = data || { classWise: {}, classRanking: [] }
}  


async function loadSingleClassSummaryReport(class_short, [start_date, end_date]){
  let leaves_and_vacations = await callbacks.getLeavesAndVacations({start_date, end_date})  

  let payloadData = {
    weekends, 
    leaveData: leaves_and_vacations,
    class_students: all_students_non_copied.value.filter(std => std.class_short === class_short).map(s => ({id: s.id, name: s.name, dakhela: s.dakhela, class_short: s.class_short})),
    total_days: countDays(start_date, end_date), // This will helpe to generate attendence report by percentage
  }
  let data = await getAttendeceReportsForSingleClass(payloadData, {start_date, end_date})
  singleClassReport.value = data || null
}  

async function loadSingleStudentAttendance(std){
  if(!std?.dakhela) return
  selectedStudent.value = std
  loadingStudentAttendance.value = true
  attendanceViewMode.value = 'details'
  try {
    let params = {
      start_date: defaultStart.value,
      end_date: defaultEnd.value,
      student_ids: String(std.dakhela),
      limit: 1000,
      sort_by: 'date',
      sort_direction: 'ASC',
    }
    let response = await http.post('/attendence-list', {}, { params })
    if(response.status == 200){
      singleStudentAttendance.value = response.data?.data || []
    }
  } catch (error) {
    console.warn('loadSingleStudentAttendance__error', error);
  } finally {
    loadingStudentAttendance.value = false
  }
}

function closeSingleStudentAttendance(){
  selectedStudent.value = null
  singleStudentAttendance.value = []
  attendanceViewMode.value = 'details'
}

const groupedAttendance = computed(() => {
  if(!singleStudentAttendance.value?.length) return []
  const groups = helper.listGroupBy(singleStudentAttendance.value, 'date')
  return Object.keys(groups).sort().map(date => ({
    date,
    rows: groups[date],
    status: computePresentStatus(groups[date], selectedStudent.value?.class_short),
  }))
})

const statusByDate = computed(() => {
  const map = {}
  groupedAttendance.value.forEach(g => {
    map[g.date] = g.status
  })
  return map
})

function getShiftDurations(class_short){
  if(!class_short) return { first: null, last: null }
  const cls = classes.value.find(c => c.class_short === class_short)
  const shifts = cls?.shifts || []
  if(!shifts.length) return { first: null, last: null }
  const first = `${shifts[0].start} - ${shifts[0].end}`
  const last = `${shifts[shifts.length - 1].start} - ${shifts[shifts.length - 1].end}`
  return { first, last }
}

function computePresentStatus(rows=[], class_short){
  if(!rows?.length) return 'Absent'
  const { first, last } = getShiftDurations(class_short)
  if(!first || !last){
    return rows.length ? 'Present' : 'Absent'
  }
  const hasFirst = rows.some(r => r.shift_duration === first)
  const hasLast = rows.some(r => r.shift_duration === last)

  if(preset_count_by === 'if_prent_in_last_shift') return hasLast ? 'Present' : 'Absent'
  if(preset_count_by === 'if_prent_in_both_shift'){
    if(first === last) return hasFirst ? 'Present' : 'Absent'
    return (hasFirst && hasLast) ? 'Present' : 'Absent'
  }
  return hasFirst ? 'Present' : 'Absent'
}

function getFirstIn(rows=[]){
  const times = rows.map(r => r.in_time).filter(Boolean).sort()
  return times[0] || '-'
}
function getLastOut(rows=[]){
  const times = rows.map(r => r.out_time).filter(Boolean).sort()
  return times[times.length - 1] || '-'
}
function getStatuses(rows=[]){
  const statuses = Array.from(new Set(rows.map(r => r.status).filter(Boolean)))
  return statuses.join(', ') || '-'
}
function getMaxLate(rows=[]){
  const vals = rows.map(r => Number(r.late_in_minute || 0))
  return vals.length ? Math.max(...vals) : 0
}



function onClickShowDetails(cls){
  showDetails.value = true
  targetData.value = cls
}


onMounted(()=>{
  loadAllClassSummaryReport([defaultStart.value, defaultEnd.value])
})

</script>


<template>
  <div> 
    <div class="d-flex justify-content-between align-items-center mb-3"> 
      <MonthPicker 
      :onChange="handleDateChange"
      :defaultStartValue="defaultStart"
      :defaultEndValue="defaultEnd"
      :dayOfMonth="1"
      :inactiveFutureMonth="true"
      ></MonthPicker>

      <div v-if="activeReportTab === 'single-class-summary'" class="ms-auto">
        <span class="back-to-previous" @click="closeClassSummary">
          <i class="fa fa-arrow-left me-2"></i>
          Back to previous view
        </span>
      </div>

      <div v-if="activeReportTab !== 'single-class-summary'" class="report-tabs mb-3">
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
              <th>Open&nbsp;Days</th>
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
              <button class="btn btn-sm btn-light" @click="openClassSummary(cls)">Details</button>
            </td>
          </tr>
        </template>
      </myTable>
    </div>

    <div v-if="activeReportTab === 'single-class-summary' && selectedSummaryClass" class="mb-">
      <div class="d-flex justify-content-center align-items-center">
        <h5 class="table-title">{{ selectedSummaryClass.class_name }} Summary</h5>
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

      <div v-if="activeReportTab === 'single-class-summary' && selectedStudent" class="mb-3">
        <div class="d-flex justify-content-between align-items-center mb-2">
          <h6 class="table-title">
            Attendance Details: {{ selectedStudent.name || '-' }} ({{ selectedStudent.dakhela }})
          </h6>
          <div class="d-flex align-items-center gap-2">
            <button
              class="btn btn-sm btn-outline-primary btn-view-toggle"
              :class="{ active: attendanceViewMode === 'details' }"
              @click="attendanceViewMode = 'details'"
            >
              Details
            </button>
            <button
              class="btn btn-sm btn-outline-primary btn-view-toggle"
              :class="{ active: attendanceViewMode === 'compact' }"
              @click="attendanceViewMode = 'compact'"
            >
              Compact
            </button>
            <button class="btn btn-sm btn-close-light" @click="closeSingleStudentAttendance">Close</button>
          </div>
        </div>
        
        <div v-if="loadingStudentAttendance" class="text-muted">Loading...</div>
        <myTable v-else-if="attendanceViewMode === 'details'" topMarginClass="mt-2">
          <template #thead>
            <thead>
              <tr>
                <th>Date</th>
                <th>In</th>
                <th>Out</th>
                <th>Status</th>
                <th>Late(min)</th>
                <th>Shift</th>
                <th>Remarks</th>
              </tr>
            </thead>
          </template>
          <template #rows>
            <tr v-for="(row, idx) in singleStudentAttendance" :key="'att-' + idx">
              <td>{{ row.date }}</td>
              <td>{{ row.in_time || '-' }}</td>
              <td>{{ row.out_time || '-' }}</td>
              <td>{{ statusByDate[row.date] || row.status || '-' }}</td>
              <td>{{ row.late_in_minute ?? 0 }}</td>
              <td>{{ row.shift_duration || '-' }}</td>
              <td>{{ row.remarks || '-' }}</td>
            </tr>
            <tr v-if="!singleStudentAttendance.length">
              <td colspan="7" class="text-center text-muted">No attendance data found.</td>
            </tr>
          </template>
        </myTable>
        <myTable v-else topMarginClass="mt-2">
          <template #thead>
            <thead>
              <tr>
                <th>Date</th>
                <th>In</th>
                <th>Out</th>
                <th>Status</th>
                <th>Late(max)</th>
                <th>Entries</th>
              </tr>
            </thead>
          </template>
          <template #rows>
            <tr v-for="group in groupedAttendance" :key="'grp-' + group.date">
              <td>{{ group.date }}</td>
              <td>{{ getFirstIn(group.rows) }}</td>
              <td>{{ getLastOut(group.rows) }}</td>
              <td>{{ group.status }}</td>
              <td>{{ getMaxLate(group.rows) }}</td>
              <td>{{ group.rows.length }}</td>
            </tr>
            <tr v-if="!groupedAttendance.length">
              <td colspan="6" class="text-center text-muted">No attendance data found.</td>
            </tr>
          </template>
        </myTable>
      </div>

      <div v-if="activeReportTab === 'single-class-summary' && singleClassReport?.students?.length" class="mb-3">
        <div class="d-flex justify-content-center align-items-center">
          <!-- <h5 class="table-title">Student-wise Report</h5> -->
        </div>
        <myTable topMarginClass="mt-2">
          <template #thead>
            <thead>
              <tr>
                <th>Student Name</th>
                <th>Dakhela</th>
                <th>Presentable Days</th>
                <th>Present</th>
                <th>Absent</th>
                <th>Present(%)</th>
                <th>Action</th>
              </tr>
            </thead>
          </template>
          <template #rows>
            <tr v-for="std in singleClassReport.students" :key="'std-' + std.dakhela">
              <td>{{ std.name || '-' }}</td>
              <td>{{ std.dakhela }}</td>
              <td>{{ std.total_presentable_days || 0 }}</td>
              <td>{{ std.total_present || 0 }}</td>
              <td>{{ std.total_absent || 0 }}</td>
              <td>{{ std.present_percent || 0 }}%</td>
              <td>
                <button class="btn btn-sm btn-light" @click="loadSingleStudentAttendance(std)">Detail</button>
              </td>
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
                <th>Total</th>
            </tr>
          </thead>
        </template>
        <template #rows>
          <tr v-for="cls in classes" :key="'mon-' + cls.class_short">
            <td>{{ cls.class_name }}</td>
              <td v-for="m in monthKeys" :key="'c-' + cls.class_short + '-' + m">
                {{ getClassReport(cls.class_short, m)?.present_percent || 0 }}%
              </td>
              <td>{{ getClassReport(cls.class_short, 'total')?.present_percent || 0 }}%</td>
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
              <td>{{ getClassReport(clsShort, 'total')?.present_percent || 0 }}%</td>
            </tr>
          </template>
        </myTable>
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
.btn-view-toggle.active{
  background-color: var(--primaryColor);
  color: #ffffff;
  border-color: var(--primaryColor);
}
.btn-close-light{
  color: #b42318;
  background-color: #fff5f5;
  border: 1px solid #f2c2c2;
}
.btn-close-light:hover{
  background-color: #ffecec;
}
.back-to-previous{
  cursor: pointer;
  color: var(--primaryColor);
  font-weight: 600;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 6px 12px;
  border-radius: 999px;
  background-color: #f5f7fb;
  border: 1px solid #e2e8f0;
}
.back-to-previous:hover{
  background-color: #eef2f7;
  text-decoration: none;
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
.table-title{
  margin-bottom: 0px;
  background: white;
  padding: 6px 15px;
  border-radius: 10px;
}
</style>
