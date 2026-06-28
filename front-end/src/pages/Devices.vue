<template>
  <div class="devices-page">

    <!-- Tab Navigation -->
    <ul class="nav nav-tabs mt-0 mb-3">
      <li class="nav-item">
        <a @click.stop="activeTab = 'devices'" class="nav-link cp text-black" :class="{'active': activeTab === 'devices'}">
          <i class='bx bxs-server' style="vertical-align:-2px;margin-right:4px"></i> {{ helper.t('Devices') }}
        </a>
      </li>
      <li class="nav-item">
        <a @click.stop="activeTab = 'commands'" class="nav-link cp text-black" :class="{'active': activeTab === 'commands'}">
          <i class='bx bxs-terminal' style="vertical-align:-2px;margin-right:4px"></i> {{ helper.t('Commands') }}
        </a>
      </li>
    </ul>

    <!-- Devices Tab -->
    <div v-show="activeTab === 'devices'" class="devices-tab-content">
      <DeviceList
        :devices="devices"
        @edit="editDevice"
        @delete="deleteDevice"
      />
    </div>

    <!-- Commands Tab -->
    <div v-show="activeTab === 'commands'" class="devices-tab-content">
      <DeviceCommands
        :devices="devices"
        :executingCommand="executingCommand"
        @restart="executeRestart"
      />
    </div>

    <!-- Password Confirmation Modal -->
    <ConfirmByPassword
      v-model="showPasswordConfirm"
      @yes="confirmDelete"
    />

    <!-- Edit Modal -->
    <DeviceEdit
      :editingDevice="editingDevice"
      @close="editingDevice = null"
      @save="saveDevice"
    />
  </div>
</template>

<script setup>
import { ref, inject, onMounted, onBeforeUnmount, watch } from 'vue';
import ConfirmByPassword from '@/components/ConfirmByPassword.vue';
import DeviceList from '@/components/device/DeviceList.vue';
import DeviceEdit from '@/components/device/DeviceEdit.vue';
import DeviceCommands from '@/components/device/DeviceCommands.vue';

const helper = inject('helper');
const http = inject('http');
const emitter = inject('emitter');

const devices = ref([]);
const editingDevice = ref(null);
const activeTab = ref(localStorage.getItem('devicesActiveTab') || 'devices');
const showPasswordConfirm = ref(false);
const deviceToDelete = ref(null);
const selectedDeviceId = ref('');
const executingCommand = ref(false);

watch(activeTab, (newTab) => {
  localStorage.setItem('devicesActiveTab', newTab);
});

function editDevice(device) {
  editingDevice.value = { ...device };
}

function saveDevice(payload) {
  http.post('/devices/update', payload)
    .then((res) => {
      emitter.emit('toaster-success', { message: helper.t('Device updated') });
      editingDevice.value = null;
      fetchDevices();
    })
    .catch((err) => {
      console.error('Save device error:', err);
      emitter.emit('toaster-error', { message: helper.t('Update failed') });
    });
}

function deleteDevice(id) {
  deviceToDelete.value = id;
  showPasswordConfirm.value = true;
}

function confirmDelete() {
  http.post(`/devices/delete/${deviceToDelete.value}`)
    .then(() => {
      emitter.emit('toaster-success', { message: helper.t('Device deleted') });
      fetchDevices();
      deviceToDelete.value = null;
    })
    .catch(() => {
      emitter.emit('toaster-error', { message: helper.t('Delete failed') });
    });
}

function fetchDevices() {
  http.get('/devices')
    .then((res) => {
      devices.value = res.data.data || [];
      console.log(`✅ Fetched ${devices.value.length} devices from API`);
    })
    .catch((err) => {
      console.error('❌ Fetch devices error:', err);
    });
}

function handleDevicesUpdate(data) {
  if (data.type === 'devices_updated') {
    devices.value = data.data || [];
    console.log(`📡 Received ${devices.value.length} devices from socket`);
  }
}

function executeRestart(device) {
  if (!device) return;

  executingCommand.value = true;
  http.post(`/devices/restart/${device.serial_number}`)
    .then(() => {
      emitter.emit('toaster-success', { message: helper.t('Restart command sent') });
    })
    .catch(() => {
      emitter.emit('toaster-error', { message: helper.t('Restart command failed') });
    })
    .finally(() => {
      executingCommand.value = false;
    });
}

onMounted(() => {
  fetchDevices();
  emitter.on('on_socket_message', handleDevicesUpdate);
});

onBeforeUnmount(() => {
  emitter.off('on_socket_message', handleDevicesUpdate);
});
</script>

<style scoped>
.devices-page {
  padding: 20px;
  max-width: 1200px;
  margin: 0 auto;
}

.devices-tab-content {
  animation: fadeIn 0.2s ease-in;
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}
</style>
