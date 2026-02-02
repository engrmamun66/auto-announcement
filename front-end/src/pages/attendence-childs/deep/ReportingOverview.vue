<script setup>
import moment from 'moment/moment'
import { inject, ref, onMounted, computed } from "vue";
import MonthPicker from './../../../components/MonthPicker.vue'
import ReportTabs from '../../../components/reports/ReportTabs.vue'
import BackToPrevious from '../../../components/reports/BackToPrevious.vue'
import SummaryTable from '../../../components/reports/SummaryTable.vue'
import SingleClassSummaryTable from '../../../components/reports/SingleClassSummaryTable.vue'
import StudentWiseReportTable from '../../../components/reports/StudentWiseReportTable.vue'
import StudentAttendanceDetails from '../../../components/reports/StudentAttendanceDetails.vue'
import MonthlyReportTable from '../../../components/reports/MonthlyReportTable.vue'
import RankingTable from '../../../components/reports/RankingTable.vue'

const CONFIG = inject("CONFIG");
const classes = inject("classes");
const helper = inject("helper");
const callbacks = inject("callbacks");
const getAttendeceReports = inject("getAttendeceReports");
const getAttendeceReportsForSingleClass = inject("getAttendeceReportsForSingleClass");
const all_students_non_copied = inject("all_students_non_copied");
const http = inject("http");

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
let attendanceViewMode = ref('compact') // details | compact

const reportTitle = computed(() => {
  if (activeReportTab.value === 'single-class-summary' && selectedSummaryClass.value) {
    return `${selectedSummaryClass.value.class_name || selectedSummaryClass.value.class_short} Summary`
  }
  if (activeReportTab.value === 'monthly') return 'Monthly Report'
  if (activeReportTab.value === 'ranking') return 'Ranking Report'
  return 'Attendance Summary'
})

const printDate = computed(() => moment().format('DD MMMM, Y - hh:mm A'))

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
  attendanceViewMode.value = 'compact'
  loadSingleClassSummaryReport(cls.class_short, [defaultStart.value, defaultEnd.value])
}

function closeClassSummary(){
  selectedSummaryClass.value = null
  singleClassReport.value = null
  activeReportTab.value = 'summary'
  selectedStudent.value = null
  singleStudentAttendance.value = []
  attendanceViewMode.value = 'compact'
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
  attendanceViewMode.value = 'compact'
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
  attendanceViewMode.value = 'compact'
}

const groupedAttendance = computed(() => {
  if(!singleStudentAttendance.value?.length) return []
  const groups = helper.listGroupBy(singleStudentAttendance.value, 'date')
  return Object.keys(groups).sort().map(date => ({
    date,
    rows: groups[date],
    status: computePresentStatus(groups[date], selectedStudent.value?.class_short),
    first_in: getFirstIn(groups[date]),
    last_out: getLastOut(groups[date]),
    max_late: getMaxLate(groups[date]),
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
function getMaxLate(rows=[]){
  const vals = rows.map(r => Number(r.late_in_minute || 0))
  return vals.length ? Math.max(...vals) : 0
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
        <BackToPrevious @click="closeClassSummary" />
      </div>

      <div v-if="activeReportTab !== 'single-class-summary'" class="mb-3">
        <ReportTabs
          :tabs="reportTabs"
          :active="activeReportTab"
          @change="activeReportTab = $event"
        />
      </div>
    </div>

    <div class="print-area">

      <div id="REPORT_HEADER" class="only-show-onprint report-header">
        <div>
          <div class="report-header__title">{{ reportTitle }}</div>
          <div class="report-header__meta">
            <span>
              <span class="report-header__range">{{ moment(defaultStart).format('MMM Y') }} - {{ moment(defaultEnd).format('MMM Y') }}</span>
              <!-- <span class="report-header__range">{{ defaultStart }} to {{ defaultEnd }}</span> -->
            </span>
            <span class="report-header__printed">Printed: {{ printDate }}</span>
          </div>
        </div>
      </div>

      <div v-if="activeReportTab === 'summary' && Object.keys(reports?.classWise || {}).length" class="mb-3">
        <SummaryTable
          :classes="classes"
          :classWise="reports.classWise"
          @details="openClassSummary"
        />
      </div>
  
      <div v-if="activeReportTab === 'single-class-summary' && selectedSummaryClass" class="mb-3">
        <SingleClassSummaryTable
          :classInfo="selectedSummaryClass"
          :summary="getClassReport(selectedSummaryClass.class_short)"
        />
      </div>
  
      <div v-if="activeReportTab === 'single-class-summary' && selectedStudent" class="mb-3">
        <StudentAttendanceDetails
          :selectedStudent="selectedStudent"
          :rows="singleStudentAttendance"
          :grouped="groupedAttendance"
          :statusByDate="statusByDate"
          :viewMode="attendanceViewMode"
          :loading="loadingStudentAttendance"
          @changeView="attendanceViewMode = $event"
          @close="closeSingleStudentAttendance"
        />
      </div>
  
      <div v-if="activeReportTab === 'single-class-summary' && singleClassReport?.students?.length && !selectedStudent" class="mb-3">
        <StudentWiseReportTable
          :students="singleClassReport.students"
          @details="loadSingleStudentAttendance"
        />
      </div>
  
      <div v-if="activeReportTab === 'monthly' && monthKeys.length" class="mb-3">
        <MonthlyReportTable
          :classes="classes"
          :classWise="reports.classWise"
          :monthKeys="monthKeys"
        />
      </div>
  
      <div v-if="activeReportTab === 'ranking' && reports?.classRanking?.length" class="mb-3">
        <RankingTable
          :rankings="reports.classRanking"
          :classes="classes"
          :classWise="reports.classWise"
        />
      </div>

    </div>

  </div>
</template>



<style scoped>
</style>
