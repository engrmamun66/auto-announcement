
<script setup>
import moment from 'moment/moment'
import { inject, ref, computed, watch, onMounted, onBeforeUnmount, nextTick, provide } from "vue";
import MonthPickerSingle from '../../components/MonthPickerSingle.vue'
import HaziraShowLogRightbar from '../../components/hazira/HaziraShowLogRightbar.vue'

const CONFIG = inject("CONFIG");
const classes = inject("classes");
const all_students_non_copied = inject("all_students_non_copied");
const callbacks = inject("callbacks");
const http = inject("http");
const helper = inject("helper");

const STORE_CLASS = 'hazira_class'
const STORE_RANGE = 'hazira_range'
const STORE_SHIFT = 'hazira_shift_'

const _savedClass = localStorage.getItem(STORE_CLASS)
const _savedRange = (() => { try { return JSON.parse(localStorage.getItem(STORE_RANGE)) } catch { return null } })()

const selectedClassShort = ref(_savedClass || null)
const selectedRange = ref(
  Array.isArray(_savedRange) && _savedRange.length === 2
    ? _savedRange
    : [moment().startOf('month').format('YYYY-MM-DD'), moment().endOf('month').format('YYYY-MM-DD')]
)

const log = console.log
const loading = ref(false)
const errorMessage = ref('')
const dailyLogs = ref([])
const todayStr = ref(moment().format('YYYY-MM-DD'))
const hasLoaded = ref(false)
const gridScrollRef = ref(null)
const showScrollControls = ref(false)
const showLogRightbar = ref(false)
const selectedLogEntry = ref(null)
const monthPickerRef = ref(null)

function getSavedShift(classShort) {
  if (!classShort) return 'All'
  try {
    const saved = localStorage.getItem(STORE_SHIFT + classShort)
    if (!saved || saved === 'All') return 'All'
    // Convert to number for shift indices (stored as numbers, retrieved as strings)
    const num = parseInt(saved, 10)
    return isNaN(num) ? 'All' : num
  } catch {
    return 'All'
  }
}

const selectedShift = ref(getSavedShift(_savedClass))

watch(selectedClassShort, (newClassShort) => {
  if (newClassShort) {
    selectedShift.value = getSavedShift(newClassShort)
  }
})

const shifts = computed(() => {
  const shiftList = [{ name: 'All', key: 'All' }]
  const classConfig = selectedClass.value
  const classShifts = classConfig?.shifts

  if (Array.isArray(classShifts) && classShifts.length > 0) {
    classShifts.forEach((shift, idx) => {
      const startTime = moment(shift.start, 'HH:mm').format('hh:mm A')
      const endTime = moment(shift.end, 'HH:mm').format('hh:mm A')
      const duration = `${startTime} - ${endTime}`
      shiftList.push({ name: `Shift ${idx + 1}`, key: idx, time: shift.start, duration })
    })
  }

  return shiftList
})

const weekends = computed(() => CONFIG.value?.settings?.attendance?.weekends || [])

const selectedClass = computed(() => {
  return (classes.value || []).find(c => c.class_short === selectedClassShort.value) || null
})
const classLabel = computed(() => selectedClass.value?.class_name || selectedClassShort.value || '-')
const monthLabel = computed(() => {
  const start = selectedRange.value?.[0]
  return start ? moment(start, 'YYYY-MM-DD').format('MMMM YYYY') : ''
})

function getClassStudents(classShort) {
  if (!classShort) return []
  return (all_students_non_copied.value || [])
    .filter(s => s.class_short === classShort)
    .map(s => ({
      id: s.id || null,
      name: s.name || s.full_name || s.student_name || '',
      dakhela: s.dakhela,
      class_short: s.class_short,
      class_name: s.class_name || s.class || '',
      profile_image: s.profile_image || null,
    }))
}

const dayColumns = computed(() => {
  const startText = selectedRange.value?.[0]
  const start = moment(startText, 'YYYY-MM-DD')
  if (!start.isValid()) return []
  const monthStart = start.clone().startOf('month')
  const days = monthStart.daysInMonth()
  return Array.from({ length: days }, (_, index) => {
    const dateObj = monthStart.clone().add(index, 'day')
    return {
      date: dateObj.format('YYYY-MM-DD'),
      label: dateObj.format('DD ddd'),
      dayName: dateObj.format('ddd'),
    }
  })
})

const legendItems = [
  { code: 'P', label: 'Present', class: 'status-present' },
  { code: 'A', label: 'Absent', class: 'status-absent' },
  { code: 'L', label: 'Leave', class: 'status-leave' },
  { code: 'W', label: 'Weekend', class: 'status-weekend' },
  { code: 'V', label: 'Vacation', class: 'status-vacation' },
  { code: '-', label: 'Future', class: 'status-future' },
]

function handleMonthChange(dates = []) {
  if (!Array.isArray(dates) || dates.length < 2) return
  selectedRange.value = [dates[0], dates[1]]
  localStorage.setItem(STORE_RANGE, JSON.stringify(selectedRange.value))
}

function handleShiftChange(shiftKey) {
  selectedShift.value = shiftKey
  if (selectedClassShort.value) {
    localStorage.setItem(STORE_SHIFT + selectedClassShort.value, String(shiftKey))
  }
  loadDailyLogs()
}

function handleClassSelect(classShort) {
  if (!classShort) return
  selectedClassShort.value = classShort
  selectedShift.value = getSavedShift(classShort)
  localStorage.setItem(STORE_CLASS, classShort)
  hasLoaded.value = true
  loadDailyLogs(classShort)
}

function resetHaziraState() {
  localStorage.removeItem(STORE_RANGE)
  selectedRange.value = [moment().startOf('month').format('YYYY-MM-DD'), moment().endOf('month').format('YYYY-MM-DD')]
  monthPickerRef.value?.resetToCurrent()
}

function scrollGrid(direction) {
  const el = gridScrollRef.value
  if (!el) return
  const step = Math.max(240, Math.floor(el.clientWidth * 0.6))
  el.scrollBy({ left: direction * step, behavior: 'smooth' })
}

function updateScrollControls() {
  const el = gridScrollRef.value
  if (!el) {
    showScrollControls.value = false
    return
  }
  showScrollControls.value = el.scrollWidth > el.clientWidth + 2
}

function getCellStatus(student, dateStr) {
  return resolveStatus(student?.byDate?.[dateStr], dateStr)
}

function buildLogPayload(student, day) {
  const date = day?.date || null
  const byDate = student?.byDate?.[date] || null
  const status = getCellStatus(student, date)

  return {
    student,
    byDate,
    date,
    text: status.text,
    status,
  }
}

function openShowLog(entry) {
  selectedLogEntry.value = entry
  showLogRightbar.value = true
}
let tartCellStyles = ref({
  style: { }
})
let targetCellEntry = ref(null)

function formatTime(value) {
  if (!value) return '-'
  const time = moment(value, ['HH:mm:ss', 'HH:mm'], true)
  return time.isValid() ? time.format('hh:mm A') : value
}

function startPreview(target, entry, index, isLast) {
  let { top, bottom, left, width } = target.getBoundingClientRect()
  tartCellStyles.value.style['left'] = (left - 140) + 'px'
  tartCellStyles.value.style['top'] = (bottom + -1) + 'px'
  targetCellEntry.value = entry
}

function endPreview() {
  targetCellEntry.value = null
}

function closeShowLog() {
  showLogRightbar.value = false
  selectedLogEntry.value = null
}

function resolveStatus(item, dateStr) {
  if (!dateStr) return { code: '-', text: 'N/A', class: 'status-empty' }
  if (dateStr > todayStr.value) return { code: '-', text: 'Future', class: 'status-future' }

  const leaves = item?.day_leaves || []
  const hasLeave = item?.is_leave_day || leaves.some(l => l?.type === 'leave')
  const hasVacation = leaves.some(l => l?.type === 'vacation')

  if (hasLeave) return { code: 'L', text: 'Leave', class: 'status-leave' }
  if (hasVacation) return { code: 'V', text: 'Vacation', class: 'status-vacation' }
  if (item?.is_weekend) return { code: 'W', text: 'Weekend', class: 'status-weekend' }
  if (item?.is_present) return { code: 'P', text: 'Present', class: 'status-present' }
  if (item?.is_presentable_day === false) return { code: '-', text: 'Holiday', class: 'status-holiday' }
  return { code: 'A', text: 'Absent', class: 'status-absent' }
}

let requestId = 0
async function loadDailyLogs(classShortOverride = null) {
  const classShort = classShortOverride || selectedClassShort.value
  if (!classShort) return
  if (!selectedRange.value?.[0] || !selectedRange.value?.[1]) return
  const students = getClassStudents(classShort)
  if (!students.length) {
    dailyLogs.value = []
    return
  }

  const currentId = ++requestId
  loading.value = true
  errorMessage.value = ''
  try {
    const [start_date, end_date] = selectedRange.value
    const leaveData = await callbacks.getLeavesAndVacations({ start_date, end_date })

    const payload = {
      weekends: weekends.value,
      leaveData,
      all__students: students.map(s => ({
        id: s.id,
        name: s.name,
        dakhela: s.dakhela,
        class_short: s.class_short,
      })),
      class_short: classShort,
      total_days: 0,
    }

    const params = {
      start_date,
      end_date,
      action: 'classwise_data',
      student_ids: students.map(s => s.dakhela).filter(Boolean).join(','),
    }

    if (selectedShift.value !== 'All' && typeof selectedShift.value === 'number') {
      const classConfig = selectedClass.value
      const classShifts = classConfig?.shifts || []
      const selectedShiftConfig = classShifts[selectedShift.value]
      if (selectedShiftConfig?.start) {
        params.selectedShiftTime = selectedShiftConfig.start
      }
    }

    const response = await http.post('/attendence-reports', payload, { params })
    if (currentId !== requestId) return

    const raw = response?.data?.data?.attendance || []
    const dataMap = new Map()
    raw.forEach((list = []) => {
      const first = list?.[0]
      const dakhela = Number(first?.dakhela)
      if (!dakhela) return
      const byDate = {}
      list.forEach(item => {
        if (item?.date) byDate[item.date] = item
      })
      dataMap.set(dakhela, byDate)
    })

    dailyLogs.value = students.map(student => ({
      ...student,
      name: student.name || student.full_name || student.student_name || '-',
      byDate: dataMap.get(Number(student.dakhela)) || {},
    }))
    await nextTick()
    updateScrollControls()

    // Refresh rightbar entry if modal is open (show updated attendance)
    if (showLogRightbar.value && selectedLogEntry.value) {
      const updatedStudent = dailyLogs.value.find(s => s.dakhela === selectedLogEntry.value.student?.dakhela)
      if (updatedStudent) {
        selectedLogEntry.value = buildLogPayload(updatedStudent, {
          date: selectedLogEntry.value.date,
        })
      }
    } 


  } catch (error) {
    if (currentId !== requestId) return
    console.warn('HaziraKhata__error', error)
    errorMessage.value = null// 'Failed to load daily logs.'
    dailyLogs.value = []
  } finally {
    if (currentId === requestId) loading.value = false
  }
}

const getActiveClasses = (list) => (list || []).filter(c => c.isActive !== false)

watch(classes, (list) => {
  if (!selectedClassShort.value) {
    const active = getActiveClasses(list)
    if (active.length) selectedClassShort.value = active[0].class_short
  }
}, { immediate: true })

const selectFistClass = () => {
  if (!selectedClassShort.value) {
    const active = getActiveClasses(classes.value)
    selectedClassShort.value = active[0]?.class_short || null
  }
  if (selectedClassShort.value) {
    hasLoaded.value = true
    loadDailyLogs(selectedClassShort.value)
  }
}

onMounted(() => {
  helper.delay(selectFistClass, 500)
  window.addEventListener('resize', updateScrollControls)
  setTimeout(updateScrollControls, 0)
  setTimeout(updateScrollControls, 1000)
  setTimeout(updateScrollControls, 1500)
})

onBeforeUnmount(() => {
  window.removeEventListener('resize', updateScrollControls)
})

watch(
  () => [selectedRange.value?.[0], selectedRange.value?.[1]],
  () => {
    if (hasLoaded.value && selectedClassShort.value) {
      loadDailyLogs(selectedClassShort.value)
    }
  }
)

watch(
  () => [dayColumns.value.length, dailyLogs.value.length],
  async () => {
    await nextTick()
    updateScrollControls()
  }
)
</script>

<template>
  <div class="daily-log-wrapper print-area" style="min-height: 100vh;">
    <div class="d-flex justify-content-between align-items-start flex-wrap gap-2 only-show-onprint">
      <div class="daily-log-heading">
        <div class="daily-log-title">Hazira Khata :: {{ classLabel }}</div>
        <div class="daily-log-subtitle">{{ monthLabel }}</div>
      </div>
      <div class="daily-log-controls"></div>
    </div>

    <hr class="only-show-onprint">

    <div class="bg-dark-subtle border class-button-list hide_onprint p-3 radius-10">
        <button
            v-for="(cls, index) in getActiveClasses(classes)"
            :key="index"
            type="button"
            class="class-button"
            :class="{ active: cls.class_short === selectedClassShort }"
            @click="handleClassSelect(cls.class_short)"
        >
            {{ cls.class_name }}
        </button>
    </div>

    <!-- Shift Tabs + Legend + Controls (Single Line) -->
    <div class="hazira-controls-bar hide_onprint">
      <!-- Shifts -->
      <div class="hazira-shifts-section">
        <button
          v-for="shift in shifts"
          :key="shift.key"
          class="shift-tab"
          :class="{ active: selectedShift === shift.key }"
          @click="handleShiftChange(shift.key)"
        >
          <div class="shift-tab-name">{{ shift.name }}</div>
          <div class="shift-tab-time">{{ shift.duration || `All Shifts` }}</div>
        </button>
      </div>

      <!-- Legend -->
      <div class="hazira-legend-section">
        <div v-for="item in legendItems" :key="item.code" class="legend-item-inline">
          <span class="legend-badge" :class="item.class">{{ item.code }}</span>
          <span class="legend-label-text" :tooltip="helper.t(item.label)" style="--tfsize:11px" flow="right" >{{ item.label }}</span>
        </div>
      </div>

      <!-- Controls -->
      <div class="hazira-actions-section">
        <div v-if="showScrollControls" class="legend-scroll-controls">
          <button type="button" class="legend-scroll-btn" @click="scrollGrid(-1)" aria-label="Scroll left">
            <i class='bx bx-chevron-left'></i>
          </button>
          <button type="button" class="legend-scroll-btn" @click="scrollGrid(1)" aria-label="Scroll right">
            <i class='bx bx-chevron-right'></i>
          </button>
        </div>
        <button class="hazira-reset-btn" :tooltip="'Reset to first class & current month'" flow="left" @click="resetHaziraState"><i class='bx bx-reset'></i></button>
        <MonthPickerSingle ref="monthPickerRef" :onChange="handleMonthChange" />
      </div>
    </div>

    <div v-if="loading" class="text-muted mt-2">{{ helper.t('Loading daily logs...') }}</div>
    <div v-else-if="errorMessage" class="text-danger mt-2" >{{ errorMessage }}</div>

    <div v-else class="daily-grid-wrapper" ref="gridScrollRef">
      <div class="daily-grid" :style="{ '--day-count': dayColumns.length }">
        <div class="daily-grid-row daily-grid-header">
          <div class="daily-grid-cell sticky-col sticky-head">{{ helper.t('Students Name') }}</div>
          <div v-for="day in dayColumns" :key="day.date" class="daily-grid-cell day-header" :title="day.dayName">
            {{ day.label }}
          </div>
        </div>

        <div v-for="(student, index) in dailyLogs" :key="student.dakhela" class="daily-grid-row">
          <div class="daily-grid-cell sticky-col student-cell">
            <div class="student-name">{{ student.name || '-' }} ({{ student.dakhela  }})</div>
          </div>
          <div v-for="(day, index2) in dayColumns" :key="day.date" class="daily-grid-cell day-cell">
            <div
              class="status-cell"
              :class="{ 'is-interactive': getCellStatus(student, day.date).code !== '-' }"
            >
              <span
                class="status-pill"
                :class="getCellStatus(student, day.date).class"
                :tooltip="getCellStatus(student, day.date).code !== '-' ? getCellStatus(student, day.date).text : ''"
                :flow="index === 0 ? 'left' : 'up'"
                style="--tfsize:11px"
              >
                {{ getCellStatus(student, day.date).code }}
              </span>

              <button v-if="getCellStatus(student, day.date).code !== '-'"
                type="button"
                class="status-menu-toggle"
                :tooltip="getCellStatus(student, day.date).code !== '-' ? getCellStatus(student, day.date).text : ''"
                :flow="index === 0 ? 'left' : 'up'"
                :aria-label="`Show log for ${student.name || 'student'} on ${day.date}`"
                @click.stop="openShowLog(buildLogPayload(student, day))"
                @mouseover.stop="startPreview($event.target, buildLogPayload(student, day), index, index === dailyLogs.length - 1)"
                @mouseleave.stop="endPreview()"
                @auxclick="log({
                  student,
                  date: day.date,
                  text: getCellStatus(student, day.date).code,
                })"
              >
                <i class='bx bx-info-circle nc'></i>
              </button>
            </div>
          </div>
        </div>

        <div v-if="!dailyLogs.length" class="daily-grid-empty text-center text-muted">
          No data found.
        </div>
      </div>
    </div>

    <HaziraShowLogRightbar
      v-if="showLogRightbar && selectedLogEntry"
      :entry="selectedLogEntry"
      @unmount="closeShowLog"
      @attendance-submitted="loadDailyLogs(selectedClassShort)"
    />

    <template v-if="targetCellEntry">
    <!-- <template v-if="true"> -->
      <div id="quick_details" v-bind="tartCellStyles">
        <div class="qd-header">
          <div class="qd-name">{{ targetCellEntry.student?.name }}</div>
          <div class="qd-date">{{ moment(targetCellEntry.date).format('DD MMM YYYY') }}</div>
        </div>
        <div class="qd-shifts">
          <template v-if="targetCellEntry.byDate?.shiftInfo?.length">
            <div v-for="(shift, idx) in targetCellEntry.byDate.shiftInfo" :key="idx" class="qd-shift-item">
              <div class="qd-shift-label">Shift {{ idx + 1 }}</div>
              <div class="qd-shift-time">
                <div class="qd-time-item">
                  <span class="qd-time-label">In:</span>
                  <span class="qd-time-val">{{ formatTime(shift?.attendance?.in_time) }}</span>
                </div>
                <div class="qd-time-item">
                  <span class="qd-time-label">Out:</span>
                  <span class="qd-time-val">{{ formatTime(shift?.attendance?.out_time)}}</span>
                </div>
              </div>
              <!-- <div v-if="shift.is_present" class="qd-status present">Present</div>
              <div v-else class="qd-status absent">Absent</div> -->
            </div>
          </template>
          <template v-else>
            <div class="qd-no-shifts">No shifts</div>
          </template>
        </div>
      </div>
    </template>

  </div>
</template>

<style scoped>
.daily-log-wrapper{
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.daily-log-heading{
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.daily-log-title{
  font-weight: 700;
  font-size: 18px;
  color: #111827;
}

.daily-log-subtitle{
  font-size: 12px;
  color: #6b7280;
}

.daily-log-controls{
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
  justify-content: flex-end;
}

.class-button-list{
    display: flex;
    gap: 6px;
    flex-wrap: wrap;
    flex-direction: row;
    align-items: center;
    justify-content: center;
}

.class-button{
  border: 1px solid #e5e7eb;
  background: #ffffff;
  color: #374151;
  padding: 6px 12px;
  border-radius: 999px;
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  transition: background-color 0.15s ease, color 0.15s ease, border-color 0.15s ease;
}

.class-button:hover{
  background: #f3f4f6;
}

.class-button.active{
  background: #111827;
  border-color: #111827;
  color: #ffffff;
}

.daily-report-title{
  background: #ffffff;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  padding: 10px 14px;
}

.daily-report-title__main{
  font-weight: 800;
  font-size: 16px;
  color: #111827;
}

.daily-report-title__meta{
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 4px;
}

.meta-pill{
  background: #f3f4f6;
  color: #374151;
  padding: 3px 10px;
  border-radius: 999px;
  font-size: 12px;
  font-weight: 600;
}

.hazira-controls-bar {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 4px 0;
  border-bottom: 1px solid #e5e7eb;
  margin-bottom: 4px;
  flex-wrap: nowrap;
  overflow-x: auto;
}

.hazira-shifts-section {
  display: flex;
  gap: 4px;
  align-items: center;
  flex-shrink: 0;
}

.hazira-legend-section {
  display: flex;
  gap: 8px;
  align-items: center;
  flex-wrap: wrap;
  flex-grow: 1;
  padding: 0 8px;
  border-left: 1px solid #e5e7eb;
  border-right: 1px solid #e5e7eb;
  min-width: 200px;
}

.hazira-actions-section {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-shrink: 0;
}

.legend-item-inline {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  font-size: 11px;
  color: #374151;
  white-space: nowrap;
}

.legend-label-text {
  font-size: 11px;
}

.legend-scroll-controls{
  display: inline-flex;
  align-items: center;
  gap: 6px;
}

.legend-scroll-btn{
  width: 34px;
  height: 34px;
  border: 1px solid #e5e7eb;
  border-radius: 999px;
  background: #ffffff;
  color: #111827;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
  cursor: pointer;
  transition: background-color 0.15s ease, transform 0.1s ease, border-color 0.15s ease;
}

.legend-scroll-btn:hover{
  background: #f3f4f6;
}

.legend-scroll-btn:active{
  transform: translateY(1px);
}
.hazira-reset-btn {
  background: #fff; border: 1px solid #e5e7eb; border-radius: 6px;
  padding: 4px 7px; cursor: pointer; color: #6b7280; font-size: 15px;
  display: inline-flex; align-items: center;
}
.hazira-reset-btn:hover { background: #fef3f2; color: #e53e3e; border-color: #fca5a5; }

.legend-item{
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  color: #374151;
}

.legend-badge{
  width: 22px;
  height: 22px;
  border-radius: 6px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  font-size: 11px;
  color: #ffffff;
}

.daily-grid-wrapper{
  border-radius: 12px;
  overflow: auto;
  border: 1px solid #e5e7eb;
  background: #ffffff;
}

.daily-grid{
  min-width: 900px;
  display: grid;
  gap: 0;
}

.daily-grid-row{
  display: grid;
  grid-template-columns: 200px repeat(var(--day-count), 36px);
  border-bottom: 1px solid #e5e7eb;
}

.daily-grid-header{
  position: sticky;
  top: 0;
  z-index: 2;
  background: #f8fafc;
  border-bottom: 1px solid #e5e7eb;
}

.daily-grid-cell{
  padding: 6px 4px;
  border-right: 1px solid #f1f5f9;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 11px;
}

.daily-grid-empty{
  padding: 18px 10px;
}

.day-header{
  font-weight: 600;
}

.sticky-col{
  position: sticky;
  left: 0;
  background: #ffffff;
  z-index: 1;
  text-align: left;
  justify-content: flex-start;
  padding-left: 10px;
}

.sticky-head{
  z-index: 3;
  background: #f8fafc;
}

.student-cell{
  display: flex;
  align-items: flex-start;
  flex-direction: column;
  gap: 2px;
}

.student-name{
  font-weight: 600;
  font-size: 12px;
  color: #111827;
}
 
.day-cell{
  padding: 0px;
  position: relative;
  overflow: visible;
}

.status-cell{
  width: 100%;
  height: 100%;
  min-height: 34px;
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  isolation: isolate;
}

.status-cell::before{
  content: '';
  position: absolute;
  inset: 3px;
  border-radius: 10px;
  background:
    radial-gradient(circle at top, rgba(255, 255, 255, 0.22), rgba(255, 255, 255, 0.04) 65%),
    rgba(15, 23, 42, 0.12);
  -webkit-backdrop-filter: blur(8px);
  backdrop-filter: blur(8px);
  opacity: 0;
  transform: translateY(7px) scale(0.9);
  transition: opacity 0.18s ease, transform 0.24s cubic-bezier(0.22, 1, 0.36, 1);
  pointer-events: none;
  z-index: 1;
}

.status-pill{
  width: 100%;
  height: 100%;
  border-radius: 0px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  font-size: 11px;
  color: #fff;
  position: relative;
  z-index: 0;
  transition: transform 0.2s ease, filter 0.2s ease, opacity 0.2s ease;
}

.status-cell.is-interactive:hover::before,
.status-cell.is-interactive:focus-within::before{
  opacity: 1;
  transform: translateY(0) scale(1);
}

.status-cell.is-interactive:hover .status-pill,
.status-cell.is-interactive:focus-within .status-pill{
  filter: brightness(0.84) saturate(0.86);
  opacity: 0.9;
}

.status-menu-toggle{
  position: absolute;
  top: 50%;
  left: 50%;
  width: 37px;
  height: 37px;
  padding: 0;
  border: 1px solid rgba(255, 255, 255, 0.42);
  border-radius: 0px;
  background:
    linear-gradient(180deg, rgba(255, 255, 255, 0.18), rgba(255, 255, 255, 0.04)),
    rgba(15, 23, 42, 0.34);
  -webkit-backdrop-filter: blur(12px);
  backdrop-filter: blur(12px);
  color: #ffffff;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-size: 15px;
  line-height: 1;
  cursor: pointer;
  opacity: 0;
  visibility: hidden;
  pointer-events: none;
  transform: translate(-50%, calc(-50% + 12px)) scale(0.84);
  box-shadow:
    0 10px 24px rgba(15, 23, 42, 0.18),
    inset 0 1px 0 rgba(255, 255, 255, 0.14);
  transition:
    opacity 0.18s ease,
    transform 0.22s cubic-bezier(0.22, 1, 0.36, 1),
    visibility 0.18s ease,
    background-color 0.15s ease,
    box-shadow 0.15s ease;
  z-index: 4;
}

.status-cell.is-interactive:hover .status-menu-toggle,
.status-cell.is-interactive:focus-within .status-menu-toggle{
  opacity: 1;
  visibility: visible;
  pointer-events: auto;
  transform: translate(-50%, -50%) scale(1);
}

.status-menu-toggle:hover{
  background:
    linear-gradient(180deg, rgba(255, 255, 255, 0.26), rgba(255, 255, 255, 0.06)),
    rgba(15, 23, 42, 0.44);
  transform: translate(-50%, -50%) scale(1.06);
  box-shadow:
    0 14px 30px rgba(15, 23, 42, 0.24),
    inset 0 1px 0 rgba(255, 255, 255, 0.18);
}

.status-menu-toggle i{
  transform: translateY(0.5px);
}

.status-present{
  background: #16a34a;
}

.status-absent{
  background: #dc2626;
}

.status-leave{
  background: #f59e0b;
  color: #111827;
}

.status-weekend{
  background: #64748b;
}

.status-vacation{
  background: #7c3aed;
}

.status-future{
  background: #e5e7eb;
  color: #6b7280;
}

.status-holiday{
  background: #94a3b8;
}

.status-empty{
  background: #cbd5f5;
}

@media print {
  .status-pill,
  .status-present,
  .status-absent,
  .status-leave,
  .status-weekend,
  .status-vacation,
  .status-future,
  .status-holiday,
  .status-empty{
    -webkit-print-color-adjust: exact;
    print-color-adjust: exact;
    color: #ffffff !important;
  }
  .status-present{ background: #16a34a !important; }
  .status-absent{ background: #dc2626 !important; }
  .status-leave{ background: #f59e0b !important; }
  .status-weekend{ background: #64748b !important; }
  .status-vacation{ background: #7c3aed !important; }
  .status-future{ background: #e5e7ebb5 !important; }
  .status-holiday{ background: #94a3b8 !important; }
  .status-empty{ background: #cbd5f5 !important; }
  .status-menu-toggle,
  .status-menu{
    display: none !important;
  }
}

@media (hover: none) {
  .status-menu-toggle{
    opacity: 1;
    transform: scale(1);
  }
}

@media (max-width: 768px) {
  .daily-log-controls{
    justify-content: flex-start;
  }
  .class-button-list{
    max-width: 100%;
  }
}

/* Shift Tabs */
.shift-tab {
  border: 1px solid #e5e7eb;
  background: #ffffff;
  color: #374151;
  padding: 6px 10px;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  transition: background-color 0.15s ease, color 0.15s ease, border-color 0.15s ease;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
}

.shift-tab:hover {
  background: #f3f4f6;
  border-color: #d1d5db;
}

.shift-tab.active {
  background: #111827;
  border-color: #111827;
  color: #ffffff;
}

.shift-tab-name {
  font-size: 12px;
  font-weight: 600;
}

.shift-tab-time {
  font-size: 10px;
  font-weight: 400;
  opacity: 0.8;
}

#quick_details{
  position: fixed;
  z-index: 9;
  width: 280px;
  background-color: white;
  padding: 12px;
  border-radius: 6px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  font-size: 13px;
}

.qd-header {
  margin-bottom: 10px;
  padding-bottom: 8px;
  border-bottom: 1px solid #e5e7eb;
}

.qd-name {
  font-weight: 700;
  font-size: 13px;
  color: #111827;
  margin-bottom: 4px;
}

.qd-date {
  font-size: 11px;
  color: #6b7280;
}

.qd-shifts {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.qd-shift-item {
  padding: 8px;
  background-color: #f9fafb;
  border-radius: 4px;
  border-left: 3px solid #3b82f6;
}

.qd-shift-label {
  font-weight: 600;
  font-size: 12px;
  color: #1f2937;
  margin-bottom: 4px;
}

.qd-shift-time {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 8px;
  font-size: 12px;
  margin-bottom: 4px;
}

.qd-time-item {
  display: flex;
  align-items: center;
  gap: 4px;
}

.qd-time-label {
  font-weight: 600;
  color: #6b7280;
  min-width: 28px;
}

.qd-time-val {
  font-weight: 700;
  color: #1f2937;
}

.qd-status {
  font-size: 11px;
  font-weight: 600;
  padding: 2px 6px;
  border-radius: 3px;
  display: inline-block;
}

.qd-status.present {
  background-color: #d1fae5;
  color: #065f46;
}

.qd-status.absent {
  background-color: #fee2e2;
  color: #7f1d1d;
}

.qd-no-shifts {
  padding: 8px;
  color: #9ca3af;
  font-size: 12px;
  text-align: center;
}

</style>
