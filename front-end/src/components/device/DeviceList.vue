<template>
  <div v-if="devices.length" class="devices-grid">
    <div v-for="device in devices" :key="device.id" class="device-card">
      <div class="device-card__header">
        <div class="device-card__title">{{ device.name || device.serial_number }}</div>
        <span :class="['device-card__status', device.status ? 'active' : 'inactive']">
          {{ device.status ? helper.t('Active') : helper.t('Inactive') }}
        </span>
      </div>

      <div class="device-card__body">
        <div class="device-card__row">
          <span class="device-card__label">{{ helper.t('Serial Number') }}:</span>
          <span class="device-card__value">{{ device.serial_number }}</span>
        </div>
        <div class="device-card__row">
          <span class="device-card__label">{{ helper.t('Brand') }}:</span>
          <span class="device-card__value">{{ device.brand }}</span>
        </div>
        <div class="device-card__row">
          <span class="device-card__label">{{ helper.t('Polling Interval') }}:</span>
          <span class="device-card__value">{{ device.polling_interval }}s</span>
        </div>
        <div class="device-card__row">
          <span class="device-card__label">{{ helper.t('Created') }}:</span>
          <span class="device-card__value">{{ formatTime(device.updated) }}</span>
        </div>
        <div class="device-card__row">
          <span class="device-card__label">{{ helper.t('Last Updated') }}:</span>
          <span class="device-card__value">{{ formatTime(device.updated) }} | {{ getTimeAgo(device.updated) }}</span>
        </div>
      </div>

      <div class="device-card__actions">
        <button @click="emit('edit', device)" class="btn btn-primary">
          {{ helper.t('Edit') }}
        </button>
        <button @click="emit('delete', device.id)" class="btn btn-danger">
          {{ helper.t('Delete') }}
        </button>
      </div>
    </div>
  </div>

  <div v-else class="devices-empty">
    <p>{{ helper.t('No devices found') }}</p>
  </div>
</template>

<script setup>
import { inject } from 'vue';
import moment from 'moment';

defineProps({
  devices: {
    type: Array,
    required: true
  }
});

const emit = defineEmits(['edit', 'delete']);

const helper = inject('helper');

function formatTime(timestamp) {
  return moment(timestamp).format('DD/MM/YYYY HH:mm:ss');
}

function getTimeAgo(timestamp) {
  return moment(timestamp).fromNow();
}
</script>

<style scoped>
.devices-grid {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-top: 20px;
}

.device-card {
  background: #fff;
  border: 1px solid #e0e0e0;
  border-radius: 10px;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08);
  transition: box-shadow 0.2s ease;
}

.device-card:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.12);
}

.device-card__header {
  padding: 14px 16px;
  border-bottom: 1px solid #e0e0e0;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
  background: #fafafa;
}

.device-card__title {
  font-weight: 600;
  color: #333;
  font-size: 17px;
  flex: 1;
}

.device-card__status {
  font-size: 12px;
  padding: 4px 10px;
  border-radius: 4px;
  font-weight: 600;
}

.device-card__status.active {
  background: rgba(76, 175, 80, 0.2);
  color: #4caf50;
}

.device-card__status.inactive {
  background: rgba(244, 67, 54, 0.2);
  color: #f44336;
}

.device-card__body {
  padding: 14px 16px;
  flex: 1;
}

.device-card__row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 0;
  border-bottom: 1px solid #f0f0f0;
  font-size: 13px;
}

.device-card__row:last-child {
  border-bottom: none;
}

.device-card__label {
  color: #666;
  font-weight: 500;
}

.device-card__value {
  color: #333;
  text-align: right;
  word-break: break-word;
}

.device-card__actions {
  padding: 10px 16px;
  display: flex;
  gap: 10px;
  border-top: 1px solid #e0e0e0;
  background: #fafafa;
}

.devices-empty {
  text-align: center;
  padding: 60px 20px;
  color: #888;
}

.btn {
  padding: 8px 20px;
  border: none;
  border-radius: 6px;
  font-weight: 600;
  font-size: 13px;
  cursor: pointer;
  transition: all 0.2s;
  text-align: center;
  min-width: 100px;
}

.btn-primary {
  background: #4caf50;
  color: #fff;
}

.btn-primary:hover {
  background: #43a047;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(76, 175, 80, 0.3);
}

.btn-danger {
  background: #f44336;
  color: #fff;
}

.btn-danger:hover {
  background: #d32f2f;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(244, 67, 54, 0.3);
}

@media (max-width: 768px) {
  .devices-grid {
    grid-template-columns: 1fr;
  }

  .device-card__actions {
    flex-direction: column;
  }

  .btn {
    width: 100%;
  }
}
</style>
