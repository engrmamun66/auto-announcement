<script setup>
import moment from 'moment/moment'
import { inject, ref, onMounted, computed } from "vue";
import MonthPicker from './../../../components/MonthPicker.vue'
import ReportTabs from '../../../components/reports/ReportTabs.vue'
import BackToPrevious from '../../../components/reports/BackToPrevious.vue'
import SummaryTable from '../../../components/reports/SummaryTable.vue'
import StudentWiseReportTable from '../../../components/reports/StudentWiseReportTable.vue'
import StudentMonthlyReportTable from '../../../components/reports/StudentMonthlyReportTable.vue'
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
  if (activeReportTab.value === 'single-class-summary' && selectedSummaryClass.value) {
    await loadSingleClassSummaryReport(selectedSummaryClass.value.class_short, dates)
    if (selectedStudent.value) {
      await loadSingleStudentAttendance(selectedStudent.value)
    }
  }
  if (selectedStudentMonth.value && !studentMonthKeys.value.includes(selectedStudentMonth.value)) {
    selectedStudentMonth.value = null
  }
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
let selectedStudentMonth = ref(null)
let singleStudentAttendance = ref([])
let loadingStudentAttendance = ref(false)
let attendanceViewMode = ref('compact') // details | compact
let reportLeaves = ref([])

const reportTitle = computed(() => {
  if (activeReportTab.value === 'single-class-summary' && selectedSummaryClass.value) {
    return `${selectedSummaryClass.value.class_name || selectedSummaryClass.value.class_short} Summary`
  }
  if (activeReportTab.value === 'monthly') return 'Monthly Report'
  if (activeReportTab.value === 'ranking') return 'Ranking Report'
  return 'Attendance Summary'
})

const printDate = computed(() => moment().format('DD MMMM, Y - hh:mm A'))

const studentMonthKeys = computed(() => {
  if (!selectedStudent.value) return []
  const start = moment(defaultStart.value, 'YYYY-MM-DD').startOf('month')
  const end = getEffectiveEndDate().startOf('month')
  if (end.isBefore(start, 'month')) return []
  const keys = []
  let cur = start.clone()
  while (cur.isSameOrBefore(end, 'month')) {
    keys.push(cur.format('YYYY-MM-01'))
    cur.add(1, 'month')
  }
  return keys
})

const breadcrumbs = computed(() => {
  const items = []

  if (activeReportTab.value === 'single-class-summary') {
    items.push({
      label: 'Summary',
      onClick: () => {
        closeSingleStudentAttendance()
        closeClassSummary()
      },
    })

    if (selectedSummaryClass.value) {
      items.push({
        label: selectedSummaryClass.value.class_name || selectedSummaryClass.value.class_short || 'Class',
        onClick: () => {
          activeReportTab.value = 'single-class-summary'
          selectedStudent.value = null
          selectedStudentMonth.value = null
          singleStudentAttendance.value = []
          attendanceViewMode.value = 'compact'
          if (!singleClassReport.value) {
            loadSingleClassSummaryReport(selectedSummaryClass.value.class_short, [defaultStart.value, defaultEnd.value])
          }
        },
      })

      items.push({
        label: 'Students',
        onClick: () => {
          activeReportTab.value = 'single-class-summary'
          selectedStudent.value = null
          selectedStudentMonth.value = null
          singleStudentAttendance.value = []
          attendanceViewMode.value = 'compact'
          if (!singleClassReport.value) {
            loadSingleClassSummaryReport(selectedSummaryClass.value.class_short, [defaultStart.value, defaultEnd.value])
          }
        },
      })

      if (selectedStudent.value) {
        items.push({
          label: selectedStudent.value.name || selectedStudent.value.dakhela || 'Student',
          onClick: selectedStudentMonth.value ? () => {
            selectedStudentMonth.value = null
            attendanceViewMode.value = 'compact'
          } : null,
        })
        if (selectedStudentMonth.value) {
          items.push({
            label: moment(selectedStudentMonth.value).format('MMMM YYYY'),
            onClick: null,
          })
        }
      }
    }

    return items
  }

  const tabLabel = reportTabs.find(tab => tab.key === activeReportTab.value)?.label || 'Summary'
  items.push({ label: tabLabel, onClick: null })
  return items
})

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
  selectedStudentMonth.value = null
  singleStudentAttendance.value = []
  attendanceViewMode.value = 'compact'
  loadSingleClassSummaryReport(cls.class_short, [defaultStart.value, defaultEnd.value])
}

function closeClassSummary(){
  selectedSummaryClass.value = null
  singleClassReport.value = null
  activeReportTab.value = 'summary'
  selectedStudent.value = null
  selectedStudentMonth.value = null
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
  reportLeaves.value = leaves_and_vacations || []
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
  reportLeaves.value = leaves_and_vacations || []
}  

async function loadSingleStudentAttendance(std){
  if(!std?.dakhela) return
  selectedStudent.value = std
  selectedStudentMonth.value = null
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
  selectedStudentMonth.value = null
  attendanceViewMode.value = 'compact'
}

function goBackOneStep(){
  if (selectedStudentMonth.value) {
    selectedStudentMonth.value = null
    attendanceViewMode.value = 'compact'
    return
  }
  if (selectedStudent.value) {
    selectedStudent.value = null
    singleStudentAttendance.value = []
    attendanceViewMode.value = 'compact'
    return
  }
  if (selectedSummaryClass.value) {
    closeClassSummary()
  }
}

const filteredStudentAttendance = computed(() => {
  if(!selectedStudentMonth.value) return singleStudentAttendance.value || []
  return (singleStudentAttendance.value || []).filter(row => {
    const rowKey = moment(row.date, 'YYYY-MM-DD').startOf('month').format('YYYY-MM-01')
    return rowKey === selectedStudentMonth.value
  })
})

function buildGroupedAttendance(rows=[], class_short){
  if(!rows?.length) return []
  const groups = helper.listGroupBy(rows, 'date')
  return Object.keys(groups).sort().map(date => ({
    date,
    rows: groups[date],
    status: computePresentStatus(groups[date], class_short),
    first_in: getFirstIn(groups[date]),
    last_out: getLastOut(groups[date]),
    max_late: getMaxLate(groups[date]),
  }))
}

const groupedAttendanceAll = computed(() => {
  return buildGroupedAttendance(singleStudentAttendance.value, selectedStudent.value?.class_short)
})

const groupedAttendance = computed(() => {
  return buildGroupedAttendance(filteredStudentAttendance.value, selectedStudent.value?.class_short)
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

const vacationDatesAll = computed(() => {
  const set = new Set()
  ;(reportLeaves.value || []).forEach(l => {
    if(l?.type === 'vacation' && l?.class_short === '_all_' && l?.date){
      set.add(l.date)
    }
  })
  return set
})

const vacationDatesByClass = computed(() => {
  const map = {}
  ;(reportLeaves.value || []).forEach(l => {
    if(l?.type !== 'vacation') return
    if(!l?.class_short || l.class_short === '_all_') return
    if(!map[l.class_short]) map[l.class_short] = new Set()
    if(l.date) map[l.class_short].add(l.date)
  })
  return map
})

function isVacationDate(dateStr, class_short){
  if(vacationDatesAll.value.has(dateStr)) return true
  const set = vacationDatesByClass.value?.[class_short]
  return set ? set.has(dateStr) : false
}

function getEffectiveEndDate(){
  let end = moment(defaultEnd.value, 'YYYY-MM-DD')
  if (end.isSame(moment(), 'month')) {
    end = moment()
  }
  return end
}

function countPresentableDays(startDateStr, endDateStr, class_short){
  const start = moment(startDateStr, 'YYYY-MM-DD')
  const end = moment(endDateStr, 'YYYY-MM-DD')
  if (end.isBefore(start, 'day')) return 0
  let count = 0
  for (let d = start.clone(); d.isSameOrBefore(end, 'day'); d.add(1, 'day')) {
    const dateStr = d.format('YYYY-MM-DD')
    const dayName = d.format('dddd')
    if (weekends.includes(dayName)) continue
    if (isVacationDate(dateStr, class_short)) continue
    count += 1
  }
  return count
}

const studentMonthlySummary = computed(() => {
  if(!selectedStudent.value) return []
  const class_short = selectedStudent.value.class_short
  const months = studentMonthKeys.value || []
  if(!months.length) return []

  const statsByMonth = {}
  groupedAttendanceAll.value.forEach(g => {
    const key = moment(g.date, 'YYYY-MM-DD').startOf('month').format('YYYY-MM-01')
    if(!statsByMonth[key]) statsByMonth[key] = { presentDays: 0, lateDays: 0, lateMinutes: 0 }
    const dayName = moment(g.date, 'YYYY-MM-DD').format('dddd')
    const isPresentable = !weekends.includes(dayName) && !isVacationDate(g.date, class_short)
    if(isPresentable){
      if(g.status === 'Present') statsByMonth[key].presentDays += 1
      const late = Number(g.max_late || 0)
      if(late > 0){
        statsByMonth[key].lateDays += 1
        statsByMonth[key].lateMinutes += late
      }
    }
  })

  const effectiveEnd = getEffectiveEndDate()

  return months.map(monthKey => {
    const monthStart = moment(monthKey, 'YYYY-MM-DD').startOf('month')
    const monthEnd = monthStart.clone().endOf('month')
    const rangeStart = moment.max(monthStart, moment(defaultStart.value, 'YYYY-MM-DD'))
    const rangeEnd = moment.min(monthEnd, effectiveEnd)
    const presentable_days = countPresentableDays(
      rangeStart.format('YYYY-MM-DD'),
      rangeEnd.format('YYYY-MM-DD'),
      class_short
    )
    const stats = statsByMonth[monthKey] || { presentDays: 0, lateDays: 0, lateMinutes: 0 }
    const present_percent = presentable_days ? Math.round((stats.presentDays / presentable_days) * 100) : 0
    const avg_late = stats.lateDays ? Math.round(stats.lateMinutes / stats.lateDays) : 0
    return {
      monthKey,
      label: moment(monthKey).format('MMMM - YYYY'),
      present_percent,
      presentable_days,
      late_days: stats.lateDays,
      avg_late,
    }
  })
})

function openStudentMonthDetails(row){
  if(!row?.monthKey) return
  selectedStudentMonth.value = row.monthKey
  attendanceViewMode.value = 'compact'
}



onMounted(()=>{
  loadAllClassSummaryReport([defaultStart.value, defaultEnd.value])
})

</script>


<template>
  <div class="print-area">
    <div v-if="breadcrumbs.length" class="breadcrumb-bar hide_onprint">
      <span v-for="(crumb, idx) in breadcrumbs" :key="'crumb-' + idx" class="breadcrumb-item">
        <button
          v-if="crumb.onClick && idx < breadcrumbs.length - 1"
          type="button"
          class="breadcrumb-link"
          @click="crumb.onClick"
        >
          {{ crumb.label }}
        </button>
        <span v-else class="breadcrumb-current">{{ crumb.label }}</span>
        <span v-if="idx < breadcrumbs.length - 1" class="breadcrumb-sep">&gt;</span>
      </span>
    </div>

    <div class="d-flex justify-content-between align-items-center mb-3 hide_onprint">
      <MonthPicker
        :onChange="handleDateChange"
        :defaultStartValue="defaultStart"
        :defaultEndValue="defaultEnd"
        :dayOfMonth="1"
        :inactiveFutureMonth="true"
      ></MonthPicker>

      <div v-if="activeReportTab === 'single-class-summary'" class="ms-auto">
        <BackToPrevious @click="goBackOneStep" />
      </div>

      <div v-if="activeReportTab !== 'single-class-summary'" class="mb-3">
        <ReportTabs
          :tabs="reportTabs"
          :active="activeReportTab"
          @change="activeReportTab = $event"
        />
      </div>
    </div>

    <div class="print-area----">

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
  
      <div v-if="activeReportTab === 'single-class-summary' && selectedStudent && !selectedStudentMonth" class="mb-3">
        <StudentMonthlyReportTable
          :rows="studentMonthlySummary"
          :selectedStudent="selectedStudent"
          @details="openStudentMonthDetails"
          @close="goBackOneStep"
        />
      </div>

      <div v-if="activeReportTab === 'single-class-summary' && selectedStudent && selectedStudentMonth" class="mb-3">
        <StudentAttendanceDetails
          :selectedStudent="selectedStudent"
          :rows="filteredStudentAttendance"
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
          @details="openClassSummary"
        />
      </div>
  
      <div v-if="activeReportTab === 'ranking' && reports?.classRanking?.length" class="mb-3">
        <RankingTable
          :rankings="reports.classRanking"
          :classes="classes"
          :classWise="reports.classWise"
          @details="openClassSummary"
        />
      </div>

    </div>

  </div>
</template>



<style scoped>
.breadcrumb-bar{
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 10px;
  padding: 6px 10px;
  background: #f8fafc;
  border: 1px solid #e5e7eb;
  border-radius: 10px;
  font-size: 13px;
  color: #6b7280;
}
.breadcrumb-item{
  display: inline-flex;
  align-items: center;
  gap: 8px;
}
.breadcrumb-link{
  background: #ffffff;
  border: 1px solid #e5e7eb;
  padding: 3px 10px;
  border-radius: 999px;
  color: #1f2937;
  font-weight: 600;
  cursor: pointer;
  transition: background-color .15s ease, border-color .15s ease, color .15s ease;
}
.breadcrumb-link:hover{
  background: #f1f5f9;
  border-color: #cbd5e1;
}
.breadcrumb-current{
  background: var(--primaryColor);
  color: #ffffff;
  font-weight: 600;
  padding: 3px 12px;
  border-radius: 999px;
}
.breadcrumb-sep{
  color: #cbd5e1;
}
</style>
