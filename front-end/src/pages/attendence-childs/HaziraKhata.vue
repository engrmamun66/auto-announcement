
<script setup>
import moment from 'moment/moment'
import { inject, ref, computed, watch, onMounted, onBeforeUnmount, nextTick } from "vue";
import MonthPickerSingle from '../../components/MonthPickerSingle.vue'

const CONFIG = inject("CONFIG");
const classes = inject("classes");
const all_students_non_copied = inject("all_students_non_copied");
const callbacks = inject("callbacks");
const http = inject("http");

const selectedClassShort = ref(null)
const selectedRange = ref([
  moment().startOf('month').format('YYYY-MM-DD'),
  moment().endOf('month').format('YYYY-MM-DD'),
])

const loading = ref(false)
const errorMessage = ref('')
const dailyLogs = ref([])
const todayStr = ref(moment().format('YYYY-MM-DD'))
const hasLoaded = ref(false)
const gridScrollRef = ref(null)
const showScrollControls = ref(false)

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
  { code: '-', label: 'Future/Closed', class: 'status-future' },
]

function handleMonthChange(dates = []) {
  if (!Array.isArray(dates) || dates.length < 2) return
  selectedRange.value = [dates[0], dates[1]]
}

function handleClassSelect(classShort) {
  if (!classShort) return
  selectedClassShort.value = classShort
  hasLoaded.value = true
  loadDailyLogs(classShort)
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
  } catch (error) {
    if (currentId !== requestId) return
    console.warn('HaziraKhata__error', error)
    errorMessage.value = null// 'Failed to load daily logs.'
    dailyLogs.value = []
  } finally {
    if (currentId === requestId) loading.value = false
  }
}

watch(classes, (list) => {
  if (!selectedClassShort.value && list?.length) {
    selectedClassShort.value = list[0]?.class_short || null
  }
}, { immediate: true })

const selectFistClass = () => {
    if (!selectedClassShort.value && classes.value?.length) {
    selectedClassShort.value = classes.value[0]?.class_short || null
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
  <div class="daily-log-wrapper print-area">
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
            v-for="(cls, index) in classes"
            :key="index"
            type="button"
            class="class-button"
            :class="{ active: cls.class_short === selectedClassShort }"
            @click="handleClassSelect(cls.class_short)"
        >
            {{ cls.class_name }}
        </button>
    </div> 

    <div class="legend-bar">
      <div class="legend-row bg-dark-subtle p-2 radius-10">
        <div v-for="item in legendItems" :key="item.code" class="legend-item">
          <span class="legend-badge" :class="item.class">{{ item.code }}</span>
          <span>{{ item.label }}</span>
        </div>
      </div>
      <div class="legend-actions">
        <div v-if="showScrollControls" class="legend-scroll-controls hide_onprint">
          <button type="button" class="legend-scroll-btn" @click="scrollGrid(-1)" aria-label="Scroll left">
            <i class='bx bx-chevron-left'></i>
          </button>
          <button type="button" class="legend-scroll-btn" @click="scrollGrid(1)" aria-label="Scroll right">
            <i class='bx bx-chevron-right'></i>
          </button>
        </div>
        <MonthPickerSingle :onChange="handleMonthChange" />
      </div>
    </div>

    <div v-if="loading" class="text-muted mt-2">Loading daily logs...</div>
    <div v-else-if="errorMessage" class="text-danger mt-2">{{ errorMessage }}</div>

    <div v-else class="daily-grid-wrapper" ref="gridScrollRef">
      <div class="daily-grid" :style="{ '--day-count': dayColumns.length }">
        <div class="daily-grid-row daily-grid-header">
          <div class="daily-grid-cell sticky-col sticky-head">Students Name</div>
          <div v-for="day in dayColumns" :key="day.date" class="daily-grid-cell day-header" :title="day.dayName">
            {{ day.label }}
          </div>
        </div>

        <div v-for="student in dailyLogs" :key="student.dakhela" class="daily-grid-row">
          <div class="daily-grid-cell sticky-col student-cell">
            <div class="student-name">{{ student.name || '-' }} ({{ student.dakhela  }})</div>
          </div>
          <div v-for="day in dayColumns" :key="day.date" class="daily-grid-cell day-cell">
            <span
              class="status-pill"
              :class="resolveStatus(student.byDate?.[day.date], day.date).class"
              :title="resolveStatus(student.byDate?.[day.date], day.date).text"
            >
              {{ resolveStatus(student.byDate?.[day.date], day.date).code }}
            </span>
          </div>
        </div>

        <div v-if="!dailyLogs.length" class="daily-grid-empty text-center text-muted">
          No data found.
        </div>
      </div>
    </div>
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

.legend-bar{
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  flex-wrap: wrap;
}

.legend-row{
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  align-items: center;
}

.legend-actions{
  display: inline-flex;
  align-items: center;
  justify-content: flex-end;
  gap: 8px;
  flex-wrap: wrap;
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
  min-width: 100vh;
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
}

@media (max-width: 768px) {
  .daily-log-controls{
    justify-content: flex-start;
  }
  .class-button-list{
    max-width: 100%;
  }
}
</style>
