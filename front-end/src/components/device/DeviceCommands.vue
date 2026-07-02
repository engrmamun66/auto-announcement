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
              <h4>{{ helper.t('Get Users') }}</h4>
              <p>{{ helper.t('Retrieve all users from device') }}</p>
            </div>
            <button @click="handleGetUsers" class="command-btn users-btn" :disabled="executingCommand || fetchingUsers">
              <i class='bx bx-group'></i>
              {{ fetchingUsers ? helper.t('Getting...') : helper.t('Get Users') }}
            </button>
          </div>

          <div class="command-item">
            <div class="command-info">
              <h4>{{ helper.t('Create/Delete Users') }}</h4>
              <p>{{ helper.t('Add students from selected classes to device') }}</p>
            </div>
            <button @click="handleCreateUsers" class="command-btn create-btn" :disabled="executingCommand || creatingUsers">
              <i class='bx bx-plus'></i>
              {{ creatingUsers ? helper.t('Loading...') : helper.t('Open Students') }}
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

  <UserListModal
    v-model="showUsersModal"
    :users="usersList"
    :device="selectedDeviceForModal"
  />

  <ClassSelectionModal
    v-model="showClassesModal"
    :device="selectedDevice"
    @create-users="handleCreateUsersFromClasses"
  />
</template>

<script setup>
import { ref, inject, computed, watch, onMounted } from 'vue';
import moment from 'moment';
import UserListModal from './UserListModal.vue';
import ClassSelectionModal from './ClassSelectionModal.vue';

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
const attStartDate = ref(getDefaultStartDate());
const attEndDate = ref(getDefaultEndDate());
const fetchingUsers = ref(false);
const creatingUsers = ref(false);
const usersList = ref([]);
const showUsersModal = ref(false);
const selectedDeviceForModal = ref(null);
const showClassesModal = ref(false);

function getDefaultStartDate() {
  return moment().startOf('day').format('YYYY-MM-DDTHH:mm');
}

function getDefaultEndDate() {
  return moment().format('YYYY-MM-DDTHH:mm');
}

const selectedDevice = computed(() => {
  return props.devices.find(d => d.id === selectedDeviceId.value);
});

watch(() => props.devices, (newDevices) => {
  if (newDevices.length > 0 && !selectedDeviceId.value) {
    selectedDeviceId.value = newDevices[0].id;
  }
}, { immediate: true });

watch(() => selectedDeviceId.value, () => {
  usersList.value = [];
});

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

function handleGetUsers() {
  if (!selectedDeviceId.value || !selectedDevice.value) return;

  const device = selectedDevice.value;
  fetchingUsers.value = true;

  fetch(`/${device.serial_number}/get-users`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
  })
    .then(res => res.json())
    .then((data) => {
      usersList.value = data.users || [];
      selectedDeviceForModal.value = device;
      if (usersList.value.length > 0) {
        emitter.emit('toaster-success', { message: `Users fetched (${usersList.value.length})` });
        showUsersModal.value = true;
      } else {
        emitter.emit('toaster-warning', { message: helper.t('No users found on device') });
      }
    })
    .catch((err) => {
      console.error('Get users error:', err);
      emitter.emit('toaster-error', { message: helper.t('Failed to fetch users') });
      usersList.value = [];
    })
    .finally(() => {
      fetchingUsers.value = false;
    });
}

function handleCreateUsers() {
  if (!selectedDeviceId.value || !selectedDevice.value) return;
  showClassesModal.value = true;
}

async function handleCreateUsersFromClasses(students) {
  if (!selectedDeviceId.value || !selectedDevice.value || !students.length) return;

  const device = selectedDevice.value;
  creatingUsers.value = true;
  let successCount = 0;

  const users = students.map(student => ({
    pin: String(student.dakhela || student.id),
    name: student.name || student.fullname || '',
    card: student.card_no || ''
  }));

  try {
    for (const user of users) {
      try {
        const res = await fetch(`/${device.serial_number}/update-user`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(user)
        });
        if (res.ok) successCount++;
      } catch (err) {
        console.warn(`Failed to create user ${user.pin}:`, err);
      }
    }

    if (successCount === users.length) {
      emitter.emit('toaster-success', { message: `Created ${successCount} users on device` });
    } else {
      emitter.emit('toaster-warning', { message: `Created ${successCount} of ${users.length} users` });
    }
  } catch (err) {
    console.error('Create users error:', err);
    emitter.emit('toaster-error', { message: helper.t('Failed to create users') });
  } finally {
    creatingUsers.value = false;
  }
}
</script>

<style scoped>
.commands-wrapper {
  display: flex;
  flex-direction: column;
}

.commands-container {
  display: flex;
  flex-direction: column;
  gap: 24px;
  padding: 32px 20px;
  max-width: 1200px;
  margin: 0 auto;
  width: 100%;
}

.devices-selector {
  background: linear-gradient(135deg, #fff 0%, #f8f9fa 100%);
  border-radius: 12px;
  padding: 24px 28px;
  border: 1px solid #e8e8e8;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.04);
}

.radio-group {
  display: flex;
  flex-wrap: wrap;
  gap: 24px;
}

.radio-label {
  display: flex;
  align-items: center;
  gap: 10px;
  cursor: pointer;
  color: #333;
  user-select: none;
  transition: color 0.2s;
}

.radio-input {
  cursor: pointer;
  width: 20px;
  height: 20px;
  accent-color: #4caf50;
  flex-shrink: 0;
}

.radio-text {
  font-size: 14px;
  font-weight: 500;
  color: #555;
}

.radio-label:hover .radio-text {
  color: #4caf50;
}

.command-card {
  background: #fff;
  border: 1px solid #e8e8e8;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.06);
}

.command-card__header {
  padding: 28px 32px 24px;
  border-bottom: 2px solid #f0f0f0;
  background: linear-gradient(135deg, #fff 0%, #f8f9fa 100%);
}

.command-card__header h3 {
  margin: 0;
  color: #2c3e50;
  font-size: 20px;
  font-weight: 700;
  letter-spacing: -0.3px;
}

.command-card__body {
  padding: 32px;
  display: flex;
  flex-direction: column;
  gap: 32px;
}

.command-item {
  display: flex;
  align-items: center;
  gap: 32px;
  padding: 24px;
  background: #f9f9fb;
  border-radius: 10px;
  border: 1px solid #f0f0f0;
  transition: all 0.2s ease;
}

.command-item:hover {
  background: #ffffff;
  border-color: #e8e8e8;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
}

.command-info {
  flex: 1;
  min-width: 0;
}

.command-info h4 {
  margin: 0 0 6px 0;
  color: #2c3e50;
  font-size: 15px;
  font-weight: 700;
  letter-spacing: -0.2px;
}

.command-info p {
  margin: 0;
  color: #999;
  font-size: 13px;
  font-weight: 500;
}

.command-btn {
  padding: 11px 24px;
  border: none;
  border-radius: 8px;
  font-weight: 700;
  font-size: 13px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  white-space: nowrap;
  flex-shrink: 0;
  letter-spacing: 0.3px;
  text-transform: uppercase;
}

.restart-btn {
  background: linear-gradient(135deg, #f44336 0%, #d32f2f 100%);
  color: #fff;
  box-shadow: 0 2px 8px rgba(244, 67, 54, 0.2);
}

.restart-btn:hover:not(:disabled) {
  background: linear-gradient(135deg, #d32f2f 0%, #c62828 100%);
  transform: translateY(-2px);
  box-shadow: 0 4px 16px rgba(244, 67, 54, 0.3);
}

.restart-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.command-input-group {
  display: flex;
  gap: 10px;
  align-items: center;
  flex: 0 1 auto;
}

.command-date-group {
  display: flex;
  gap: 10px;
  align-items: center;
  flex-wrap: wrap;
  flex: 0 1 auto;
}

.command-input {
  padding: 10px 14px;
  border: 1px solid #ddd;
  border-radius: 8px;
  font-size: 13px;
  font-family: inherit;
  background: #fff;
  transition: all 0.2s;
  min-width: 140px;
}

.command-input:focus {
  outline: none;
  border-color: #4caf50;
  box-shadow: 0 0 0 3px rgba(76, 175, 80, 0.1);
  background: #fafafa;
}

.push-btn {
  background: linear-gradient(135deg, #2196f3 0%, #1976d2 100%);
  color: #fff;
  box-shadow: 0 2px 8px rgba(33, 150, 243, 0.2);
}

.push-btn:hover:not(:disabled) {
  background: linear-gradient(135deg, #1976d2 0%, #1565c0 100%);
  transform: translateY(-2px);
  box-shadow: 0 4px 16px rgba(33, 150, 243, 0.3);
}

.push-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.attendance-btn {
  background: linear-gradient(135deg, #4caf50 0%, #45a049 100%);
  color: #fff;
  box-shadow: 0 2px 8px rgba(76, 175, 80, 0.2);
}

.attendance-btn:hover:not(:disabled) {
  background: linear-gradient(135deg, #45a049 0%, #3d8b40 100%);
  transform: translateY(-2px);
  box-shadow: 0 4px 16px rgba(76, 175, 80, 0.3);
}

.attendance-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.users-btn {
  background: linear-gradient(135deg, #9c27b0 0%, #7b1fa2 100%);
  color: #fff;
  box-shadow: 0 2px 8px rgba(156, 39, 176, 0.2);
}

.users-btn:hover:not(:disabled) {
  background: linear-gradient(135deg, #7b1fa2 0%, #6a1b9a 100%);
  transform: translateY(-2px);
  box-shadow: 0 4px 16px rgba(156, 39, 176, 0.3);
}

.users-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.create-btn {
  background: linear-gradient(135deg, #ff9800 0%, #f57c00 100%);
  color: #fff;
  box-shadow: 0 2px 8px rgba(255, 152, 0, 0.2);
}

.create-btn:hover:not(:disabled) {
  background: linear-gradient(135deg, #f57c00 0%, #e65100 100%);
  transform: translateY(-2px);
  box-shadow: 0 4px 16px rgba(255, 152, 0, 0.3);
}

.create-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.commands-empty {
  background: #fff;
  border: 2px dashed #e0e0e0;
  border-radius: 12px;
  text-align: center;
  padding: 80px 20px;
  color: #bbb;
  font-size: 15px;
  font-weight: 500;
}

@media (max-width: 768px) {
  .commands-container {
    padding: 24px 16px;
    gap: 20px;
  }

  .devices-selector {
    padding: 20px 24px;
  }

  .command-card__body {
    padding: 24px;
    gap: 24px;
  }

  .command-item {
    flex-direction: column;
    align-items: stretch;
    gap: 16px;
    padding: 20px;
  }

  .command-btn {
    width: 100%;
    padding: 12px 20px;
  }

  .command-input-group {
    flex-direction: column;
  }

  .command-date-group {
    flex-direction: column;
  }

  .command-input {
    width: 100%;
    min-width: unset;
  }
}
</style>
