<template>
  <div v-if="devices.length" class="commands-wrapper">
    <div class="commands-container">
      <div class="devices-selector">
        <div class="radio-group">
          <label v-for="device in devices" :key="device.id" class="radio-label">
            <input
              v-model="selectedDeviceId"
              :value="device.id"
              type="radio"
              class="radio-input"
            >
            <span class="radio-text">{{ device.name ? device.name + ` (${device.serial_number})` : device.name || device.serial_number }}</span>
          </label>
        </div>
      </div>

      <div v-if="selectedDeviceId" class="command-card">
        <div class="command-card__header">
          <h3>{{ helper.t('Execute Command') }}</h3>
        </div>
        <div class="command-card__body">
          <div class="command-item">
            <div class="command-info">
              <h4>{{ helper.t('Restart Device') }}</h4>
              <p>{{ helper.t('Restart the selected device') }}</p>
            </div>
            <button @click="handleRestart" class="command-btn restart-btn" :disabled="executingCommand">
              <i class='bx bx-power-off'></i>
              {{ executingCommand ? helper.t('Executing...') : helper.t('Restart') }}
            </button>
          </div>

          <div class="command-item">
            <div class="command-info">
              <h4>{{ helper.t('Push Command') }}</h4>
              <p>{{ helper.t('Send raw command to device') }}</p>
            </div>
            <div class="command-input-group">
              <input
                v-model="pushCommandText"
                type="text"
                class="command-input"
                :placeholder="helper.t('Enter command')"
                @keyup.enter="handlePushCommand"
              >
              <button @click="handlePushCommand" class="command-btn push-btn" :disabled="executingCommand || !pushCommandText.trim()">
                <i class='bx bx-send'></i>
                {{ executingCommand ? helper.t('Sending...') : helper.t('Send') }}
              </button>
            </div>
          </div>

          <div class="command-item">
            <div class="command-info">
              <h4>{{ helper.t('Get Attendance') }}</h4>
              <p>{{ helper.t('Retrieve attendance by date range') }}</p>
            </div>
            <div class="command-date-group">
              <input
                v-model="attStartDate"
                type="datetime-local"
                class="command-input"
                :placeholder="helper.t('Start date')"
              >
              <input
                v-model="attEndDate"
                type="datetime-local"
                class="command-input"
                :placeholder="helper.t('End date')"
              >
              <button @click="handleGetAttendance" class="command-btn attendance-btn" :disabled="executingCommand || !attStartDate || !attEndDate">
                <i class='bx bx-download'></i>
                {{ executingCommand ? helper.t('Fetching...') : helper.t('Fetch') }}
              </button>
            </div>
          </div>
        </div>
      </div>

      <div v-else class="commands-empty">
        <p>{{ helper.t('Select a device to execute commands') }}</p>
      </div>
    </div>
  </div>

  <div v-else class="commands-empty">
    <p>{{ helper.t('No devices found') }}</p>
  </div>
</template>

<script setup>
import { ref, inject, computed, watch, onMounted } from 'vue';

const props = defineProps({
  devices: {
    type: Array,
    required: true
  },
  executingCommand: {
    type: Boolean,
    default: false
  }
});

const emit = defineEmits(['restart']);

const helper = inject('helper');
const emitter = inject('emitter');
const http = inject('http');
const selectedDeviceId = ref('');
const pushCommandText = ref('');
const attStartDate = ref('');
const attEndDate = ref('');

const selectedDevice = computed(() => {
  return props.devices.find(d => d.id === selectedDeviceId.value);
});

watch(() => props.devices, (newDevices) => {
  if (newDevices.length > 0 && !selectedDeviceId.value) {
    selectedDeviceId.value = newDevices[0].id;
  }
}, { immediate: true });

onMounted(() => {
  if (props.devices.length > 0 && !selectedDeviceId.value) {
    selectedDeviceId.value = props.devices[0].id;
  }
});

function handleRestart() {
  if (!selectedDeviceId.value || !selectedDevice.value) return;

  const device = selectedDevice.value;

  if (!confirm(`${helper.t('Restart')} ${device.name || device.serial_number}?`)) {
    selectedDeviceId.value = '';
    return;
  }
  emit('restart', device);
}

function handlePushCommand() {
  if (!selectedDeviceId.value || !selectedDevice.value || !pushCommandText.value.trim()) return;

  const device = selectedDevice.value;
  const command = pushCommandText.value.trim();

  http.post(`/devices/push-command/${device.serial_number}`, { command })
    .then(() => {
      emitter.emit('toaster-success', { message: helper.t('Command sent successfully') });
      pushCommandText.value = '';
    })
    .catch((err) => {
      console.error('Push command error:', err);
      emitter.emit('toaster-error', { message: helper.t('Failed to send command') });
    });
}

function handleGetAttendance() {
  if (!selectedDeviceId.value || !selectedDevice.value || !attStartDate.value || !attEndDate.value) return;

  const device = selectedDevice.value;

  // Convert datetime-local to "YYYY-MM-DD HH:mm:ss" format
  const startTime = new Date(attStartDate.value).toISOString().slice(0, 19).replace('T', ' ');
  const endTime = new Date(attEndDate.value).toISOString().slice(0, 19).replace('T', ' ');

  // Use fetch for root-level command route (not /api prefixed)
  fetch(`/${device.serial_number}/get-attendance`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ startTime, endTime })
  })
    .then(res => res.json())
    .then(() => {
      emitter.emit('toaster-success', { message: helper.t('Attendance fetch command sent') });
    })
    .catch((err) => {
      console.error('Get attendance error:', err);
      emitter.emit('toaster-error', { message: helper.t('Failed to fetch attendance') });
    });
}
</script>

<style scoped>
.commands-wrapper {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.commands-container {
  display: flex;
  flex-direction: column;
  gap: 20px;
  padding: 20px;
}

.devices-selector {
  background: #fff;
  border-radius: 10px;
  padding: 20px;
  border: 1px solid #e0e0e0;
}

.radio-group {
  display: flex;
  flex-wrap: wrap;
  gap: 20px;
}

.radio-label {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  color: #333;
  user-select: none;
}

.radio-input {
  cursor: pointer;
  width: 18px;
  height: 18px;
  accent-color: #4caf50;
}

.radio-text {
  font-size: 14px;
  font-weight: 500;
}

.radio-label:hover .radio-text {
  color: #4caf50;
}

.command-card {
  background: #fff;
  border: 1px solid #e0e0e0;
  border-radius: 10px;
  overflow: hidden;
  flex: 1;
  display: flex;
  flex-direction: column;
}

.command-card__header {
  padding: 25px 25px 15px;
  border-bottom: 1px solid #e0e0e0;
}

.command-card__header h3 {
  margin: 0;
  color: #333;
  font-size: 18px;
  font-weight: 600;
}

.command-card__body {
  padding: 25px;
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.command-item {
  display: flex;
  align-items: center;
  gap: 30px;
  padding: 20px 0;
}

.command-info {
  flex: 1;
}

.command-info h4 {
  margin: 0 0 8px 0;
  color: #333;
  font-size: 16px;
  font-weight: 600;
}

.command-info p {
  margin: 0;
  color: #666;
  font-size: 14px;
}

.command-btn {
  padding: 12px 30px;
  border: none;
  border-radius: 6px;
  font-weight: 600;
  font-size: 14px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  transition: all 0.2s;
  white-space: nowrap;
}

.restart-btn {
  background: #f44336;
  color: #fff;
}

.restart-btn:hover:not(:disabled) {
  background: #d32f2f;
  transform: translateY(-1px);
  box-shadow: 0 2px 8px rgba(244, 67, 54, 0.3);
}

.restart-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.command-input-group {
  display: flex;
  gap: 8px;
  align-items: center;
}

.command-date-group {
  display: flex;
  gap: 8px;
  align-items: center;
  flex-wrap: wrap;
}

.command-input {
  flex: 1;
  padding: 10px 12px;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-size: 14px;
  font-family: inherit;
  transition: border-color 0.2s;
}

.command-input:focus {
  outline: none;
  border-color: #4caf50;
  box-shadow: 0 0 0 3px rgba(76, 175, 80, 0.1);
}

.push-btn {
  background: #2196f3;
  color: #fff;
}

.push-btn:hover:not(:disabled) {
  background: #1976d2;
  transform: translateY(-1px);
  box-shadow: 0 2px 8px rgba(33, 150, 243, 0.3);
}

.push-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.attendance-btn {
  background: #4caf50;
  color: #fff;
}

.attendance-btn:hover:not(:disabled) {
  background: #45a049;
  transform: translateY(-1px);
  box-shadow: 0 2px 8px rgba(76, 175, 80, 0.3);
}

.attendance-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.commands-empty {
  background: #fff;
  border: 1px solid #e0e0e0;
  border-radius: 10px;
  text-align: center;
  padding: 60px 20px;
  color: #999;
  font-size: 14px;
}

@media (max-width: 768px) {
  .command-item {
    flex-direction: column;
    align-items: stretch;
    gap: 15px;
  }

  .command-btn {
    width: 100%;
    justify-content: center;
  }
}
</style>
