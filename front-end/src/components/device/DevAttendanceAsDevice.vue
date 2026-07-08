<template>
  <div class="dev-attendance-form">
    <h3>Test Device Punch (Simulate Real Device)</h3>

    <div class="form-group">
      <label>Device Serial Number</label>
      <select v-model="devPunch.sn" class="form-control">
        <option value="">-- Select Device --</option>
        <option v-for="device in devices" :key="device.id" :value="device.serial_number">
          {{ device.name }} ({{ device.serial_number }})
        </option>
      </select>
    </div>

    <div class="form-group">
      <label>Employee ID / User ID</label>
      <input v-model="devPunch.userId" type="text" class="form-control" placeholder="e.g., 101">
    </div>


    <div class="form-group checkbox-group">
      <label>
        <input v-model="sendSMS" type="checkbox">
        <span>Send SMS</span>
      </label>
    </div>
    <div class="form-group checkbox-group">
      <label>
        <input v-model="forceAsRealtime" type="checkbox">
        <span v-if="forceAsRealtime">As Real-Time Punch (By Forced)</span>
        <span v-if="!forceAsRealtime">As Real-Time Punch ( with detect by punch time )</span>
      </label>
    </div>
    <div class="form-group checkbox-group">
      <label>
        <input v-model="sendCurrentDateTime" type="checkbox">
        <span>With Current Date Time</span>
      </label>
    </div>

    <div v-if="!sendCurrentDateTime" class="form-group">
      <label>Custom Date & Time</label>
      <div class="input-with-button">
        <input v-model="devPunch.punchTime" type="datetime-local" class="form-control">
        <button @click="setCurrentTime" class="btn-now">Now</button>
      </div>
    </div>


    <div v-if="adjustedTimeInfo" class="time-adjustment-card">
      <div class="adjustment-header">
        <i class='bx bx-time-five'></i>
        <span>Time Adjustment Applied</span>
      </div>

      <template v-if="adjustedTimeInfo.original !== adjustedTimeInfo.adjusted">
        <div class="time-flow">
          <div class="time-point from">
            <label>From</label>
            <div class="time-value">{{ adjustedTimeInfo.original }}</div>
            <small class="device-setting">{{ selectedDevice?.adjust_time }}</small>
          </div>
    
          <div class="flow-arrow">
            <i class='bx bx-right-arrow-circle'></i>
          </div>
    
          <div class="time-point to">
            <label>To</label>
            <div class="time-value">{{ adjustedTimeInfo.adjusted }}</div>
            <small class="operation-desc">{{ adjustedTimeInfo?.operations }}</small>
          </div>
        </div>
      </template>
      <template v-else>
        <div class="time-flow">
          <div class="time-point from">
            <label>Current Time</label>
            <div class="time-value">{{ adjustedTimeInfo.original }}</div>
            <small class="device-setting">{{ selectedDevice?.adjust_time }}</small>
          </div> 
        </div>
      </template>
    </div>
 

    <button @click="sendDevPunch" :disabled="!devPunch.sn || !devPunch.userId || sending" class="btn btn-primary">
      <span v-if="!sending">Send Punch (Now)</span>
      <span v-else>Sending...</span>
    </button>
  </div>
</template>

<script setup>
import { ref, inject, onMounted, watch, computed, onBeforeUnmount } from 'vue'

const props = defineProps({
  devices: {
    type: Array,
    default: () => []
  }
})

const emitter = inject('emitter')

const sending = ref(false)
const forceAsRealtime = ref(true)
const sendCurrentDateTime = ref(true)
const sendSMS = ref(true)
const realtimeRefresh = ref(0)
let realtimeIntervalId = null 
const devPunch = ref({
  sn: localStorage.getItem('devPunch_sn') || '',
  userId: localStorage.getItem('devPunch_userId') || '',
  punchTime: moment().format('YYYY-MM-DDTHH:mm'),
  status: '0',
  verify: '0',
  workCode: ''
})

onMounted(() => {
  // Ensure punchTime is always fresh/current on mount
  devPunch.value.punchTime = moment().format('YYYY-MM-DDTHH:mm')
})

// Save sn and userId to localStorage
watch(() => devPunch.value.sn, (newSn) => {
  if (newSn) localStorage.setItem('devPunch_sn', newSn)
})

watch(() => devPunch.value.userId, (newUserId) => {
  if (newUserId) localStorage.setItem('devPunch_userId', newUserId)
})

// Start/stop real-time refresh interval
watch(sendCurrentDateTime, (isEnabled) => {
  if (isEnabled) {
    realtimeIntervalId = setInterval(() => {
      realtimeRefresh.value++
    }, 1000)
  } else {
    if (realtimeIntervalId) {
      clearInterval(realtimeIntervalId)
      realtimeIntervalId = null
    }
  }
}, {immediate: true})

// Cleanup on unmount
onBeforeUnmount(() => {
  if (realtimeIntervalId) {
    clearInterval(realtimeIntervalId)
  }
})

// Get selected device
const selectedDevice = computed(() => {
  return props.devices.find(d => d.serial_number === devPunch.value.sn)
})

// Calculate adjusted time if not artificial punch
const adjustedTimeInfo = computed(() => {
  realtimeRefresh.value // trigger reactivity on real-time updates

  if (!selectedDevice.value) {
    return null
  }

  let adjustTime = selectedDevice.value.adjust_time || "subtract(0, 'hour')"

  let operations = adjustTime.replace(/^\./, '')

  if (adjustTime.startsWith('subtract')) {
    operations = operations.replace(/(subtract)/g, 'add')
  } else if (adjustTime.startsWith('add')) {
    operations = operations.replace(/(add)/g, 'subtract')
  }

  // Calculate new time
  const punchTimeStr = sendCurrentDateTime.value ? moment().format('YYYY-MM-DD HH:mm:ss') : devPunch.value.punchTime.replace('T', ' ') + ':00'
  const punchMoment = moment(punchTimeStr, 'YYYY-MM-DD HH:mm:ss')
  const adjustFn = new Function('moment', 'dateTime', `return moment(dateTime, 'YYYY-MM-DD HH:mm:ss').${operations}`)


  const original = punchMoment.format('YYYY-MM-DD HH:mm:ss')
  const adjustedMoment = adjustFn(moment, punchMoment).format('YYYY-MM-DD HH:mm:ss')

  return {
    original,
    adjusted: adjustedMoment,
    operations,
  }
})


function setCurrentTime() {
  devPunch.value.punchTime = moment().format('YYYY-MM-DDTHH:mm')
}

function sendDevPunch() {
  if (!devPunch.value.sn || !devPunch.value.userId) {
    emitter.emit('toaster-error', { message: 'Please fill required fields' })
    return
  }

  sending.value = true

  // Use adjusted time if not artificial punch, otherwise use selected punchTime
  let dateTime = adjustedTimeInfo.value.adjusted

  // Create tab-separated row: user_id\tpunch_time\tstatus\tverify\twork_code
  const row = [
    devPunch.value.userId,
    dateTime,
    devPunch.value.status || '0',
    devPunch.value.verify || '0',
    devPunch.value.workCode || ''
  ].join('\t')

  console.log('Sending dev punch:', { sn: devPunch.value.sn, row, isArtificial: forceAsRealtime.value })

  // Build URL with conditional forceAsRealtime param
  const url = new URL(`/iclock/cdata`, window.location.origin)
  url.searchParams.append('SN', devPunch.value.sn)
  url.searchParams.append('table', 'ATTLOG')
  if (forceAsRealtime.value) {
    url.searchParams.append('forceAsRealtime', 'true')
  }
  // skipSms=true means skip SMS, skipSms=false means send SMS
  url.searchParams.append('skipSms', sendSMS.value ? 'false' : 'true')

  // Send raw POST to /iclock/cdata endpoint
  fetch(url.toString(), {
    method: 'POST',
    headers: { 'Content-Type': 'text/plain' },
    body: row
  })
    .then(res => {
      console.log('Dev punch response:', res.status, res.statusText)
      emitter.emit('toaster-success', { message: `Punch sent to device ${devPunch.value.sn}` })
      // Update punchTime to current (keep other fields for next punch)
      devPunch.value.punchTime = moment().format('YYYY-MM-DDTHH:mm')
    })
    .catch(err => {
      console.error('Dev punch error:', err)
      emitter.emit('toaster-error', { message: 'Failed to send punch' })
    })
    .finally(() => {
      sending.value = false
    })
}
</script>

<style scoped>
.dev-attendance-form {
  max-width: 600px;
  padding: 20px;
  background: #f9f9fb;
  border: 1px solid #e8e8e8;
  border-radius: 8px;
}

.dev-attendance-form h3 {
  margin-bottom: 20px;
  color: #2c3e50;
  font-size: 18px;
  font-weight: 600;
}

.form-group {
  margin-bottom: 16px;
  display: flex;
  flex-direction: column;
}

.form-group label {
  font-weight: 600;
  color: #2c3e50;
  margin-bottom: 6px;
  font-size: 13px;
}

.checkbox-group {
  margin-top: 12px;
  margin-bottom: 12px;
}

.checkbox-group label {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 0;
  font-weight: 500;
  cursor: pointer;
  user-select: none;
}

.checkbox-group input[type="checkbox"] {
  width: 18px;
  height: 18px;
  cursor: pointer;
  accent-color: #3498db;
}

.form-group .form-control {
  padding: 10px 12px;
  border: 1px solid #d8d8d8;
  border-radius: 4px;
  font-size: 13px;
  font-family: inherit;
  transition: border-color 0.2s;
}

.form-group .form-control:focus {
  outline: none;
  border-color: #3498db;
  box-shadow: 0 0 0 2px rgba(52, 152, 219, 0.1);
}

.form-group .form-control:disabled {
  background: #f0f0f0;
  color: #999;
  cursor: not-allowed;
}

.input-with-button {
  display: flex;
  gap: 8px;
  align-items: center;
}

.input-with-button .form-control {
  flex: 1;
  margin-bottom: 0;
}

.btn-now {
  padding: 10px 14px;
  background: linear-gradient(135deg, #4caf50 0%, #45a049 100%);
  color: white;
  border: none;
  border-radius: 4px;
  font-weight: 600;
  font-size: 12px;
  cursor: pointer;
  transition: all 0.2s;
  white-space: nowrap;
  flex-shrink: 0;
}

.btn-now:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(76, 175, 80, 0.3);
}

.btn-now:active {
  transform: translateY(0);
}

.btn {
  padding: 10px 20px;
  border: none;
  border-radius: 4px;
  font-weight: 600;
  cursor: pointer;
  font-size: 13px;
  transition: all 0.2s;
}

.btn-primary {
  background: linear-gradient(135deg, #3498db 0%, #2980b9 100%);
  color: white;
}

.btn-primary:hover:not(:disabled) {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(52, 152, 219, 0.3);
}

.btn-primary:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}


.time-adjustment-card {
  padding: 16px;
  margin-bottom: 16px;
  background: linear-gradient(135deg, #e3f2fd 0%, #f3e5f5 100%);
  border: 2px solid #2196f3;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(33, 150, 243, 0.15);
}

.adjustment-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 16px;
  color: #1565c0;
  font-weight: 600;
  font-size: 14px;
}

.adjustment-header i {
  font-size: 20px;
}

.time-flow {
  display: flex;
  align-items: center;
  gap: 12px;
  justify-content: space-between;
}

.time-point {
  flex: 1;
  padding: 12px;
  background: white;
  border-radius: 6px;
  border: 1px solid #e0e0e0;
  text-align: center;
}

.time-point label {
  display: block;
  font-size: 11px;
  font-weight: 700;
  color: #666;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-bottom: 6px;
}

.time-point .time-value {
  font-size: 14px;
  font-weight: 600;
  color: #212121;
  font-family: 'Courier New', monospace;
  margin-bottom: 6px;
}

.time-point small {
  display: block;
  font-size: 11px;
  color: #999;
  font-family: 'Courier New', monospace;
}

.flow-arrow {
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  font-size: 24px;
  color: #2196f3;
  animation: pulse-arrow 2s ease-in-out infinite;
}

@keyframes pulse-arrow {
  0%, 100% {
    opacity: 0.7;
    transform: translateX(0);
  }
  50% {
    opacity: 1;
    transform: translateX(4px);
  }
}
</style>
