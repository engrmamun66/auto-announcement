<script setup>
import moment from 'moment/moment'
import { inject, ref, onMounted, computed, watch } from "vue";
import MonthPicker from './../../../components/MonthPicker.vue'
import ReportTabs from '../../../components/reports/ReportTabs.vue'
import BackToPrevious from '../../../components/reports/BackToPrevious.vue'
import SummaryTable from '../../../components/reports/SummaryTable.vue'
import StudentWiseReportTable from '../../../components/reports/StudentWiseReportTable.vue'
import StudentMonthlyReportTable from '../../../components/reports/StudentMonthlyReportTable.vue'
import StudentMonthlyVacations from '../../../components/reports/StudentMonthlyVacations.vue'
import StudentAttendanceDetails from '../../../components/reports/StudentAttendanceDetails.vue'
import MonthlyReportTable from '../../../components/reports/MonthlyReportTable.vue'
import RankingTable from '../../../components/reports/RankingTable.vue'
import ClassesSummaryChar from '../../../components/reports/ClassesSummaryChar.vue'
import { emitter } from '../../../import-hub';

const CONFIG = inject("CONFIG");
const classes = inject("classes");
const helper = inject("helper");
const callbacks = inject("callbacks");
const route = inject("route");
const getAttendeceReports = inject("getAttendeceReports");
const getAttendeceReportsForSingleClass = inject("getAttendeceReportsForSingleClass");
const all_students_non_copied = inject("all_students_non_copied");
const http = inject("http");

const weekends = computed(() => CONFIG.value?.settings?.attendance?.weekends || []) // ['Friday']
const attendancePresetCountBy = computed(() => {
  return CONFIG.value?.settings?.attendance?.preset_count_by ?? 'if_present_in_first_shift'
})

console.log('=====:::ReportingOverview.vue')

const log = console.log
let defaultStart = ref(route?.query?.start_date || moment().startOf('month').format('Y-MM-DD'))
let defaultEnd = ref(route?.query?.end_date || moment().add(0, 'month').endOf('month').format('Y-MM-DD'))

// Sync query params to localStorage so MonthPicker reads correct values
watch(() => route.query.start_date, (newStartDate) => {
  if (newStartDate) {
    const startMoment = moment(newStartDate, 'YYYY-MM-DD')
    const endMoment = route.query.end_date
      ? moment(route.query.end_date, 'YYYY-MM-DD')
      : startMoment.clone().endOf('month')

    // Set localStorage to override MonthPicker's saved preference
    const payload = {
      startYear: startMoment.year(),
      startMonth: startMoment.month(),
      endYear: endMoment.year(),
      endMonth: endMoment.month(),
    }
    if (typeof window !== 'undefined' && window.localStorage) {
      window.localStorage.setItem('monthPickerRange', JSON.stringify(payload))
    }

    // Also update refs
    defaultStart.value = newStartDate
    defaultEnd.value = endMoment.format('Y-MM-DD')
  }
}, { immediate: true })

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

const activeClasses = computed(() => {
  return (classes.value || []).filter(cls => cls?.isActive !== false)
})

const activeClassShorts = computed(() => {
  return new Set(activeClasses.value.map(cls => cls.class_short))
})

const visibleClassWise = computed(() => {
  return Object.fromEntries(
    Object.entries(reports.value?.classWise || {}).filter(([class_short]) => activeClassShorts.value.has(class_short))
  )
})

const visibleClassRanking = computed(() => {
  return (reports.value?.classRanking || []).filter(class_short => activeClassShorts.value.has(class_short))
})

const hasVisibleClassWise = computed(() => Object.keys(visibleClassWise.value || {}).length > 0)
let activeReportTab = ref('monthly')
watch(activeReportTab, (_activeReportTab) => {
  if (route.query.dev === 'true'){
    console.log({_activeReportTab})
  }
})
const mainReportTabs = ['summary', 'monthly', 'ranking', 'chart2']
let lastMainTab = ref('monthly')
const reportTabs = [
  { key: 'monthly', label: helper.t('Monthly') },
  { key: 'summary', label: helper.t('Summary') },
  { key: 'ranking', label: helper.t('Ranking') },
  { key: 'chart2', label: helper.t('Chart') },
]
let selectedSummaryClass = ref(null)
let singleClassReport = ref(null)
let selectedStudent = ref(null)
let selectedStudentMonth = ref(null)
let singleStudentAttendance = ref([])
let loadingStudentAttendance = ref(false)
let attendanceViewMode = ref('compact') // details | compact
let studentMonthView = ref('attendance') // attendance | vacations
let reportLeaves = ref([])
let studentSearchId = ref(route?.query?.dakhela || '')
let classSearchShort = ref(route?.query?.classShort || '')

// Auto-open student report when dakhela from query param
if (route?.query?.dakhela) {
  onMounted(async () => {
    await new Promise(resolve => setTimeout(resolve, 100))
    openStudentMonthlyById()
  })
}

// Auto-open class summary when classShort from query param
if (route?.query?.classShort) {
  onMounted(async () => {
    await new Promise(resolve => setTimeout(resolve, 100))
    openClassSummaryByShort()
    // Apply type from query param if present
    if (route?.query?.type) {
      const typeMap = {
        'month': 'monthly',
        'summary': 'summary',
        'ranking': 'ranking',
        'chart': 'chart2'
      }
      const reportType = typeMap[route.query.type] || route.query.type
      if (mainReportTabs.includes(reportType)) {
        activeReportTab.value = reportType
      }
    }
  })
}

// Update when query param changes (e.g., from HaziraKhata navigation)
watch(() => route.query.dakhela, (newDakhela) => {
  if (newDakhela && String(newDakhela) !== String(studentSearchId.value)) {
    studentSearchId.value = String(newDakhela)
    helper.delay(openStudentMonthlyById, 100)
  }
})

// Update when classShort query param changes and apply type
watch(() => route.query.classShort, (newClassShort) => {
  if (newClassShort && String(newClassShort) !== String(classSearchShort.value)) {
    classSearchShort.value = String(newClassShort)
    helper.delay(openClassSummaryByShort, 100)
    // Don't change activeReportTab when classShort is set - it will stay in single-class-summary
    // The type param will be passed to StudentWiseReportTable instead
  }
})

// Set report type from query param
watch(() => route.query.type, (newType) => {
  if (newType) {
    const typeMap = {
      'month': 'monthly',
      'summary': 'summary',
      'ranking': 'ranking',
      'chart': 'chart2'
    }
    const reportType = typeMap[newType] || newType
    if (mainReportTabs.includes(reportType)) {
      activeReportTab.value = reportType
    }
  }
}, { immediate: true })

const reportTitle = computed(() => {
  if (activeReportTab.value === 'single-class-summary' && selectedSummaryClass.value) {
    return `${selectedSummaryClass.value.class_name || selectedSummaryClass.value.class_short} ${helper.t('Summary')}`
  }
  if (activeReportTab.value === 'monthly') return helper.t('Monthly Report')
  if (activeReportTab.value === 'ranking') return helper.t('Ranking Report')
  if (activeReportTab.value === 'chart2') return helper.t('Class Summary Chart')
  return helper.t('Attendance Summary')
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
      label: helper.t('Summary'),
      onClick: () => {
        closeSingleStudentAttendance()
        closeClassSummary()
      },
    })

    if (selectedSummaryClass.value) {
      items.push({
        label: selectedSummaryClass.value.class_name || selectedSummaryClass.value.class_short || helper.t('Class'),
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
        label: helper.t('Students'),
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
          label: selectedStudent.value.name || selectedStudent.value.dakhela || helper.t('Student'),
          onClick: selectedStudentMonth.value ? () => {
            selectedStudentMonth.value = null
            attendanceViewMode.value = 'compact'
          } : null,
        })
        if (selectedStudentMonth.value) {
          const startMoment = moment(defaultStart.value, 'YYYY-MM-DD')
          const endMoment = getEffectiveEndDate()
          const monthLabel = startMoment.isValid() && endMoment.isValid()
            ? (startMoment.isSame(endMoment, 'month')
              ? startMoment.format('MMMM YYYY')
              : `${startMoment.format('MMM YYYY')} - ${endMoment.format('MMM YYYY')}`)
            : moment(selectedStudentMonth.value, 'YYYY-MM-DD').format('MMMM YYYY')
          items.push({
            label: monthLabel,
            onClick: null,
          })
        }
      }
    }

    return items
  }

  const tabLabel = reportTabs.find(tab => tab.key === activeReportTab.value)?.label || helper.t('Summary')
  items.push({ label: tabLabel, onClick: null })
  return items
})

const monthKeys = computed(() => {
  let classWise = visibleClassWise.value || {}
  let firstClass = Object.keys(classWise || {})[0]
  if(!firstClass) return []
  return Object.keys(classWise[firstClass] || {}).filter(k => k !== 'total').sort()
})

const studentWiseReportActiveView = computed(() => {
  if (!route?.query?.type) return 'monthly'
  const typeMap = {
    'month': 'monthly',
    'summary': 'summary',
    'chart': 'chart'
  }
  return typeMap[route.query.type] || 'monthly'
})

function getClassReport(class_short, monthKey='total'){
  return visibleClassWise.value?.[class_short]?.[monthKey] || {}
}

async function openStudentMonthlyById(){
  const raw = String(studentSearchId.value || '').trim()
  if(!raw) return
  const found = all_students_non_copied.value.find(s => String(s.dakhela) === raw)
  if(!found) return

  try {
    const leaves = await callbacks.getLeavesAndVacations({
      start_date: defaultStart.value,
      end_date: defaultEnd.value
    })
    reportLeaves.value = leaves || reportLeaves.value
  } catch (error) {
    console.warn('openStudentMonthlyById__leave_error', error)
  }

  const clsInfo = classes.value.find(c => c.class_short === found.class_short) || {}
  selectedSummaryClass.value = clsInfo.class_short ? clsInfo : { class_short: found.class_short, class_name: found.class_short }
  if (mainReportTabs.includes(activeReportTab.value)) {
    lastMainTab.value = activeReportTab.value
  }
  activeReportTab.value = 'single-class-summary'
  selectedStudentMonth.value = null
  singleStudentAttendance.value = []
  attendanceViewMode.value = 'compact'
  loadSingleStudentAttendance(found)
}

function clearStudentSearch(){
  studentSearchId.value = ''
  closeClassSummary()
}

function enrichStudentInfo(std){
  if(!std) return null
  const meta = all_students_non_copied.value.find(s => String(s.dakhela) === String(std.dakhela))
  const class_short = std.class_short || meta?.class_short || null
  const class_name = classes.value.find(c => c.class_short === class_short)?.class_name || meta?.class_name || ''
  return { ...std, class_short, class_name }
}

function openClassSummary(cls){
  if (mainReportTabs.includes(activeReportTab.value)) {
    lastMainTab.value = activeReportTab.value
  }
  selectedSummaryClass.value = cls
  activeReportTab.value = 'single-class-summary'
  selectedStudent.value = null
  selectedStudentMonth.value = null
  singleStudentAttendance.value = []
  attendanceViewMode.value = 'compact'
  loadSingleClassSummaryReport(cls.class_short, [defaultStart.value, defaultEnd.value])
}

function openClassSummaryByShort(){
  const raw = String(classSearchShort.value || '').trim()
  if(!raw) return
  const found = classes.value.find(c => c.class_short === raw)
  if(!found) return
  openClassSummary(found)
  
}

function closeClassSummary(){
  selectedSummaryClass.value = null
  singleClassReport.value = null
  activeReportTab.value = lastMainTab.value || 'summary'
  selectedStudent.value = null
  selectedStudentMonth.value = null
  singleStudentAttendance.value = []
  attendanceViewMode.value = 'compact'
}


// For multiple select of students
async function loadAllClassSummaryReport([start_date, end_date]){
  let leaves_and_vacations = await callbacks.getLeavesAndVacations({start_date, end_date})  

  let payloadData = {
    weekends: weekends.value, 
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
    weekends: weekends.value, 
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
  selectedStudent.value = enrichStudentInfo(std)
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
  studentMonthView.value = 'attendance'
}

function goBackOneStep(){
  if (selectedStudentMonth.value) {
    selectedStudentMonth.value = null
    attendanceViewMode.value = 'compact'
    studentMonthView.value = 'attendance'
    return
  }
  if (selectedStudent.value) {
    selectedStudent.value = null
    singleStudentAttendance.value = []
    attendanceViewMode.value = 'compact'
    if (!singleClassReport.value?.students?.length) {
      closeClassSummary()
    }
    return
  }
  if (selectedSummaryClass.value) {
    closeClassSummary()
  }
}

function setActiveMainTab(tab){
  if (mainReportTabs.includes(tab)) {
    lastMainTab.value = tab
  }
  activeReportTab.value = tab
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
  if(!class_short) return []
  const cls = classes.value.find(c => c.class_short === class_short)
  const shifts = cls?.shifts || []
  return shifts
    .map(shift => {
      if(!shift?.start || !shift?.end) return null
      return `${shift.start} - ${shift.end}`
    })
    .filter(Boolean)
}

function getPresentShiftNumbers(rows = [], class_short){
  const shiftDurations = getShiftDurations(class_short)
  const presentShiftNumbers = new Set()

  ;(rows || []).forEach(row => {
    if(!row) return

    const durationText = typeof row.shift_duration === 'string' ? row.shift_duration.trim() : ''
    let shiftIndex = durationText ? shiftDurations.findIndex(duration => duration === durationText) : -1

    if(shiftIndex === -1){
      const shiftNumber = Number(row.shift_number)
      if(Number.isInteger(shiftNumber) && shiftNumber > 0){
        shiftIndex = shiftNumber - 1
      }
    }

    if(shiftIndex >= 0){
      presentShiftNumbers.add(shiftIndex + 1)
    }
  })

  return Array.from(presentShiftNumbers).sort((a, b) => a - b)
}

function computePresentStatus(rows=[], class_short){
  if(!rows?.length) return helper.t('Absent')
  const shiftDurations = getShiftDurations(class_short)
  if(!shiftDurations.length){
    return rows.length ? helper.t('Present') : helper.t('Absent')
  }
  const presentShiftNumbers = getPresentShiftNumbers(rows, class_short)
  const presentShiftSet = new Set(presentShiftNumbers)
  const totalShifts = shiftDurations.length
  const preset = String(attendancePresetCountBy.value || 'if_present_in_first_shift').trim()

  let isPresent = false

  if(preset === 'if_present_in_last_shift' || preset === 'if_prent_in_last_shift'){
    isPresent = presentShiftSet.has(totalShifts)
  } else if(preset === 'if_present_in_all_shifts'){
    isPresent = totalShifts > 0 && presentShiftNumbers.length >= totalShifts
  } else if(preset === 'if_prent_in_both_shift'){
    isPresent = totalShifts === 1
      ? presentShiftSet.has(1)
      : (presentShiftSet.has(1) && presentShiftSet.has(totalShifts))
  } else {
    const minimumMatch = preset.match(/^if_present_minimum_(?:\{)?(\d+)(?:\})?_shift$/)
    const specificShiftMatch = preset.match(/^if_present_in_\[(.+)\]$/)

    if(minimumMatch){
      const minimumRequired = Math.max(1, Math.min(totalShifts, Number(minimumMatch[1]) || 1))
      isPresent = presentShiftNumbers.length >= minimumRequired
    } else if(specificShiftMatch){
      const requiredShiftNumbers = specificShiftMatch[1]
        .split(',')
        .map(item => Number(String(item).trim()))
        .filter(number => Number.isInteger(number) && number > 0 && number <= totalShifts)

      isPresent = requiredShiftNumbers.length
        ? requiredShiftNumbers.every(number => presentShiftSet.has(number))
        : presentShiftSet.has(1)
    } else {
      isPresent = presentShiftSet.has(1)
    }
  }

  return isPresent ? helper.t('Present') : helper.t('Absent')
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
    if (weekends.value.includes(dayName)) continue
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
  const leavesByMonth = {}
  const rangeStartBound = moment(defaultStart.value, 'YYYY-MM-DD').startOf('day')
  const rangeEndBound = getEffectiveEndDate().endOf('day')
  groupedAttendanceAll.value.forEach(g => {
    const key = moment(g.date, 'YYYY-MM-DD').startOf('month').format('YYYY-MM-01')
    if(!statsByMonth[key]) statsByMonth[key] = { presentDays: 0, lateDays: 0, lateMinutes: 0 }
    const dayName = moment(g.date, 'YYYY-MM-DD').format('dddd')
    const isPresentable = !weekends.value.includes(dayName) && !isVacationDate(g.date, class_short)
    if(isPresentable){
      if(g.status === 'Present') statsByMonth[key].presentDays += 1
      const late = Number(g.max_late || 0)
      if(late > 0){
        statsByMonth[key].lateDays += 1
        statsByMonth[key].lateMinutes += late
      }
    }
  })

  ;(reportLeaves.value || []).forEach(l => {
    if(!l?.date) return
    const dateObj = moment(l.date, 'YYYY-MM-DD')
    if(!dateObj.isValid()) return
    if(dateObj.isBefore(rangeStartBound) || dateObj.isAfter(rangeEndBound)) return
    const key = dateObj.startOf('month').format('YYYY-MM-01')
    if(!leavesByMonth[key]) leavesByMonth[key] = { common: 0, personal: 0 }
    if(l.type === 'vacation'){
      if(!l.class_short || l.class_short === '_all_' || l.class_short === class_short){
        leavesByMonth[key].common += 1
      }
    } else if(l.type === 'leave'){
      if(String(l.student_id) === String(selectedStudent.value.dakhela)){
        leavesByMonth[key].personal += 1
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
    const leaveStats = leavesByMonth[monthKey] || { common: 0, personal: 0 }
    const present_percent = presentable_days ? Math.round((stats.presentDays / presentable_days) * 100) : 0
    const avg_late = stats.lateDays ? Math.round(stats.lateMinutes / stats.lateDays) : 0
    return {
      monthKey,
      label: moment(monthKey).format('MMMM - YYYY'),
      present_percent,
      presentable_days,
      common_leaves: leaveStats.common,
      personal_leaves: leaveStats.personal,
      total_leaves: leaveStats.common + leaveStats.personal,
      late_days: stats.lateDays,
      avg_late,
    }
  })
})

const selectedStudentMonthLabel = computed(() => {
  if(!selectedStudentMonth.value) return ''
  const monthStart = moment(selectedStudentMonth.value, 'YYYY-MM-DD').startOf('month')
  const monthEnd = monthStart.clone().endOf('month')
  const rangeStart = moment.max(monthStart, moment(defaultStart.value, 'YYYY-MM-DD'))
  const rangeEnd = moment.min(monthEnd, getEffectiveEndDate())
  return rangeStart.isSame(rangeEnd, 'month')
    ? rangeStart.format('MMMM YYYY')
    : `${rangeStart.format('MMM YYYY')} - ${rangeEnd.format('MMM YYYY')}`
})

const selectedStudentMonthVacations = computed(() => {
  if(!selectedStudent.value || !selectedStudentMonth.value) return []
  const class_short = selectedStudent.value.class_short
  const studentId = String(selectedStudent.value.dakhela)
  const monthStart = moment(selectedStudentMonth.value, 'YYYY-MM-DD').startOf('month')
  const monthEnd = monthStart.clone().endOf('month')
  const rangeStart = moment.max(monthStart, moment(defaultStart.value, 'YYYY-MM-DD'))
  const rangeEnd = moment.min(monthEnd, getEffectiveEndDate())

  const classLabel = (short) => {
    if(!short || short === '_all_') return helper.t('All Classes')
    const cls = (classes.value || []).find(c => c.class_short === short)
    return cls?.class_name || short
  }

  return (reportLeaves.value || [])
    .filter(l => {
      if(!l?.date) return false
      const dateObj = moment(l.date, 'YYYY-MM-DD')
      if(!dateObj.isValid()) return false
      if(dateObj.isBefore(rangeStart, 'day') || dateObj.isAfter(rangeEnd, 'day')) return false
      if(l.type === 'vacation'){
        return !l.class_short || l.class_short === '_all_' || l.class_short === class_short
      }
      if(l.type === 'leave'){
        return String(l.student_id) === studentId
      }
      return false
    })
    .map(l => ({
      ...l,
      scope: l.type === 'vacation' ? classLabel(l.class_short) : helper.t('Student'),
    }))
    .sort((a, b) => String(a.date).localeCompare(String(b.date)))
})

function openStudentMonthDetails(row){
  if(!row?.monthKey) return
  selectedStudentMonth.value = row.monthKey
  attendanceViewMode.value = 'compact'
  studentMonthView.value = 'attendance'
}

function openStudentMonthVacations(row){
  if(!row?.monthKey) return
  selectedStudentMonth.value = row.monthKey
  studentMonthView.value = 'vacations'
}



onMounted(()=>{

  emitter.on('student_id_for_report', (dakhela_number) => {
    studentSearchId.value = dakhela_number
    openStudentMonthlyById()
  })

  if(route.query.id && /^\d+$/.test(String(route.query.id))){
    studentSearchId.value = Number(route.query.id)
    setTimeout(() => {
      openStudentMonthlyById()
    }, 500);
  }

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
      <div class="d-flex align-items-center gap-2">
        <MonthPicker
          :onChange="handleDateChange"
          :defaultStartValue="defaultStart"
          :defaultEndValue="defaultEnd"
          :dayOfMonth="1"
          :inactiveFutureMonth="true"
        ></MonthPicker>

        <div class="student-search">
          <div class="input-group input-group-sm">
            <input
              v-model="studentSearchId"
              type="search"
              class="form-control"
              :placeholder="helper.t('Student ID')"
              @keyup.enter="openStudentMonthlyById"
              @keyup="(e) => {
                if(e.key == 'Escape'){
                  clearStudentSearch()
                }
              }"
              @change="(e) => { 
                if(!e.target.value){
                  clearStudentSearch()
                }
              }"
            />
            <button
              class="btn btn-outline-secondary"
              type="button"
              :disabled="!studentSearchId"
              @click="openStudentMonthlyById"
            >
              <i class='bx bx-search'></i>
            </button>
            <button
              class="btn btn-outline-secondary"
              type="button"
              :disabled="!studentSearchId"
              @click="clearStudentSearch"
            >
              <i class='bx bx-x'></i>
            </button>
          </div>
        </div>
      </div>

      <div v-if="activeReportTab === 'single-class-summary'" class="ms-auto">
        <BackToPrevious @click="goBackOneStep" />
      </div>

      <div v-if="activeReportTab !== 'single-class-summary'">
        <ReportTabs
          :tabs="reportTabs"
          :active="activeReportTab"
          @change="setActiveMainTab($event)"
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

      <div v-if="activeReportTab === 'summary' && hasVisibleClassWise" class="mb-3">
        <SummaryTable
          :classes="activeClasses"
          :classWise="visibleClassWise"
          @details="openClassSummary"
        />
      </div>
  
      <div v-if="activeReportTab === 'single-class-summary' && selectedStudent && !selectedStudentMonth" class="mb-3">
        <StudentMonthlyReportTable
          :rows="studentMonthlySummary"
          :selectedStudent="selectedStudent"
          @details="openStudentMonthDetails"
          @vacations="openStudentMonthVacations"
          @close="goBackOneStep"
        />
      </div>

      <div v-if="activeReportTab === 'single-class-summary' && selectedStudent && selectedStudentMonth" class="mb-3">
        <StudentAttendanceDetails
          v-if="studentMonthView === 'attendance'"
          :selectedStudent="selectedStudent"
          :rows="filteredStudentAttendance"
          :grouped="groupedAttendance"
          :statusByDate="statusByDate"
          :viewMode="attendanceViewMode"
          :loading="loadingStudentAttendance"
          @changeView="attendanceViewMode = $event"
          @close="closeSingleStudentAttendance"
        />
        <StudentMonthlyVacations
          v-else
          :selectedStudent="selectedStudent"
          :rows="selectedStudentMonthVacations"
          :monthLabel="selectedStudentMonthLabel"
        />
      </div>
  
      <div v-if="activeReportTab === 'single-class-summary' && singleClassReport?.students?.length && !selectedStudent" class="mb-3">
        <StudentWiseReportTable
          :students="singleClassReport.students"
          :monthKeys="monthKeys"
          :activeView="studentWiseReportActiveView"
          @details="loadSingleStudentAttendance"
        />
      </div>
  
      <div v-if="activeReportTab === 'monthly' && monthKeys.length" class="mb-3">
        <MonthlyReportTable
          :classes="activeClasses"
          :classWise="visibleClassWise"
          :monthKeys="monthKeys"
          @details="openClassSummary"
        />
      </div>
  
      <div v-if="activeReportTab === 'ranking' && visibleClassRanking.length" class="mb-3">
        <RankingTable
          :rankings="visibleClassRanking"
          :classes="activeClasses"
          :classWise="visibleClassWise"
          @details="openClassSummary"
        />
      </div>

      <div v-if="activeReportTab === 'chart2' && hasVisibleClassWise" class="mb-3">
        <ClassesSummaryChar
          :classes="activeClasses"
          :classWise="visibleClassWise"
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
.student-search{
  min-width: 180px;
}
.student-search .input-group{
  width: 180px;
}
.student-search .form-control{
  text-align: left;
}
.student-search .form-control,
.student-search .btn{
  height: 40px;
}
.student-search .form-control,
.student-search .btn{
  background-color: #ffffff;
  border-color: #e5e7eb;
}
.student-search .form-control:focus,
.student-search .btn:focus{
  border-color: #d1d5db;
  box-shadow: none;
}
</style>
