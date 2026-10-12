<script setup>
// After an Excel file is inspected: map its sheets to what they contain (drag & drop, or the dropdowns),
// choose "Force data as new entry", then run the import.
import { ref, reactive, computed, inject } from 'vue'
import Modal from './modal.vue'
import BtnLoader from './BtnLoader.vue'

const props = defineProps({
  inspection: { type: Object, required: true }, // { token, file_name, sheets: [{name, rows, headers}], suggested, attendance_months }
})
const emit = defineEmits(['close', 'imported'])

const http = inject('http')
const helper = inject('helper')
const emitter = inject('emitter')

const TARGETS = [
  { key: 'students', label: 'Students', icon: 'bx bxs-user', hint: 'name, dakhela, class' },
  { key: 'schedules', label: 'Schedules', icon: 'bx bxs-calendar', hint: 'type, start_time, end_time, classes' },
  { key: 'settings', label: 'Settings', icon: 'bx bxs-cog', hint: 'key, part, value' },
  { key: 'attendance', label: 'Attendance', icon: 'bx bx-user-pin', hint: 'student_id, date, status' },
]

const mapping = reactive({ students: null, schedules: null, settings: null, attendance: null, ...(props.inspection.suggested || {}) })
const forceAsNewEntry = ref(false)
const importing = ref(false)
const dragOver = ref(null)
const draggingSheet = ref(null)

const sheetByName = (name) => props.inspection.sheets.find(s => s.name === name)
const assignedTo = (sheetName) => Object.keys(mapping).find(k => mapping[k] === sheetName)
const hasMapping = computed(() => Object.values(mapping).some(Boolean))

function assign(target, sheetName) {
  // A sheet can feed only one target
  Object.keys(mapping).forEach(k => { if (mapping[k] === sheetName) mapping[k] = null })
  mapping[target] = sheetName || null
}

function onDragStart(e, sheetName) {
  draggingSheet.value = sheetName
  e.dataTransfer.effectAllowed = 'move'
  e.dataTransfer.setData('text/plain', sheetName)
}
function onDrop(e, target) {
  const sheetName = e.dataTransfer.getData('text/plain') || draggingSheet.value
  dragOver.value = null
  draggingSheet.value = null
  if (sheetName && sheetByName(sheetName)) assign(target, sheetName)
}

async function runImport() {
  if (!hasMapping.value) return
  if (mapping.settings && !confirm(helper.t('Importing Settings will replace the current settings with the ones in the file. Continue?'))) return
  importing.value = true
  try {
    const res = await http.post('/data/import/run', {
      token: props.inspection.token,
      mapping: { ...mapping },
      force_as_new_entry: forceAsNewEntry.value,
    })
    emitter.emit('toaster-success', { message: helper.t('Import completed') })
    emit('imported', res.data)
  } catch (err) {
    emitter.emit('toaster-error', { message: err?.response?.data?.error || helper.t('Import failed') })
    if (err?.response?.data?.partial) emit('imported', err.response.data.partial)
  } finally {
    importing.value = false
  }
}
</script>

<template>
  <Modal :title="helper.t('Import from Excel')" width="880px" @close="emit('close')">
    <div class="imap">
      <p class="imap__file"><i class='bx bxs-file'></i> {{ inspection.file_name }}</p>
      <p class="imap__help">{{ helper.t('Drag each sheet onto what it contains, or pick it from the list. Leave a box empty to skip it.') }}</p>

      <div class="imap__grid">
        <!-- Sheets in the file -->
        <div class="imap__sheets">
          <div class="imap__col-title">{{ helper.t('Sheets in this file') }}</div>
          <div v-for="sheet in inspection.sheets" :key="sheet.name"
            class="imap__sheet" :class="{ 'is-used': assignedTo(sheet.name) }"
            draggable="true" @dragstart="onDragStart($event, sheet.name)" @dragend="draggingSheet = null; dragOver = null"
            :title="sheet.headers.join(', ')">
            <i class='bx bx-grid-vertical imap__grip'></i>
            <div class="imap__sheet-main">
              <div class="imap__sheet-name">{{ sheet.name }}</div>
              <div class="imap__sheet-meta">{{ helper.t('{count} rows', { count: sheet.rows }) }}<template v-if="sheet.headers.length"> · {{ sheet.headers.slice(0, 4).join(', ') }}{{ sheet.headers.length > 4 ? '…' : '' }}</template></div>
            </div>
            <span v-if="assignedTo(sheet.name)" class="imap__tag">→ {{ helper.t(TARGETS.find(t => t.key === assignedTo(sheet.name)).label) }}</span>
          </div>
          <div v-if="!inspection.sheets.length" class="text-muted small">{{ helper.t('No sheets found') }}</div>
        </div>

        <!-- Targets -->
        <div class="imap__targets">
          <div class="imap__col-title">{{ helper.t('Import into') }}</div>
          <div v-for="target in TARGETS" :key="target.key"
            class="imap__target" :class="{ 'is-over': dragOver === target.key, 'is-set': mapping[target.key] }"
            @dragover.prevent="dragOver = target.key" @dragleave="dragOver === target.key && (dragOver = null)" @drop.prevent="onDrop($event, target.key)">
            <div class="imap__target-head">
              <i :class="target.icon"></i>
              <strong>{{ helper.t(target.label) }}</strong>
              <span class="imap__target-hint">{{ target.hint }}</span>
            </div>
            <div class="imap__target-body">
              <div v-if="mapping[target.key]" class="imap__chip">
                <i class='bx bxs-spreadsheet'></i> {{ mapping[target.key] }}
                <small>({{ helper.t('{count} rows', { count: sheetByName(mapping[target.key])?.rows ?? 0 }) }})</small>
                <button type="button" class="imap__chip-x" :title="helper.t('Remove')" @click="mapping[target.key] = null">×</button>
              </div>
              <div v-else class="imap__drop">{{ helper.t('Drop a sheet here') }}</div>
              <!-- Fallback for touch screens, where drag & drop is not available -->
              <select class="imap__select" :value="mapping[target.key] || ''" @change="assign(target.key, $event.target.value)">
                <option value="">{{ helper.t('— Skip —') }}</option>
                <option v-for="sheet in inspection.sheets" :key="sheet.name" :value="sheet.name">{{ sheet.name }}</option>
              </select>
            </div>
            <div v-if="target.key === 'settings' && mapping.settings" class="imap__warn">
              <i class='bx bxs-error'></i> {{ helper.t('Replaces the current settings (classes, logo, etc.) with the ones in this sheet.') }}
            </div>
            <div v-if="target.key === 'attendance' && mapping.attendance" class="imap__note">
              {{ helper.t('Existing records with the same student, date and shift are updated.') }}
            </div>
          </div>
        </div>
      </div>

      <label class="imap__force">
        <input type="checkbox" v-model="forceAsNewEntry" />
        <span>
          <strong>{{ helper.t('Force data as new entry') }}</strong>
          <small>{{ helper.t('Always add rows as new records instead of updating existing ones.') }}</small>
        </span>
      </label>

      <div class="imap__actions">
        <button type="button" class="btn btn-secondary" :disabled="importing" @click="emit('close')">{{ helper.t('Cancel') }}</button>
        <button type="button" class="btn btn-primary" :disabled="!hasMapping || importing" @click="runImport">
          <i class='bx bxs-file-import'></i> {{ importing ? helper.t('Importing...') : helper.t('Import') }} <BtnLoader v-if="importing"></BtnLoader>
        </button>
      </div>
    </div>
  </Modal>
</template>

<style scoped>
.imap__file{ font-weight: 600; margin: 4px 0 2px; color: #1f2937; }
.imap__help{ font-size: 13px; color: #64748b; margin-bottom: 12px; }
.imap__grid{ display: grid; grid-template-columns: 1fr 1.3fr; gap: 16px; }
.imap__col-title{ font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.4px; color: #64748b; margin-bottom: 8px; }

.imap__sheets{ display: flex; flex-direction: column; gap: 8px; }
.imap__sheet{
  display: flex; align-items: center; gap: 8px;
  padding: 8px 10px; border-radius: 10px;
  background: #fff; border: 1px solid #e2e8f0;
  box-shadow: 0 1px 3px rgba(15, 23, 42, 0.06);
  cursor: grab; user-select: none;
  transition: border-color 0.15s, box-shadow 0.15s;
}
.imap__sheet:hover{ border-color: #93c5fd; box-shadow: 0 3px 8px rgba(15, 23, 42, 0.1); }
.imap__sheet:active{ cursor: grabbing; }
.imap__sheet.is-used{ background: #f0fdf4; border-color: #86efac; }
.imap__grip{ color: #94a3b8; font-size: 18px; }
.imap__sheet-main{ min-width: 0; flex: 1; }
.imap__sheet-name{ font-weight: 700; color: #0f172a; }
.imap__sheet-meta{ font-size: 11px; color: #64748b; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.imap__tag{ font-size: 11px; font-weight: 700; color: #15803d; white-space: nowrap; }

.imap__targets{ display: flex; flex-direction: column; gap: 10px; }
.imap__target{
  border: 2px dashed #cbd5e1; border-radius: 12px; padding: 10px 12px;
  background: #f8fafc; transition: border-color 0.15s, background 0.15s;
}
.imap__target.is-set{ border-style: solid; border-color: #86efac; background: #fff; }
.imap__target.is-over{ border-color: #3b82f6; background: #eff6ff; }
.imap__target-head{ display: flex; align-items: center; gap: 6px; color: #1f2937; }
.imap__target-hint{ margin-left: auto; font-size: 11px; color: #94a3b8; }
.imap__target-body{ display: flex; align-items: center; gap: 8px; margin-top: 8px; flex-wrap: wrap; }
.imap__drop{ flex: 1; min-width: 140px; font-size: 12px; color: #94a3b8; font-style: italic; }
.imap__chip{
  flex: 1; min-width: 140px; display: inline-flex; align-items: center; gap: 6px;
  padding: 4px 10px; border-radius: 999px; background: #dcfce7; color: #166534; font-weight: 600; font-size: 13px;
}
.imap__chip small{ font-weight: 400; color: #15803d; }
.imap__chip-x{ margin-left: auto; border: none; background: transparent; color: #166534; font-size: 16px; line-height: 1; cursor: pointer; }
.imap__select{ border: 1px solid #e2e8f0; border-radius: 8px; padding: 3px 6px; font-size: 12px; background: #fff; max-width: 170px; }
.imap__warn{ margin-top: 8px; font-size: 12px; color: #b45309; background: #fffbeb; border-radius: 8px; padding: 6px 8px; }
.imap__note{ margin-top: 8px; font-size: 12px; color: #64748b; }

.imap__force{
  display: flex; align-items: flex-start; gap: 10px; margin-top: 16px; padding: 10px 12px;
  border: 1px solid #e2e8f0; border-radius: 10px; cursor: pointer;
}
.imap__force input{ margin-top: 3px; }
.imap__force small{ display: block; color: #64748b; font-size: 12px; }
.imap__actions{ display: flex; justify-content: flex-end; gap: 8px; margin-top: 16px; }

@media (max-width: 700px){
  .imap__grid{ grid-template-columns: 1fr; }
}
</style>
