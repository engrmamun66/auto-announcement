<template>
  <div :class="{ 'automatic-hidden': isAutomatic }">
    <Rightbar
      ref="RightbarRef"
      v-if="showRightbar"
      :title="helper.t('Fetch Bulk Attendance')"
      @unmount="showRightbar = false; $emit('unmount')"
      :largestMode="false"
    >
    <!-- <div class="alert alert-info small mb-2">
      <div><strong>{{ helper.t('What does this tool do?') }}</strong> {{ helper.t('This shows punch logs from the BioTime device for a selected time range.') }}</div>
      <div><strong>{{ helper.t('How to use:') }}</strong> {{ helper.t('Give start/end time -> press Fetch Logs -> review the list -> press Submit Attendance.') }}</div>
    </div> -->

    <!-- Device Selector -->
    <div v-if="devices.length" class="device-selector-section mb-3">
      <label class="form-label">{{ helper.t('Select Device') }}</label>
      <div class="device-radio-group">
        <label v-for="device in devices" :key="device.id" class="device-radio-label">
          <input
            v-model="selectedDeviceId"
            :value="device.id"
            type="radio"
            class="device-radio-input"
          >
          <span class="device-radio-text">{{ device.name ? device.name + ` (${device.serial_number})` : device.serial_number }}</span>
        </label>
      </div>
    </div>

    <div v-if="!devices.length" class="alert alert-warning mb-3">
      {{ helper.t('No devices found. Please add a device first.') }}
    </div>

    <div v-if="selectedDeviceId" class="row g-3">
      <div class="col-6">
        <label for="">
          {{ helper.t('Start Time') }}
          <input v-model="selectAllTime" type="checkbox"> <span>All</span>
        </label>
        <input v-model="payload.start_time" type="datetime-local" class="form-control cb-input" :disabled="selectAllTime" />
      </div>
      <div class="col-6">
        <label for="">{{ helper.t('End Time') }}</label>
        <input v-model="payload.end_time" type="datetime-local" class="form-control cb-input" :disabled="selectAllTime" />
      </div>

      <div class="col-12">
        <div class="d-flex justify-content-start align-items-center gap-2">
          <Btn class="" @click.stop="fetchLogs" :disabled="fetching">
            <template v-if="fetching">{{ helper.t('Fetch Logs') }} <BtnLoader color="white"></BtnLoader> </template>
            <template v-else>{{ helper.t('Fetch Logs') }}</template>
          </Btn>
          <Btn class="white">Total: <span class="badge text-white bg-secondary">{{ logs.length }}</span></Btn>
          <Btn class="white">Checked: <span class="badge text-white bg-info">{{ selectedIndices.size }}</span></Btn>
          <input
            v-model="searchQuery"
            type="text"
            class="form-control cb-input"
            :placeholder="helper.t('Search by emp code or user id...')"
            style="max-width: 300px"
          />
        </div>
      </div>

      <div class="col-12" v-if="logs.length">
        <div class="table-wrapper small">
          <table class="table table-sm table-striped align-middle">
            <thead>
              <tr>
                <th>
                  <input type="checkbox" v-model="selectAll" @change="toggleSelectAll" />
                </th>
                <th>{{ helper.t('Emp Code') }}</th>
                <th>{{ helper.t('Punch Time') }}</th>
                <th>{{ helper.t('Status') }}</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(item, idx) in previewLogs" :key="'log-' + idx">
                <td>
                  <input type="checkbox" :checked="selectedIndices.has(idx)" @change="toggleSelection(idx)" />
                </td>
                <td>{{ item.emp_code || item.user_id }}</td>
                <td>{{ item.punch_time }}</td>
                <td>
                  <span v-if="hasStudent(item)" class="badge bg-success">{{ helper.t('Matched') }}</span>
                  <span v-else class="badge bg-danger">{{ helper.t('Skipped') }}</span>
                </td>
              </tr>
              <tr v-if="!previewLogs.length">
                <td colspan="4" class="text-center text-muted">
                  {{ searchQuery ? helper.t('No results found for search.') : helper.t('No logs found.') }}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <template #footer>
      <div class="d-flex justify-content-between align-items-center pt-3">
        <div class="text-muted small" v-if="inserting">
          Importing {{ progress.done }} / {{ progress.total }} (Skipped {{ progress.skipped }})
        </div>
        <div class="d-flex gap-2">
          <Btn class="red" @click.stop="clearLogs" :disabled="fetching || inserting">{{ helper.t('Clear') }}</Btn>
          <Btn @click.stop="submitLogs" :disabled="!logs.length || !selectedIndices.size || inserting">
            <template v-if="inserting">{{ helper.t('Submitting...') }}</template>
            <template v-else>{{ helper.t('Submit Attendance') }}</template>
          </Btn>
        </div>

        <div class="d-flex align-items-center gap-2">
          <input type="checkbox" v-model="allowSms" id="allowSms"  />
          <label for="allowSms" class="form-check-label mb-0">{{ helper.t('Send SMS') }}</label>
        </div>

      </div>
    </template>
    </Rightbar>
  </div>
</template>

<script setup>
import moment from 'moment/moment'
import { ref, reactive, inject, computed, onMounted, watch } from 'vue'
import Rightbar from './Rightbar.vue'
import Btn from './Btn.vue'
import BtnLoader from './BtnLoader.vue'

const props = defineProps({
  isAutomatic: { type: Boolean, default: false },
})

const http = inject('http')
const emitter = inject('emitter')
const helper = inject('helper')
const all_students_non_copied = inject('all_students_non_copied')
const makeCarcode = inject('makeCarcode')
const punchToSubmitAttendance = inject('punchToSubmitAttendance')
const storage = inject('storage')

defineEmits(['unmount'])

const showRightbar = ref(true)
const fetching = ref(false)
const inserting = ref(false)
const allowSms = ref(false)
const logs = ref([])
const progress = reactive({ total: 0, done: 0, skipped: 0 })
const devices = ref([])
const selectedDeviceId = ref('')
const selectedIndices = ref(new Set())
const selectAll = ref(false)
const searchQuery = ref('')
const selectAllTime = ref(false)
const previousTimes = ref({ start_time: '', end_time: '' })

const payload = reactive({
  start_time: '',
  end_time: '',
})

watch(selectAllTime, (newVal) => {
  if (newVal) {
    // Save current times before clearing
    previousTimes.value = {
      start_time: payload.start_time,
      end_time: payload.end_time
    }
    payload.start_time = ''
    payload.end_time = ''
  } else {
    // Restore previous times
    payload.start_time = previousTimes.value.start_time
    payload.end_time = previousTimes.value.end_time
  }
})

const selectedDevice = computed(() => {
  return devices.value.find(d => d.id === selectedDeviceId.value)
})

const studentsMap = computed(() => {
  const map = new Map();
  (all_students_non_copied.value || []).forEach((s) => {
    map.set(String(s.dakhela), s)
  })
  return map
})

const filteredLogs = computed(() => {
  if (!searchQuery.value) return logs.value
  const query = searchQuery.value.toLowerCase()
  return logs.value.filter(l => {
    const code = String(l.emp_code || l.user_id || '').toLowerCase()
    return code.includes(query)
  })
})

const previewLogs = computed(() => filteredLogs.value.slice(0, 50)) 

function hasStudent(item){
  return studentsMap.value.has(String(item?.emp_code || item?.user_id))
}

function formatForApi(dt){
  if (!dt) return ''
  return moment(dt).format('YYYY-MM-DD HH:mm:ss')
}

async function fetchLogs({ silent = false } = {}){
  if (!selectedDeviceId.value || !selectedDevice.value) {
    if (!silent) {
      emitter?.emit?.('toaster-error', { message: helper.t('Please select a device.') })
    }
    return 0
  }

  if(selectedDevice.value){
    if (selectAll.value) {
      payload.start_time = ''
      payload.end_time = ''
    }
  } else {
    if (!payload.start_time || !payload.end_time) {
      if (!silent) {
        emitter?.emit?.('toaster-error', { message: helper.t('Start and end time required.') })
      }
      return 0
    }

    // adjust time of payload start_time and end_time

  }
  
  fetching.value = true
  try {
    // Adjust time of payload start_time and end_time
    let adjust_search_time = selectedDevice.value?.adjust_time || `subtract(0, 'hours')`
    const operations = adjust_search_time
    let startTime = formatForApi(payload.start_time)
    let endTime = formatForApi(payload.end_time)

    if (startTime && endTime) {
      try {
        const adjustFn = new Function('moment', 'dateTime', `return moment(dateTime, 'YYYY-MM-DD HH:mm:ss').${operations}`)
        startTime = adjustFn(moment, startTime).format('YYYY-MM-DD HH:mm:ss')
        endTime = adjustFn(moment, endTime).format('YYYY-MM-DD HH:mm:ss')
      } catch (err) {
        console.warn('Time adjustment failed:', err.message)
      }
    }
    const response = await fetch(`/${selectedDevice.value.serial_number}/get-attendance`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ startTime, endTime, adjust_search_time })
    })
    if (response.ok) {
      const data = await response.json()
      logs.value = (data?.data || []).sort((a, b) => new Date(a.punch_time) - new Date(b.punch_time))
    }
  } catch (error) {
    console.warn('fetchLogs_error', error)
    if (!silent) {
      emitter?.emit?.('toaster-error', { message: helper.t('Failed to fetch logs.') })
    }
  } finally {
    fetching.value = false
  }
  return logs.value.length
}

function clearLogs(){
  logs.value = []
  searchQuery.value = ''
  selectedIndices.value.clear()
  selectAll.value = false
  progress.total = 0
  progress.done = 0
  progress.skipped = 0
}

function toggleSelection(idx) {
  if (selectedIndices.value.has(idx)) {
    selectedIndices.value.delete(idx)
  } else {
    selectedIndices.value.add(idx)
  }
  updateSelectAllState()
}

function toggleSelectAll() {
  if (selectAll.value) {
    selectedIndices.value.clear()
    previewLogs.value.forEach((_, idx) => selectedIndices.value.add(idx))
  } else {
    selectedIndices.value.clear()
  }
}

function updateSelectAllState() {
  selectAll.value = selectedIndices.value.size === previewLogs.value.length && previewLogs.value.length > 0
}

async function submitLogs({ skipConfirm = false } = {}){
  // Get selected logs only
  const selectedLogs = Array.from(selectedIndices.value).map(idx => previewLogs.value[idx])

  if (!selectedLogs.length) {
    emitter?.emit?.('toaster-error', { message: helper.t('Please select at least one record to submit.') })
    return
  }

  if (!skipConfirm && !confirm(helper.t('Are you sure to submit {count} logs?', { count: selectedLogs.length }))) return

  inserting.value = true
  progress.total = selectedLogs.length
  progress.done = 0
  progress.skipped = 0

  for (const item of selectedLogs) {
    const student = studentsMap.value.get(String(item?.emp_code || item?.user_id))
    if (!student) {
      progress.skipped += 1
      progress.done += 1
      continue
    }
    const barcode = makeCarcode(student)
    await punchToSubmitAttendance(barcode, {
      source: 'device',
      punch_time: item.punch_time,
      remarks: 'bulk_device_fetch',
      device_index: 0,
      silent_mode: props.isAutomatic,
      skipSms: !allowSms.value,
    })
    progress.done += 1
  }

  inserting.value = false
  storage('last__allow_auto_fetch_date').value = moment().format('Y-MM-DD')
  if (!skipConfirm) {
    emitter?.emit?.('toaster-success', { message: helper.t('Bulk attendance submitted.') })
  }
}

function fetchDevices() {
  http.get('/devices')
    .then((res) => {
      devices.value = res.data.data || []
      if (devices.value.length > 0 && !selectedDeviceId.value) {
        selectedDeviceId.value = devices.value[0].id
      }
    })
    .catch((err) => {
      console.error('Fetch devices error:', err)
    })
}

watch(() => devices.value, (newDevices) => {
  if (newDevices.length > 0 && !selectedDeviceId.value) {
    selectedDeviceId.value = newDevices[0].id
  }
}, { immediate: true })

onMounted(() => {
  payload.start_time = moment().startOf('day').format('YYYY-MM-DDTHH:mm')
  payload.end_time = moment().format('YYYY-MM-DDTHH:mm')
  fetchDevices()

  if (props.isAutomatic) {
    showRightbar.value = true
    fetchLogs({ silent: true }).then((count) => {
      if (count > 0) {
        submitLogs({ skipConfirm: true })
      } else {
        storage('last__allow_auto_fetch_date').value = moment().format('Y-MM-DD')
      }
    })
  }
})
</script>

<style scoped>
.automatic-hidden {
  display: none;
}

.table-wrapper {
  max-height: 500px;
  overflow-y: auto;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
}

.table-wrapper thead th {
  position: sticky;
  top: 0;
  background: #fff;
  z-index: 10;
  border-bottom: 2px solid #dee2e6;
}

.table-wrapper table {
  margin-bottom: 0;
}

.device-selector-section {
  padding: 12px;
  background: #f9f9f9;
  border-radius: 6px;
  border: 1px solid #e0e0e0;
}

.device-radio-group {
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
  margin-top: 8px;
}

.device-radio-label {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  color: #333;
  user-select: none;
}

.device-radio-input {
  cursor: pointer;
  width: 16px;
  height: 16px;
  accent-color: #4caf50;
}

.device-radio-text {
  font-size: 13px;
  font-weight: 500;
}

.device-radio-label:hover .device-radio-text {
  color: #4caf50;
}
</style>
