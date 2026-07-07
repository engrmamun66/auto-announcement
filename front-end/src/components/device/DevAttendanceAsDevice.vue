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
      <input v-model="devPunch.punchTime" type="datetime-local" class="form-control">
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
import { ref, inject, onMounted, watch } from 'vue'

const props = defineProps({
  devices: {
    type: Array,
    default: () => []
  }
})

const emitter = inject('emitter')

const sending = ref(false)
const devPunch = ref({
  sn: localStorage.getItem('devPunch_sn') || '',
  userId: localStorage.getItem('devPunch_userId') || '',
  punchTime: new Date().toISOString().slice(0, 16),
  status: '0',
  verify: '0',
  workCode: ''
})

onMounted(() => {
  // Ensure punchTime is always fresh/current on mount
  devPunch.value.punchTime = new Date().toISOString().slice(0, 16)
})

// Save sn and userId to localStorage
watch(() => devPunch.value.sn, (newSn) => {
  if (newSn) localStorage.setItem('devPunch_sn', newSn)
})

watch(() => devPunch.value.userId, (newUserId) => {
  if (newUserId) localStorage.setItem('devPunch_userId', newUserId)
})

function sendDevPunch() {
  if (!devPunch.value.sn || !devPunch.value.userId) {
    emitter.emit('toaster-error', { message: 'Please fill required fields' })
    return
  }

  sending.value = true

  // Use current time for real-time punch (within ±10s of server time)
  const now = new Date()
  const dateTime = now.getFullYear() + '-' +
    String(now.getMonth() + 1).padStart(2, '0') + '-' +
    String(now.getDate()).padStart(2, '0') + ' ' +
    String(now.getHours()).padStart(2, '0') + ':' +
    String(now.getMinutes()).padStart(2, '0') + ':' +
    String(now.getSeconds()).padStart(2, '0')

  // Create tab-separated row: user_id\tpunch_time\tstatus\tverify\twork_code
  const row = [
    devPunch.value.userId,
    dateTime,
    devPunch.value.status || '0',
    devPunch.value.verify || '0',
    devPunch.value.workCode || ''
  ].join('\t')

  console.log('Sending dev punch:', { sn: devPunch.value.sn, row })

  // Send raw POST to /iclock/cdata endpoint with artificialPunch flag
  fetch(`/iclock/cdata?SN=${devPunch.value.sn}&table=ATTLOG&artificialPunch=true`, {
    method: 'POST',
    headers: { 'Content-Type': 'text/plain' },
    body: row
  })
    .then(res => {
      console.log('Dev punch response:', res.status, res.statusText)
      emitter.emit('toaster-success', { message: `Punch sent to device ${devPunch.value.sn}` })
      // Update punchTime to current (keep other fields for next punch)
      devPunch.value.punchTime = new Date().toISOString().slice(0, 16)
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
</style>
