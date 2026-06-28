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
const selectedDeviceId = ref('');

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
