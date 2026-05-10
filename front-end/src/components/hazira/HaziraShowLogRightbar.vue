<script setup>
import moment from 'moment/moment'
import { computed, inject } from 'vue'
import Rightbar from '../Rightbar.vue'

const props = defineProps({
  entry: {
    type: Object,
    default: () => ({}),
  },
})

const emit = defineEmits(['unmount'])
const CONFIG = inject('CONFIG', { value: {} })
const defaultStatus = { code: '-', text: 'N/A', class: 'status-empty' }

const activeEntry = computed(() => props.entry || {})
const student = computed(() => activeEntry.value.student || {})
const dayData = computed(() => activeEntry.value.byDate || {})
const status = computed(() => {
  return activeEntry.value.status || {
    ...defaultStatus,
    text: activeEntry.value.text || defaultStatus.text,
  }
})
const shiftInfo = computed(() => {
  return Array.isArray(dayData.value.shiftInfo) ? dayData.value.shiftInfo : []
})
const leaveEntries = computed(() => {
  const dayLeaves = Array.isArray(dayData.value.day_leaves) ? dayData.value.day_leaves : []
  if (dayLeaves.length) return dayLeaves
  return Array.isArray(dayData.value._leaves) ? dayData.value._leaves : []
})

const classLabel = computed(() => {
  return dayData.value.class_name || student.value.class_name || student.value.class || student.value.class_short || '-'
})

const studentImage = computed(() => resolveImageUrl(student.value.profile_image))
const attendancePresetRule = computed(() => {
  return CONFIG.value?.settings?.attendance?.preset_count_by || 'if_present_in_first_shift'
})
const attendancePresetRuleLabel = computed(() => {
  const preset = String(attendancePresetRule.value || '').trim()

  if (preset === 'if_present_in_first_shift') return 'First shift required'
  if (preset === 'if_present_in_last_shift' || preset === 'if_prent_in_last_shift') return 'Last shift required'
  if (preset === 'if_present_in_all_shifts') return 'All shifts required'
  if (preset === 'if_prent_in_both_shift') return 'First and last shift required'

  const minimumMatch = preset.match(/^if_present_minimum_(?:\{)?(\d+)(?:\})?_shift$/)
  if (minimumMatch) {
    return `Minimum ${minimumMatch[1]} shifts required`
  }

  const specificShiftMatch = preset.match(/^if_present_in_\[(.+)\]$/)
  if (specificShiftMatch) {
    const shifts = specificShiftMatch[1]
      .split(',')
      .map(item => String(item).trim())
      .filter(Boolean)
      .join(', ')

    return shifts ? `Required shifts: ${shifts}` : preset
  }

  return preset
})

const summaryItems = computed(() => {
  const currentDay = dayData.value
  return [
    { label: 'Date', value: activeEntry.value.date || '-' },
    { label: 'Class', value: classLabel.value },
    { label: 'Status', value: status.value.text || '-' },
    { label: 'Weekend', value: currentDay.is_weekend ? 'Yes' : 'No' },
    { label: 'Presentable', value: currentDay.is_presentable_day === false ? 'No' : 'Yes' },
    { label: 'Shift Logs', value: String(shiftInfo.value.length) },
    { label: 'In/Out Count', value: currentDay.in_out_count ?? '-' },
    { label: 'Leave Entries', value: String(leaveEntries.value.length) },
  ]
})

function resolveImageUrl(image) {
  if (!image) return '/default-profile-image.png'
  if (/^https?:\/\//i.test(image) || /^data:/i.test(image)) return image

  const base = globalThis.GLOBAL_DATA?.env?.API_BASE_URL || ''
  if (!base) return image.startsWith('/') ? image : `/${image}`
  return image.startsWith('/') ? `${base}${image}` : `${base}/${image}`
}

function formatDisplayDate(value) {
  if (!value) return '-'
  const date = moment(value, 'YYYY-MM-DD', true)
  return date.isValid() ? date.format('DD MMMM YYYY, dddd') : value
}

function formatTime(value) {
  if (!value) return '-'
  const time = moment(value, ['HH:mm:ss', 'HH:mm'], true)
  return time.isValid() ? time.format('hh:mm A') : value
}

function formatDateTime(value) {
  if (!value) return '-'
  const date = moment(value, ['YYYY-MM-DD HH:mm:ss', moment.ISO_8601], true)
  return date.isValid() ? date.format('DD MMM YYYY, hh:mm A') : value
}

function formatLateMinute(value) {
  if (value === null || value === undefined || value === '') return '-'
  const numeric = Number(value)
  if (Number.isNaN(numeric)) return value
  if (numeric === 0) return 'On time'
  return numeric > 0 ? `${numeric} min late` : `${Math.abs(numeric)} min early`
}

function shiftTitle(shift, index) {
  const shiftNumber = shift?.attendance?.shift_number || index + 1
  return `Shift ${shiftNumber}`
}

function shiftDuration(shift) {
  if (shift?.attendance?.shift_duration) return shift.attendance.shift_duration
  if (shift?.start || shift?.end) return `${shift?.start || '-'} - ${shift?.end || '-'}`
  return '-'
}

function leaveType(leave) {
  return leave?.type || 'leave'
}
</script>

<template>
  <Rightbar
    title="Attendance Log"
    :largestMode="false"
    @unmount="emit('unmount')"
  >
    <div class="hazira-log">
      <div class="log-hero">
        <img class="profile-thumb" :src="studentImage" alt="student profile" />

        <div class="log-hero__body">
          <div class="log-name">{{ student?.name || '-' }}</div>
          <div class="log-meta">ID {{ student?.dakhela || '-' }} · {{ classLabel }}</div>
          <div class="log-date">{{ formatDisplayDate(activeEntry?.date) }}</div>
        </div>

        <div class="log-status" :class="status.class">
          <span class="log-status__code">{{ status.code }}</span>
          <span>{{ status.text }}</span>
        </div>

        <div class="log-rule">
          <span class="log-rule__label">Present Rule</span>
          <span class="log-rule__value">{{ attendancePresetRuleLabel }}</span>
        </div>
      </div>

      <section class="log-section">
        <div class="section-title">Day Summary</div>
        <div class="summary-grid">
          <div v-for="item in summaryItems" :key="item.label" class="summary-card">
            <span>{{ item.label }}</span>
            <strong>{{ item.value }}</strong>
          </div>
        </div>
      </section>

      <section class="log-section">
        <div class="section-title">Shift Logs</div>

        <template v-if="shiftInfo.length">
          <div
            v-for="(shift, index) in shiftInfo"
            :key="shift?.attendance?.id || `${activeEntry?.date}-${index}`"
            class="shift-card"
          >
            <div class="shift-card__head">
              <div>
                <div class="shift-title">{{ shiftTitle(shift, index) }}</div>
                <div class="shift-subtitle">{{ shiftDuration(shift) }}</div>
              </div>

              <span class="shift-state" :class="{ present: shift?.is_present }">
                {{ shift?.is_present ? 'Present' : 'Missing' }}
              </span>
            </div>

            <div class="shift-grid">
              <div>
                <span>In Time</span>
                <strong>{{ formatTime(shift?.attendance?.in_time) }}</strong>
              </div>
              <div>
                <span>Out Time</span>
                <strong>{{ formatTime(shift?.attendance?.out_time) }}</strong>
              </div>
              <div>
                <span>Status</span>
                <strong>{{ shift?.attendance?.status || (shift?.is_present ? 'Present' : 'Absent') }}</strong>
              </div>
              <div>
                <span>Late</span>
                <strong>{{ formatLateMinute(shift?.attendance?.late_in_minute) }}</strong>
              </div>
            </div>

            <div v-if="shift?.attendance?.remarks || shift?.attendance?.created" class="shift-footer">
              <div v-if="shift?.attendance?.remarks" class="shift-remarks">
                {{ shift.attendance.remarks }}
              </div>
              <div v-if="shift?.attendance?.created" class="shift-created">
                Logged {{ formatDateTime(shift.attendance.created) }}
              </div>
            </div>
          </div>
        </template>

        <div v-else class="empty-card">
          No shift logs are available for this date.
        </div>
      </section>

      <section v-if="leaveEntries.length" class="log-section">
        <div class="section-title">Leave Entries</div>

        <div class="leave-list">
          <div
            v-for="(leave, index) in leaveEntries"
            :key="leave?.id || leave?.identity_string || `${activeEntry?.date}-leave-${index}`"
            class="leave-card"
          >
            <div class="leave-card__head">
              <span class="leave-type">{{ leaveType(leave) }}</span>
              <span class="leave-date">{{ leave?.date || activeEntry?.date || '-' }}</span>
            </div>
            <div class="leave-reason">{{ leave?.reason || leave?.title || 'No reason provided' }}</div>
          </div>
        </div>
      </section>
    </div>
  </Rightbar>
</template>

<style scoped>
.hazira-log{
  display: grid;
  gap: 18px;
  color: #0f172a;
}

.log-hero{
  display: grid;
  grid-template-columns: 72px 1fr;
  gap: 14px;
  align-items: center;
  background: #ffffff;
  border: 1px solid #dbe3ef;
  border-radius: 16px;
  padding: 16px;
  box-shadow: 0 14px 32px rgba(15, 23, 42, 0.08);
}

.profile-thumb{
  width: 72px;
  height: 72px;
  border-radius: 18px;
  object-fit: cover;
  background: #ffffff;
  border: 1px solid #dbe3ef;
}

.log-hero__body{
  display: grid;
  gap: 4px;
}

.log-name{
  font-size: 20px;
  font-weight: 800;
  line-height: 1.15;
}

.log-meta,
.log-date{
  font-size: 13px;
  color: #475569;
}

.log-status{
  grid-column: 1 / -1;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  width: fit-content;
  padding: 8px 12px;
  border-radius: 999px;
  font-size: 12px;
  font-weight: 700;
  color: #ffffff;
}

.log-rule{
  grid-column: 1 / -1;
  display: inline-flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 8px;
  padding-top: 6px;
}

.log-rule__label{
  font-size: 11px;
  font-weight: 800;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: #64748b;
}

.log-rule__value{
  display: inline-flex;
  align-items: center;
  padding: 6px 10px;
  border-radius: 999px;
  background: #eff6ff;
  border: 1px solid #bfdbfe;
  color: #1d4ed8;
  font-size: 12px;
  font-weight: 700;
}

.log-status__code{
  width: 22px;
  height: 22px;
  border-radius: 999px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  background: rgba(255, 255, 255, 0.18);
}

.log-section{
  display: grid;
  gap: 10px;
}

.section-title{
  font-size: 13px;
  font-weight: 800;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  color: #475569;
}

.summary-grid{
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(130px, 1fr));
  gap: 10px;
}

.summary-card{
  background: #ffffff;
  border: 1px solid #dbe3ef;
  border-radius: 12px;
  padding: 12px;
  display: grid;
  gap: 6px;
}

.summary-card span,
.shift-grid span{
  font-size: 11px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  color: #64748b;
}

.summary-card strong,
.shift-grid strong{
  font-size: 14px;
  color: #0f172a;
}

.shift-card,
.leave-card,
.empty-card{
  background: #ffffff;
  border: 1px solid #dbe3ef;
  border-radius: 14px;
  padding: 14px;
}

.shift-card{
  display: grid;
  gap: 12px;
}

.shift-card__head,
.leave-card__head{
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 10px;
}

.shift-title{
  font-size: 15px;
  font-weight: 800;
}

.shift-subtitle,
.leave-date,
.shift-created{
  font-size: 12px;
  color: #64748b;
}

.shift-state{
  padding: 6px 10px;
  border-radius: 999px;
  font-size: 11px;
  font-weight: 700;
  background: #fee2e2;
  color: #991b1b;
}

.shift-state.present{
  background: #dcfce7;
  color: #166534;
}

.shift-grid{
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(110px, 1fr));
  gap: 10px;
}

.shift-grid > div{
  display: grid;
  gap: 5px;
}

.shift-footer{
  display: grid;
  gap: 6px;
  padding-top: 10px;
  border-top: 1px dashed #dbe3ef;
}

.shift-remarks,
.leave-reason,
.empty-card{
  font-size: 13px;
  color: #334155;
}

.leave-list{
  display: grid;
  gap: 10px;
}

.leave-type{
  display: inline-flex;
  align-items: center;
  padding: 5px 9px;
  border-radius: 999px;
  background: #fff7ed;
  color: #c2410c;
  font-size: 11px;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: 0.04em;
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
  background: #cbd5e1;
  color: #334155;
}

.status-holiday{
  background: #94a3b8;
}

.status-empty{
  background: #cbd5f5;
  color: #1e293b;
}

@media (max-width: 640px) {
  .log-hero{
    grid-template-columns: 1fr;
  }

  .profile-thumb{
    width: 64px;
    height: 64px;
  }
}
</style>
