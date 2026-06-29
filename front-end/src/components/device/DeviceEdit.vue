<template>
  <div v-if="editingDevice" class="device-modal-overlay">
    <div class="device-modal" @click.stop>
      <div class="device-modal__header">
        <h2>{{ helper.t('Edit Device') }}</h2>
        <button @click="emit('close')" class="device-modal__close">×</button>
      </div>

      <div class="device-modal__body">
        <div class="form-group">
          <label>{{ helper.t('Name') }}</label>
          <input v-model="editingDevice.name" type="text" class="form-control">
        </div>
        <div class="form-group">
          <label>{{ helper.t('Serial Number') }}</label>
          <input v-model="editingDevice.serial_number" type="text" class="form-control" disabled>
        </div>
        <div class="form-group">
          <label>{{ helper.t('Brand') }}</label>
          <select v-model="editingDevice.brand" class="form-control">
            <option value="">-- {{ helper.t('Select Brand') }} --</option>
            <option v-for="brand in brands" :key="brand" :value="brand">{{ brand }}</option>
          </select>
        </div>
        <div class="form-row">
          <div class="form-group">
            <label>{{ helper.t('Polling Interval') }} (s)</label>
            <input v-model.number="editingDevice.polling_interval" type="number" class="form-control">
          </div>
          <div class="form-group">
            <Switch
              v-model="editingDevice.status"
              :label="helper.t('Active')"
              :yesNoValue="[1, 0]"
              yes="Active"
              no="Inactive"
              inline
              size="lg"
            />
          </div>
        </div>
        <div class="form-group">
          <label>{{ helper.t('Adjust Time') }}</label>
          <input v-model="editingDevice.adjust_time" type="text" class="form-control" placeholder="e.g., subtract(2, 'hours')">
        </div>
      </div>

      <div class="device-modal__actions">
        <button @click="emit('close')" class="btn btn-secondary">{{ helper.t('Cancel') }}</button>
        <button @click="handleSave" class="btn btn-primary">{{ helper.t('Save') }}</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { inject } from 'vue';
import Switch from '@/components/Switch.vue';

const props = defineProps({
  editingDevice: {
    type: Object,
    default: null
  }
});

const emit = defineEmits(['close', 'save']);

const helper = inject('helper');

const brands = [
  'ZKTeco',
  'Hikvision',
  'Honeywell',
  'Suprema',
  'Identiv',
  'NEC',
  'Thales',
  'IDEMIA',
  'Genetec',
  'Other'
];

function handleSave() {
  emit('save', {
    id: props.editingDevice.id,
    name: props.editingDevice.name || '',
    brand: props.editingDevice.brand || 'ZKTeco',
    polling_interval: props.editingDevice.polling_interval,
    adjust_time: props.editingDevice.adjust_time || `subtract(0, 'hours')`,
    status: props.editingDevice.status ? 1 : 0
  });
}
</script>

<style scoped>
.device-modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.device-modal {
  background: #fff;
  border: 1px solid #ddd;
  border-radius: 8px;
  max-width: 500px;
  width: 90%;
  max-height: 80vh;
  overflow-y: auto;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
  animation: slideUp 0.2s ease-out;
}

@keyframes slideUp {
  from {
    transform: translateY(20px);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}

.device-modal__header {
  padding: 20px;
  border-bottom: 1px solid #e0e0e0;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.device-modal__header h2 {
  margin: 0;
  color: #333;
  font-size: 20px;
}

.device-modal__close {
  background: none;
  border: none;
  color: #999;
  font-size: 24px;
  cursor: pointer;
  padding: 0;
  width: 30px;
  height: 30px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.device-modal__close:hover {
  color: #333;
}

.device-modal__body {
  padding: 20px;
}

.device-modal__actions {
  padding: 15px 20px;
  border-top: 1px solid #e0e0e0;
  display: flex;
  gap: 10px;
  justify-content: flex-end;
}

.form-row {
  display: flex;
  gap: 15px;
  flex-wrap: nowrap;
}

.form-row .form-group {
  flex: 1;
}

.form-group {
  margin-bottom: 15px;
}

.form-group label {
  display: block;
  margin-bottom: 5px;
  color: #333;
  font-weight: 500;
  font-size: 14px;
}

.form-control {
  width: 100%;
  padding: 10px 12px;
  border: 1px solid #ddd;
  border-radius: 6px;
  background: #f9f9f9;
  color: #333;
  box-sizing: border-box;
  transition: border-color 0.2s;
  font-size: 14px;
}

.form-control:focus {
  outline: none;
  border-color: #4caf50;
  background: #fff;
  box-shadow: 0 0 0 3px rgba(76, 175, 80, 0.1);
}

.form-control:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  background: #f0f0f0;
  color: #999;
}

.form-control option {
  background: #fff;
  color: #333;
}

select.form-control {
  appearance: none;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%23333' d='M6 9L1 4h10z'/%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right 10px center;
  background-attachment: scroll;
  padding-right: 32px;
}

select.form-control:focus {
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%23333' d='M6 9L1 4h10z'/%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right 10px center;
}

.btn {
  padding: 10px 20px;
  border: none;
  border-radius: 6px;
  font-weight: 600;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s;
  flex: 1;
}

.btn-primary {
  background: #4caf50;
  color: #fff;
}

.btn-primary:hover {
  background: #43a047;
  transform: translateY(-1px);
  box-shadow: 0 2px 8px rgba(76, 175, 80, 0.3);
}

.btn-secondary {
  background: #555;
  color: #fff;
}

.btn-secondary:hover {
  background: #666;
  transform: translateY(-1px);
}
</style>
