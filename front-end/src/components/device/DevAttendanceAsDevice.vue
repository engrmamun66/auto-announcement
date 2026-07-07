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

    <div class="form-group">
      <label>Punch Date & Time</label>
      <div class="input-with-button">
        <input v-model="devPunch.punchTime" type="datetime-local" class="form-control">
        <button @click="setCurrentTime" class="btn-now">Now</button>
      </div>
    </div>

    <div class="form-group checkbox-group">
      <label>
        <input v-model="forceAsRealtime" type="checkbox">
        <span>Force As Real-Time Punch</span>
      </label>
    </div>


    <div v-if="adjustedTimeInfo" class="alert-info">
      <i class='bx bx-info-circle'></i>
      <span>
        <strong>Adjust Time Applied:</strong> {{ adjustedTimeInfo.original }} → {{ adjustedTimeInfo.adjusted }}
        <br><small>Device adjustment time: <code>{{ selectedDevice?.adjust_time }}</code></small>
        <br><small>Applied for device with: <code>{{ adjustedTimeInfo?.operations }}</code></small>
      </span>
    </div>

    <!-- <div class="form-group">
      <label>Status</label>
      <input v-model="devPunch.status" type="text" class="form-control" placeholder="e.g., 0">
    </div>

    <div class="form-group">
      <label>Verify</label>
      <input v-model="devPunch.verify" type="text" class="form-control" placeholder="e.g., 0">
    </div>

    <div class="form-group">
      <label>Work Code</label>
      <input v-model="devPunch.workCode" type="text" class="form-control" placeholder="Leave empty or enter code">
    </div> -->

    <button @click="sendDevPunch" :disabled="!devPunch.sn || !devPunch.userId || sending" class="btn btn-primary">
      <span v-if="!sending">Send Punch (Now)</span>
      <span v-else>Sending...</span>
    </button>
  </div>
</template>

<script setup>
import { ref, inject, onMounted, watch, computed } from 'vue'

const props = defineProps({
  devices: {
    type: Array,
    default: () => []
  }
})

const emitter = inject('emitter')

const sending = ref(false)
const forceAsRealtime = ref(true)
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

// Get selected device
const selectedDevice = computed(() => {
  return props.devices.find(d => d.serial_number === devPunch.value.sn)
})

// Calculate adjusted time if not artificial punch
const adjustedTimeInfo = computed(() => {
  if (!selectedDevice.value) {
    return null
  }

  let adjustTime = selectedDevice.value.adjust_time || "subtract(0, 'hour')"
  console.log({adjustTime});

  let operations = adjustTime.replace(/^\./, '')

  if(!forceAsRealtime.value){
    if (adjustTime.startsWith('subtract')) {
      operations = operations.replace(/(subtract)/g, 'add')
    } else if (adjustTime.startsWith('add')) {
      operations = operations.replace(/(add)/g, 'subtract')
    } 
  }   

  // Calculate new time
  const punchTimeStr = devPunch.value.punchTime.replace('T', ' ') + ':00'
  const punchMoment = moment(punchTimeStr, 'YYYY-MM-DD HH:mm:ss')
  const adjustFn = new Function('moment', 'dateTime', `return moment(dateTime, 'YYYY-MM-DD HH:mm:ss').${operations}`)

  
  const original = punchMoment.format('YYYY-MM-DD hh:mm:ss A')
  const adjustedMoment = forceAsRealtime.value ? original : adjustFn(moment, punchMoment).format('YYYY-MM-DD HH:mm:ss')

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
  let dateTime
  if (!forceAsRealtime.value && adjustedTimeInfo.value) {
    dateTime = adjustedTimeInfo.value.adjusted
  } else {
    // Convert punchTime from datetime-local format to API format
    dateTime = moment(devPunch.value.punchTime, 'YYYY-MM-DDTHH:mm').format('YYYY-MM-DD HH:mm:ss')
  }

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


.alert-info {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  padding: 12px;
  margin-bottom: 16px;
  background: #e3f2fd;
  border-left: 4px solid #2196f3;
  border-radius: 4px;
  font-size: 13px;
  color: #1565c0;
  line-height: 1.5;
}

.alert-info i {
  flex-shrink: 0;
  margin-top: 2px;
  font-size: 16px;
}

.alert-info span {
  flex: 1;
}

.alert-info code {
  display: inline-block;
  padding: 2px 6px;
  background: rgba(0, 0, 0, 0.1);
  border-radius: 3px;
  font-family: 'Courier New', monospace;
  font-size: 12px;
  color: #0d47a1;
  margin-top: 4px;
}
</style>
