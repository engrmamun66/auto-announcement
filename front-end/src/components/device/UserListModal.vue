<script setup>
import { ref, inject, watch } from 'vue'
import Modal from '../modal.vue'
import FingerprintDetailsModal from './FingerprintDetailsModal.vue'
import FingerSelectionModal from './FingerSelectionModal.vue'

const props = defineProps({
  modelValue: Boolean,
  users: {
    type: Array,
    default: () => []
  },
  device: {
    type: Object,
    default: null
  }
})

const emit = defineEmits(['update:modelValue'])

const helper = inject('helper')
const http = inject('http')
const emitter = inject('emitter')

const selectedUsers = ref(new Set())
const selectAllChecked = ref(false)
const syncing = ref(false)
const fingerprints = ref({})
const loadingFingerprints = ref(false)
const showFingerprintDetails = ref(false)
const selectedFingerprint = ref({ pin: '', userName: '' })
const showFingerSelection = ref(false)
const enrollingUser = ref({ pin: '', name: '' })
const enrolledFidsForEnroll = ref([])

async function fetchFingerprints() {
  if (!props.device) return;
  loadingFingerprints.value = true;
  try {
    const response = await fetch(`/${props.device.serial_number}/get-fingerprints`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    });
    const data = await response.json();
    const fpMap = {};
    (data.fingerprints || []).forEach(fp => {
      const pin = String(fp['FP PIN'] || fp.PIN || fp.pin);
      const fid = parseInt(fp.FID || 0);
      if (!fpMap[pin]) fpMap[pin] = { count: 0, fids: [] };
      fpMap[pin].count++;
      if (!fpMap[pin].fids.includes(fid)) {
        fpMap[pin].fids.push(fid);
      }
    });
    fingerprints.value = fpMap;
    console.log('Fingerprints loaded:', fpMap);
  } catch (err) {
    console.error('Fetch fingerprints error:', err);
  } finally {
    loadingFingerprints.value = false;
  }
}

function getFingerprintCount(pin) {
  const fpData = fingerprints.value[String(pin)];
  return fpData ? fpData.count : 0;
}

function getEnrolledFids(pin) {
  const fpData = fingerprints.value[String(pin)];
  return fpData ? fpData.fids : [];
}

function handleFingerprintClick(pin, userName) {
  const count = getFingerprintCount(pin)
  if (count === 0) return
  selectedFingerprint.value = { pin: String(pin), userName }
  showFingerprintDetails.value = true
}

function handleEnrollFingerprint(pin, name) {
  enrollingUser.value = { pin: String(pin), name }
  enrolledFidsForEnroll.value = getEnrolledFids(pin)
  showFingerSelection.value = true
}

async function handleFingerSelected({ fid, fingerName }) {
  if (!props.device || !enrollingUser.value.pin) return

  emitter.emit('toaster-info', { message: `Selected: ${fingerName} (FID: ${fid})` })
  console.log(`Enroll fingerprint: PIN=${enrollingUser.value.pin}, FID=${fid}`)
}

function toggleSelectAll() {
  if (selectAllChecked.value) {
    selectedUsers.value.clear();
    selectAllChecked.value = false;
  } else {
    props.users.forEach((_, idx) => selectedUsers.value.add(idx));
    selectAllChecked.value = true;
  }
}

function toggleUserSelection(idx) {
  if (selectedUsers.value.has(idx)) {
    selectedUsers.value.delete(idx);
    selectAllChecked.value = false;
  } else {
    selectedUsers.value.add(idx);
    if (selectedUsers.value.size === props.users.length) {
      selectAllChecked.value = true;
    }
  }
}

async function handleSyncCards() {
  if (selectedUsers.value.size === 0) {
    emitter.emit('toaster-warning', { message: 'No users selected' });
    return;
  }

  syncing.value = true;
  const selectedUsersList = Array.from(selectedUsers.value).map(idx => props.users[idx]);

  try {
    let successCount = 0;
    for (const user of selectedUsersList) {
      const pin = user['USER PIN'];
      const card = user.Card;

      if (!pin) continue;

      try {
        await http.patch(`/students/bulk-sync-card`, {
          dakhela: pin,
          card_number: card || ''
        });
        successCount++;
      } catch (err) {
        console.warn(`Failed to sync card for PIN ${pin}:`, err);
      }
    }

    if (successCount === selectedUsersList.length) {
      emitter.emit('toaster-success', { message: `Synced ${successCount} card(s)` });
    } else {
      emitter.emit('toaster-warning', { message: `Synced ${successCount} of ${selectedUsersList.length} card(s)` });
    }

    selectedUsers.value.clear();
    selectAllChecked.value = false;
  } catch (err) {
    console.error('Sync cards error:', err);
    emitter.emit('toaster-error', { message: 'Failed to sync cards' });
  } finally {
    syncing.value = false;
  }
}

function getPrivilegeLabel(pri) {
  const privilege = parseInt(pri);
  switch(privilege) {
    case 0: return 'User';
    case 1: return 'Enroller';
    case 6: return 'Admin';
    case 14: return 'Super Admin';
    default: return `Level ${privilege}`;
  }
}

function getPrivilegeClass(pri) {
  const privilege = parseInt(pri);
  if (privilege >= 6) return 'admin';
  if (privilege === 1) return 'enroller';
  return 'user';
}

function handleClose() {
  emit('update:modelValue', false)
}

watch(() => props.modelValue, (newVal) => {
  if (newVal) {
    fetchFingerprints();
  }
})
</script>

<template>
  <Modal
    :modelValue="modelValue"
    @update:modelValue="(val) => emit('update:modelValue', val)"
    @close="handleClose"
    :title="`Device Users - ${device?.name || device?.serial_number || 'Unknown'}`"
    width="800px"
    :close-on-esc="true"
    :close-on-click-away="true"
  >
    <div class="users-modal-content">
      <div class="users-stats">
        <span class="stat-badge" @click="fetchFingerprints()">Total Users: <strong>{{ users.length }}</strong></span>
        <span class="stat-badge selected">Selected: <strong>{{ selectedUsers.size }}</strong></span>
        <button
          @click="handleSyncCards"
          :disabled="syncing || selectedUsers.size == 0"
          class="sync-btn"
        >
          <i class='bx bx-sync'></i>
          {{ syncing ? 'Syncing...' : 'Sync Cards' }}
        </button>
      </div>

      <div class="users-table-wrapper">
        <table class="users-table">
          <thead>
            <tr>
              <th class="col-checkbox">
                <input
                  type="checkbox"
                  :checked="selectAllChecked"
                  @change="toggleSelectAll"
                  class="select-all-checkbox"
                />
              </th>
              <th>PIN</th>
              <th>Name</th>
              <th>Card</th>
              <th>Group</th>
              <th>Fingerprints</th>
              <th>Privilege</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(user, idx) in users" :key="idx" :class="{ 'user-row-empty': !user.Name, 'user-row-selected': selectedUsers.has(idx) }">
              <td class="col-checkbox">
                <input
                  type="checkbox"
                  :checked="selectedUsers.has(idx)"
                  @change="toggleUserSelection(idx)"
                  class="user-checkbox"
                />
              </td>
              <td class="col-pin">
                <span class="pin-badge">{{ user['USER PIN'] }}</span>
              </td>
              <td class="col-name">
                <span v-if="user.Name" class="name-text">{{ user.Name }}</span>
                <span v-else class="empty-text">-</span>
              </td>
              <td class="col-card">
                <span v-if="user.Card" class="card-text">{{ user.Card }}</span>
                <span v-else class="empty-text">-</span>
              </td>
              <td class="col-group">{{ user.Grp || '-' }}</td>
              <td class="col-fingerprints">
                <div class="fp-controls">
                  <span v-if="loadingFingerprints" class="fp-loading">Loading...</span>
                  <span
                    v-else
                    class="fp-badge"
                    :class="{ 'fp-clickable': getFingerprintCount(user['USER PIN']) > 0 }"
                    @click="handleFingerprintClick(user['USER PIN'], user.Name)"
                  >
                    {{ getFingerprintCount(user['USER PIN']) }}
                  </span>
                  <button
                    class="fp-enroll-btn"
                    @click="handleEnrollFingerprint(user['USER PIN'], user.Name)"
                    title="Enroll new fingerprint"
                  >
                    <i class='bx bx-plus-circle'></i>
                  </button>
                </div>
              </td>
              <td class="col-privilege">
                <span class="privilege-badge" :class="getPrivilegeClass(parseInt(user.Pri))">
                  {{ getPrivilegeLabel(user.Pri) }}
                </span>
              </td>
            </tr>
            <tr v-if="!users.length">
              <td colspan="7" class="text-center text-muted">No users found</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </Modal>

  <FingerprintDetailsModal
    v-model="showFingerprintDetails"
    :device="device"
    :pin="selectedFingerprint.pin"
    :userName="selectedFingerprint.userName"
    :onRefresh="fetchFingerprints"
  />

  <FingerSelectionModal
    v-model="showFingerSelection"
    :device="device"
    :pin="enrollingUser.pin"
    :userName="enrollingUser.name"
    :enrolledFids="enrolledFidsForEnroll"
    :onRefreshFingerprints="fetchFingerprints"
    @select-finger="handleFingerSelected"
  />
</template>

<style scoped>
.users-stats {
  display: flex;
  gap: 12px;
  margin-bottom: 20px;
  padding: 0 4px;
}

.stat-badge {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 8px 16px;
  background: #f0f0f0;
  border-radius: 6px;
  font-size: 13px;
  font-weight: 600;
  color: #555;
}

.stat-badge.selected {
  background: linear-gradient(135deg, #2196f3 0%, #1976d2 100%);
  color: #fff;
}

.sync-btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 8px 16px;
  background: linear-gradient(135deg, #4caf50 0%, #45a049 100%);
  color: #fff;
  border: none;
  border-radius: 6px;
  font-weight: 700;
  font-size: 13px;
  cursor: pointer;
  transition: all 0.2s;
  text-transform: uppercase;
  letter-spacing: 0.3px;
}

.sync-btn:hover:not(:disabled) {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(76, 175, 80, 0.3);
}

.sync-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.users-table-wrapper {
  max-height: 600px;
  overflow-y: auto;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
}

.users-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 13px;
}

.users-table thead {
  position: sticky;
  top: 0;
  background: linear-gradient(135deg, #f9f9fb 0%, #f0f0f0 100%);
  z-index: 10;
}

.users-table th {
  padding: 14px 12px;
  text-align: left;
  font-weight: 700;
  color: #2c3e50;
  border-bottom: 2px solid #ddd;
  letter-spacing: -0.2px;
}

.users-table tbody tr {
  border-bottom: 1px solid #f0f0f0;
  transition: background-color 0.15s;
}

.users-table tbody tr:hover {
  background: #f9f9fb;
}

.users-table tbody tr.user-row-selected {
  background: linear-gradient(135deg, rgba(33, 150, 243, 0.08) 0%, rgba(33, 150, 243, 0.04) 100%);
  border-left: 3px solid #2196f3;
  padding-left: 0;
}

.users-table tbody tr.user-row-empty {
  opacity: 0.7;
  background: #fafafa;
}

.users-table td {
  padding: 12px;
  color: #333;
}

.col-checkbox {
  width: 50px;
  text-align: center;
  padding: 12px !important;
}

.select-all-checkbox,
.user-checkbox {
  width: 18px;
  height: 18px;
  cursor: pointer;
  accent-color: #2196f3;
  display: block;
  margin: 0 auto;
}

.col-pin {
  width: 90px;
}

.pin-badge {
  display: inline-block;
  background: linear-gradient(135deg, #2196f3 0%, #1976d2 100%);
  color: #fff;
  padding: 4px 10px;
  border-radius: 6px;
  font-weight: 700;
  font-size: 12px;
}

.col-name {
  flex: 1;
  min-width: 150px;
}

.name-text {
  color: #2c3e50;
  font-weight: 600;
}

.col-card {
  width: 110px;
}

.card-text {
  font-family: 'Courier New', monospace;
  color: #666;
  font-weight: 500;
}

.col-privilege {
  width: 120px;
}

.privilege-badge {
  display: inline-block;
  padding: 4px 10px;
  border-radius: 6px;
  font-weight: 700;
  font-size: 11px;
  text-transform: uppercase;
  letter-spacing: 0.3px;
}

.privilege-badge.admin {
  background: linear-gradient(135deg, #f44336 0%, #d32f2f 100%);
  color: #fff;
}

.privilege-badge.enroller {
  background: linear-gradient(135deg, #ff9800 0%, #f57c00 100%);
  color: #fff;
}

.privilege-badge.user {
  background: linear-gradient(135deg, #4caf50 0%, #45a049 100%);
  color: #fff;
}

.col-group {
  width: 70px;
  text-align: center;
  color: #666;
}

.col-fingerprints {
  width: 110px;
  text-align: center;
}

.fp-controls {
  display: flex;
  align-items: center;
  gap: 6px;
}

.fp-badge {
  display: inline-block;
  background: linear-gradient(135deg, #9c27b0 0%, #7b1fa2 100%);
  color: #fff;
  padding: 4px 12px;
  border-radius: 6px;
  font-weight: 700;
  font-size: 12px;
  min-width: 30px;
  text-align: center;
}

.fp-badge.fp-clickable {
  cursor: pointer;
  transition: all 0.2s;
}

.fp-badge.fp-clickable:hover {
  transform: scale(1.05);
  box-shadow: 0 4px 12px rgba(156, 39, 176, 0.4);
}

.fp-enroll-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  padding: 0;
  background: linear-gradient(135deg, #4caf50 0%, #45a049 100%);
  color: #fff;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.2s;
  font-size: 14px;
}

.fp-enroll-btn:hover {
  transform: scale(1.1);
  box-shadow: 0 2px 8px rgba(76, 175, 80, 0.4);
}

.fp-enroll-btn:active {
  transform: scale(0.95);
}

.fp-loading {
  color: #999;
  font-size: 12px;
}

.empty-text {
  color: #bbb;
  font-style: italic;
}

.text-center {
  text-align: center;
}

.text-muted {
  color: #999;
}

@media (max-width: 768px) {
  .users-table-wrapper {
    max-height: 400px;
  }

  .users-table th,
  .users-table td {
    padding: 10px 8px;
    font-size: 12px;
  }

  .col-name {
    min-width: 100px;
  }

  .col-card {
    display: none;
  }

  .col-group {
    display: none;
  }
}
</style>
