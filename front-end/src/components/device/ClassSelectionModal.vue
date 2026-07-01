<script setup>
import { ref, inject, watch, computed } from 'vue'
import Modal from '../modal.vue'
import ConfirmByPassword from '../ConfirmByPassword.vue'

const props = defineProps({
  modelValue: Boolean,
  device: {
    type: Object,
    default: null
  }
})

const emit = defineEmits(['update:modelValue', 'create-users'])

const helper = inject('helper')
const http = inject('http')
const emitter = inject('emitter')
const injectedClasses = inject('classes', ref([]))

const selectedClasses = ref(new Set())
const selectAllChecked = ref(false)
const creating = ref(false)
const showPasswordModal = ref(false)
const operationMode = ref('create') // 'create' or 'delete'
const pendingStudents = ref([])

const classes = computed(() => {
  return Array.isArray(injectedClasses.value) ? injectedClasses.value : []
})

async function fetchStudentsByClasses(classIds) {
  if (!classIds.length) return []

  try {
    const response = await http.post('/students/by-classes', { class_ids: classIds })
    return response.data || response || []
  } catch (err) {
    console.error('Fetch students error:', err)
    return []
  }
}

function toggleSelectAll() {
  if (selectAllChecked.value) {
    selectedClasses.value.clear()
    selectAllChecked.value = false
  } else {
    classes.value.forEach((_, idx) => selectedClasses.value.add(idx))
    selectAllChecked.value = true
  }
}

function toggleClassSelection(idx) {
  if (selectedClasses.value.has(idx)) {
    selectedClasses.value.delete(idx)
    selectAllChecked.value = false
  } else {
    selectedClasses.value.add(idx)
    if (selectedClasses.value.size === props.classes?.length) {
      selectAllChecked.value = true
    }
  }
}

async function handleCreate() {
  if (selectedClasses.value.size === 0) {
    emitter.emit('toaster-warning', { message: 'No classes selected' })
    return
  }

  creating.value = true
  try {
    const selectedClassShorts = Array.from(selectedClasses.value).map(idx => classes.value[idx]?.class_short)
    const classStudents = await fetchStudentsByClasses(selectedClassShorts)

    if (classStudents.length === 0) {
      emitter.emit('toaster-warning', { message: 'No students found in selected classes' })
      creating.value = false
      return
    }

    emit('create-users', classStudents)
    handleClose()
    emitter.emit('toaster-success', { message: `Sending ${classStudents.length} students to device` })
  } catch (err) {
    console.error('Create users error:', err)
    emitter.emit('toaster-error', { message: 'Failed to create users' })
  } finally {
    creating.value = false
  }
}

async function handleDeleteClick() {
  if (selectedClasses.value.size === 0) {
    emitter.emit('toaster-warning', { message: 'No classes selected' })
    return
  }

  creating.value = true
  try {
    const selectedClassShorts = Array.from(selectedClasses.value).map(idx => classes.value[idx]?.class_short)
    const classStudents = await fetchStudentsByClasses(selectedClassShorts)

    if (classStudents.length === 0) {
      emitter.emit('toaster-warning', { message: 'No students found in selected classes' })
      creating.value = false
      return
    }

    operationMode.value = 'delete'
    pendingStudents.value = classStudents
    showPasswordModal.value = true
  } catch (err) {
    console.error('Fetch students error:', err)
    emitter.emit('toaster-error', { message: 'Failed to fetch students' })
  } finally {
    creating.value = false
  }
}

async function handlePasswordConfirm() {
  if (!props.device || pendingStudents.value.length === 0) return

  creating.value = true
  try {
    const device = props.device
    const pins = pendingStudents.value.map(s => String(s.dakhela || s.id))

    const res = await fetch(`/${device.serial_number}/remove-users`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ pins })
    })

    if (!res.ok) throw new Error('Delete failed')

    emitter.emit('toaster-success', { message: `Deleted ${pins.length} users from device` })
    handleClose()
  } catch (err) {
    console.error('Delete users error:', err)
    emitter.emit('toaster-error', { message: 'Failed to delete users' })
  } finally {
    creating.value = false
    showPasswordModal.value = false
    operationMode.value = 'create'
    pendingStudents.value = []
  }
}

function handleClose() {
  emit('update:modelValue', false)
}

function handlePasswordCancel() {
  showPasswordModal.value = false
  operationMode.value = 'create'
  pendingStudents.value = []
}

watch(() => props.modelValue, (newVal) => {
  if (newVal) {
    selectedClasses.value.clear()
    selectAllChecked.value = false
  }
})
</script>

<template>
  <Modal
    :modelValue="modelValue"
    @update:modelValue="(val) => emit('update:modelValue', val)"
    @close="handleClose"
    :title="`Select Classes - ${device?.name || device?.serial_number || 'Device'}`"
    width="700px"
    :close-on-esc="true"
    :close-on-click-away="true"
  >
    <div class="classes-modal-content">
      <div class="classes-stats">
        <span class="stat-badge">Total Classes: <strong>{{ classes.length }}</strong></span>
        <span v-if="selectedClasses.size > 0" class="stat-badge selected">Selected: <strong>{{ selectedClasses.size }}</strong></span>
        <div class="action-buttons">
          <button
            v-if="selectedClasses.size > 0"
            @click="handleCreate"
            :disabled="creating"
            class="action-btn create-btn"
          >
            <i class='bx bx-plus'></i>
            {{ creating ? 'Loading...' : 'Create Users' }}
          </button>
          <button
            v-if="selectedClasses.size > 0"
            @click="handleDeleteClick"
            :disabled="creating"
            class="action-btn delete-btn"
          >
            <i class='bx bx-trash'></i>
            {{ creating ? 'Loading...' : 'Delete Users' }}
          </button>
        </div>
      </div>

      <div class="classes-table-wrapper">
        <table class="classes-table">
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
              <th>Class Name</th>
              <th>Short Code</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(cls, idx) in classes" :key="idx" :class="{ 'class-row-selected': selectedClasses.has(idx) }">
              <td class="col-checkbox">
                <input
                  type="checkbox"
                  :checked="selectedClasses.has(idx)"
                  @change="toggleClassSelection(idx)"
                  class="class-checkbox"
                />
              </td>
              <td class="col-name">{{ cls.class_name || cls.name || '-' }}</td>
              <td class="col-short">{{ cls.class_short || cls.short || '-' }}</td>
            </tr>
            <tr v-if="classes.length === 0">
              <td colspan="3" class="text-center text-muted">No classes found</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </Modal>

  <ConfirmByPassword
    v-model="showPasswordModal"
    @yes="handlePasswordConfirm"
    @no="handlePasswordCancel"
  />
</template>

<style scoped>
.classes-modal-content {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.classes-stats {
  display: flex;
  gap: 12px;
  padding: 0 4px;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
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

.action-buttons {
  display: flex;
  gap: 8px;
}

.action-btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 8px 16px;
  border: none;
  border-radius: 6px;
  font-weight: 700;
  font-size: 13px;
  cursor: pointer;
  transition: all 0.2s;
  text-transform: uppercase;
  letter-spacing: 0.3px;
}

.create-btn {
  background: linear-gradient(135deg, #4caf50 0%, #45a049 100%);
  color: #fff;
  box-shadow: 0 2px 8px rgba(76, 175, 80, 0.2);
}

.create-btn:hover:not(:disabled) {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(76, 175, 80, 0.3);
}

.create-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.delete-btn {
  background: linear-gradient(135deg, #f44336 0%, #d32f2f 100%);
  color: #fff;
  box-shadow: 0 2px 8px rgba(244, 67, 54, 0.2);
}

.delete-btn:hover:not(:disabled) {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(244, 67, 54, 0.3);
}

.delete-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.classes-table-wrapper {
  max-height: 500px;
  overflow-y: auto;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
}

.classes-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 13px;
}

.classes-table thead {
  position: sticky;
  top: 0;
  background: linear-gradient(135deg, #f9f9fb 0%, #f0f0f0 100%);
  z-index: 10;
}

.classes-table th {
  padding: 14px 12px;
  text-align: left;
  font-weight: 700;
  color: #2c3e50;
  border-bottom: 2px solid #ddd;
  letter-spacing: -0.2px;
}

.classes-table tbody tr {
  border-bottom: 1px solid #f0f0f0;
  transition: background-color 0.15s;
}

.classes-table tbody tr:hover {
  background: #f9f9fb;
}

.classes-table tbody tr.class-row-selected {
  background: linear-gradient(135deg, rgba(33, 150, 243, 0.08) 0%, rgba(33, 150, 243, 0.04) 100%);
  border-left: 3px solid #2196f3;
}

.classes-table td {
  padding: 12px;
  color: #333;
}

.col-checkbox {
  width: 50px;
  text-align: center;
  padding: 12px !important;
}

.select-all-checkbox,
.class-checkbox {
  width: 18px;
  height: 18px;
  cursor: pointer;
  accent-color: #2196f3;
  display: block;
  margin: 0 auto;
}

.col-name {
  flex: 1;
  min-width: 150px;
  font-weight: 600;
  color: #2c3e50;
}

.col-short {
  width: 120px;
  text-align: center;
  color: #666;
  font-family: 'Courier New', monospace;
  font-weight: 500;
}

.text-center {
  text-align: center;
}

.text-muted {
  color: #999;
}

@media (max-width: 768px) {
  .classes-stats {
    flex-direction: column;
    align-items: stretch;
  }

  .action-buttons {
    width: 100%;
    flex-direction: column;
  }

  .action-btn {
    width: 100%;
    justify-content: center;
  }

  .classes-table-wrapper {
    max-height: 400px;
  }

  .classes-table th,
  .classes-table td {
    padding: 10px 8px;
    font-size: 12px;
  }

  .col-teacher {
    display: none;
  }

  .col-name {
    min-width: 100px;
  }
}
</style>
