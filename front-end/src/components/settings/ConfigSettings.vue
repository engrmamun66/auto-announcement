<template>
  <Rightbar ref="theRightbar" :title="helper.t('Settings')" @unmount="$emit('unmount')">
    <div class="cs">
      <div v-if="loading" class="cs__loading">{{ helper.t('Loading...') }}</div>
      <template v-else>

        <!-- Scrollable tab strip -->
        <div class="cs__tabs">
          <button
            v-for="(value, key, idx) in settings" :key="key"
            class="cs__tab"
            :class="{ active: activeKey === key }"
            :style="tabGrad(idx, activeKey === key)"
            @click="activeKey = key"
          >{{ keyToLabel(key) }}</button>
        </div>

        <!-- Active tab content -->
        <div v-if="activeKey" class="cs__panel-wrap" >

          <!-- Classes: custom table view -->
          <template v-if="activeKey === 'classes'">
            <div class="cs__panel cs__panel--table">
              <table class="cs-cls-table">
                <thead>
                  <tr>
                    <th></th>
                    <th>#</th>
                    <th>{{ helper.t('Class Name') }}</th>
                    <th>{{ helper.t('Short') }}</th>
                    <th>{{ helper.t('Display Name') }}</th>
                    <th>{{ helper.t('Active') }}</th>
                    <th></th>
                    <th>{{ helper.t('Shifts') }}</th>
                    <th></th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  <template v-for="(cls, idx) in drafts['classes']" :key="idx">
                    <tr
                      draggable="true"
                      :class="{ 'cs-cls-drag-over': dragOverIdx === idx }"
                      @dragstart="dragStartIdx = idx"
                      @dragover.prevent="dragOverIdx = idx"
                      @drop.prevent="clsDrop(idx)"
                      @dragend="dragOverIdx = null"
                    >
                      <td class="cs-cls-drag">⠿</td>
                      <td class="cs-cls-num">{{ idx + 1 }}</td>
                      <td><input class="cs-cls-input" v-model="cls.class_name" /></td>
                      <td><input class="cs-cls-input cs-cls-input--sm" v-model="cls.class_short" /></td>
                      <td><input class="cs-cls-input cs-cls-input--sm" v-model="cls.display_name" /></td>
                      <td class="cs-cls-active">
                        <Switch v-model="cls.isActive" :size="'sm'" />
                      </td>
                      <td class="cs-cls-copypaste-cell">
                        <button class="cs-cls-eye-btn" :tooltip="helper.t('Copy shifts')" @click="copyShifts(cls)">
                          <i class="bx bx-copy"></i>
                        </button>
                        <button class="cs-cls-eye-btn" :class="{ disabled: !copiedShifts }" :tooltip="helper.t('Paste shifts (overwrites)')" @click="pasteShifts(cls)">
                          <i class="bx bx-paste"></i>
                        </button>
                      </td>
                      <td class="cs-cls-shifts-cell">
                        <div class="cs-cls-shifts-display">
                          <span v-for="(sh, si) in (cls.shifts||[])" :key="si" class="cs-cls-shift-badge">{{ sh.start }}–{{ sh.end }}</span>
                          <span v-if="!(cls.shifts||[]).length" class="cs-cls-shift-empty">{{ helper.t('no shifts') }}</span>
                        </div>
                      </td>
                      <td class="cs-cls-eye-cell">
                        <button class="cs-cls-eye-btn" :class="{ active: expandedShifts[idx] }" :tooltip="expandedShifts[idx] ? helper.t('Hide shifts') : helper.t('Edit shifts')" @click="expandedShifts[idx] = !expandedShifts[idx]">
                          <i :class="expandedShifts[idx] ? 'bx bx-hide' : 'bx bx-show'"></i>
                        </button>
                      </td>
                      <td>
                        <button class="cs-cls-del" @click="drafts['classes'].splice(idx, 1)">×</button>
                      </td>
                    </tr>
                    <!-- Shifts expanded row -->
                    <tr class="cs-cls-shifts-row">
                      <td colspan="10" class="cs-cls-shifts-td">
                        <div v-if="expandedShifts[idx]" class="cs-cls-shifts-wrap">
                            <TransitionGroup name="shift-item" tag="div" class="cs-cls-shifts-items">
                              <div v-for="(sh, si) in (cls.shifts||[])" :key="si" class="cs-cls-shift-item">
                                <span class="cs-cls-shift-label">#{{ si+1 }}</span>
                                <label>{{ helper.t('Start') }} <input class="cs-cls-input cs-cls-input--time" type="time" v-model="sh.start" /></label>
                                <label>{{ helper.t('End') }} <input class="cs-cls-input cs-cls-input--time" type="time" v-model="sh.end" /></label>
                                <button class="cs-cls-del" @click="cls.shifts.splice(si,1)">×</button>
                              </div>
                            </TransitionGroup>
                            <button class="cs-cls-shift-add" @click="(cls.shifts = cls.shifts||[]).push({start:'08:00',end:'10:00'})">{{ helper.t('+ Add Shift') }}</button>
                          </div>
                      </td>
                    </tr>
                  </template>
                </tbody>
              </table>
              <button class="cs-cls-add" @click="drafts['classes'].push({ class_name: '', class_short: '', display_name: '', isActive: true, speaker_ports: [], shifts: [] })">{{ helper.t('+ Add Class') }}</button>
            </div>
          </template>

          <!-- All other tabs: generic FormNode -->
          <div v-else class="cs__panel">
            <!-- Realtime attendance card design (settings.attendance.selected_realtime_cart) -->
            <div v-if="activeKey === 'settings' && drafts.settings?.attendance" class="cs-card-picker">
              <div class="cs-card-picker__title">{{ helper.t('Realtime Attendance Card') }}</div>
              <div class="cs-card-picker__options">
                <label v-for="design in REALTIME_CARD_DESIGNS" :key="design.id"
                  class="cs-card-opt" :class="{ active: selectedCardDesign === design.id }">
                  <input type="radio" name="realtime-card-design" :value="design.id"
                    :checked="selectedCardDesign === design.id" @change="selectedCardDesign = design.id" />
                  <span class="cs-card-thumb" :class="'cs-card-thumb--' + design.id">
                    <i class="t-photo"></i><i class="t-line"></i><i class="t-line t-line--short"></i>
                  </span>
                  <span class="cs-card-opt__name">{{ design.id }}. {{ helper.t(design.name) }}</span>
                  <span class="cs-card-opt__desc">{{ helper.t(design.description) }}</span>
                </label>
              </div>
            </div>
            <FormNode :obj="drafts" :propKey="activeKey" :depth="0" />
          </div>
          <p v-if="errors[activeKey]" class="cs__error">{{ errors[activeKey] }}</p>
          <div class="cs__actions">
            <button class="cs__btn cs__btn--reset-all" @click="resetAll" :disabled="resettingAll">
              {{ helper.t('Reset All to Default') }} <BtnLoader v-if="resettingAll"></BtnLoader>
            </button>
            <div class="cs__actions-right">
              <button class="cs__btn cs__btn--reset" @click="resetDraft(activeKey)">{{ helper.t('Reset') }}</button>
              <button class="cs__btn cs__btn--close" @click="theRightbar.unmount()">{{ helper.t('Close') }}</button>
              <button class="cs__btn cs__btn--save" @click="save(activeKey)" :disabled="saving[activeKey]">
                {{ helper.t('Save') }} <BtnLoader v-if="saving[activeKey]"></BtnLoader>
              </button>
            </div>
          </div>
        </div>

      </template>
    </div>

    <!-- Password Confirmation Modal -->
    <ConfirmByPassword
      v-model="showPasswordConfirm"
      @yes="handlePasswordConfirm"
    />
  </Rightbar>
</template>

<script setup>
import { ref, reactive, computed, inject, onMounted, onUnmounted } from 'vue';
import { REALTIME_CARD_DESIGNS, getSelectedRealtimeCard } from '../../pages/attendence-childs/realtimeCardDesigns';
import Rightbar from '../Rightbar.vue';
import FormNode from './FormNode.vue';
import BtnLoader from '../BtnLoader.vue';
import Switch from '../Switch.vue';
import ConfirmByPassword from '../ConfirmByPassword.vue';

const emit = defineEmits(['unmount']);
const http = inject('http');
const helper = inject('helper');
const emitter = inject('emitter');

const theRightbar = ref(true);
const loading = ref(true);
const activeKey = ref(null);
const settings = ref({});
const drafts = reactive({});
const saving = reactive({});
const errors = reactive({});
const hasSaved = ref(false);
const resettingAll = ref(false);
const dragStartIdx = ref(null);
const dragOverIdx = ref(null);
const expandedShifts = reactive({});
const showPasswordConfirm = ref(false);
const pendingSaveKey = ref(null);
const copiedShifts = ref(null);

// Older databases may not have this key yet; it is created on first save
const selectedCardDesign = computed({
  get: () => getSelectedRealtimeCard(drafts.settings?.attendance),
  set: (id) => {
    if (!drafts.settings?.attendance) return;
    drafts.settings.attendance.selected_realtime_cart = id;
  },
});

function isValidShiftsArray(arr) {
  if (!Array.isArray(arr) || !arr.length) return false;
  return arr.every(sh => {
    if (!sh || typeof sh.start !== 'string' || typeof sh.end !== 'string') return false;
    const start = moment(sh.start, 'HH:mm', true);
    const end = moment(sh.end, 'HH:mm', true);
    return start.isValid() && end.isValid() && start.isBefore(end);
  });
}

function copyShifts(cls) {
  copiedShifts.value = JSON.parse(JSON.stringify(cls.shifts || []));
  emitter.emit('toaster-success', { message: helper.t('Shifts copied') });
}

function pasteShifts(cls) {
  if (!copiedShifts.value) {
    emitter.emit('toaster-warning', { message: helper.t('Copy shifts from a class first') });
    return;
  }
  if (!isValidShiftsArray(copiedShifts.value)) {
    emitter.emit('toaster-error', { message: helper.t('Copied shifts are invalid') });
    return;
  }
  cls.shifts = JSON.parse(JSON.stringify(copiedShifts.value));
}

function clsDrop(toIdx) {
  const arr = drafts['classes'];
  const from = dragStartIdx.value;
  if (from === null || from === toIdx) { dragOverIdx.value = null; return; }
  const item = arr.splice(from, 1)[0];
  arr.splice(toIdx, 0, item);
  dragStartIdx.value = null;
  dragOverIdx.value = null;
}


function tabGrad(idx, active) {
    if (active) return { background: 'var(--grad3)', color: '#fff', borderColor: 'transparent' };
    return { background: '#f4f4f4', color: '#555', borderColor: '#ddd' };
}

function keyToLabel(k) {
    return String(k)
        .replace(/([a-z])([A-Z])/g, '$1 $2')
        .replace(/_/g, ' ')
        .replace(/\b\w/g, c => c.toUpperCase());
}

async function load() {
  loading.value = true;
  try {
    const res = await http.get('/settings');
    settings.value = res.data;
    const keys = Object.keys(res.data);
    keys.forEach(key => {
      drafts[key] = JSON.parse(JSON.stringify(res.data[key]));
      saving[key] = false;
      errors[key] = '';
    });
    if (keys.length) activeKey.value = keys[0];
  } finally {
    loading.value = false;
  }
}

async function resetAll() {
  if (!confirm(helper.t('Reset all settings to default values?'))) return;
  resettingAll.value = true;
  try {
    await http.post('/settings/reset');
    hasSaved.value = true;
    await load();
  } catch(e) {
    alert(helper.t('Reset failed'));
  } finally {
    resettingAll.value = false;
  }
}

function resetDraft(key) {
  drafts[key] = JSON.parse(JSON.stringify(settings.value[key]));
  errors[key] = '';
}

function save(key) {
  if (!event?.ctrlKey) {
    pendingSaveKey.value = key;
    showPasswordConfirm.value = true;
    return;
  }
  _performSave(key);
}

async function _performSave(key) {
  errors[key] = '';
  saving[key] = true;
  try {
    await http.post(`/settings/${key}`, { value: drafts[key] });
    settings.value[key] = JSON.parse(JSON.stringify(drafts[key]));
    hasSaved.value = true;
    emitter.emit('toaster-success', { message: helper.t('Saved') });
  } catch(e) {
    errors[key] = helper.t('Save failed');
  } finally {
    saving[key] = false;
  }
}

function handlePasswordConfirm() {
  if (pendingSaveKey.value) {
    _performSave(pendingSaveKey.value);
    pendingSaveKey.value = null;
  }
}

let allow_to_reaload = inject('allow_to_reaload')

onMounted(load);
onUnmounted(() => { if (hasSaved.value) {
  allow_to_reaload.value = true;
  window.location.reload();
} });
</script>

<style scoped>
.cs { display: flex; flex-direction: column; gap: 0; }
.cs__loading { color: #888; padding: 20px; text-align: center; }

/* Tab strip */
.cs__tabs {
  display: flex;
  gap: 0px;
  overflow-x: auto;
  padding: 0 0 10px 0;
  scrollbar-width: thin;
  scrollbar-color: #ccc transparent;
  flex-shrink: 0;
}
.cs__tabs::-webkit-scrollbar { height: 4px; }
.cs__tabs::-webkit-scrollbar-thumb { background: #ccc; border-radius: 2px; }

.cs__tab {
  flex-shrink: 0;
  padding: 7px 14px;
  border-radius: 0px;
  border: 1px solid #ddd;
  font-size: 12px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.4px;
  cursor: pointer;
  white-space: nowrap;
  transform: translateZ(0);
  -webkit-font-smoothing: antialiased;
  box-shadow: none !important;
}
.cs__tab:not(.active):hover { background: #e8e8e8 !important; }
.cs__tab:focus { outline: none; box-shadow: none !important; }
.cs__tab:active { outline: none; box-shadow: none !important; }
.cs__tab:focus-visible { outline: 2px solid var(--primaryColor, #4a90d9); outline-offset: 2px; }

/* Panel */
.cs__panel-wrap { display: flex; flex-direction: column; gap: 8px; }
.cs__panel {
  border: 1px solid #e0e0e0;
  border-radius: 10px;
  padding: 14px;
  background: #fff;
  display: flex;
  flex-direction: column;
  gap: 8px;
  max-height: calc(100vh - 230px);
  overflow-y: auto;
}

.cs__actions { display: flex; gap: 8px; justify-content: space-between; align-items: center; }
.cs__actions-right { display: flex; gap: 8px; }
.cs__btn { padding: 6px 16px; border: none; border-radius: 6px; font-size: 13px; font-weight: 600; cursor: pointer; }
.cs__btn--save { background: #4caf50; color: #fff; }
.cs__btn--save:disabled { opacity: 0.6; cursor: not-allowed; }
.cs__btn--reset { background: #f0f0f0; color: #555; }
.cs__btn--reset:hover { background: #e0e0e0; }
.cs__btn--close { background: #fff5f5; color: #c0392b; border: 1px solid #f5c6cb; }
.cs__btn--close:hover { background: #ffe0e0; border-color: #e74c3c; }
.cs__btn--reset-all { background: #fff3f3; color: #c0392b; border: 1px solid #f5c6cb; }
.cs__btn--reset-all:hover { background: #ffe0e0; }
.cs__btn--reset-all:disabled { opacity: 0.6; cursor: not-allowed; }
.cs__error { color: #e53e3e; font-size: 12px; margin: 0; }

/* Realtime card design picker */
.cs-card-picker { border: 1px solid #e0e0e0; border-radius: 10px; padding: 12px; background: #fafbff; flex-shrink: 0; }
.cs-card-picker__title { font-size: 11px; font-weight: 700; color: #555; text-transform: uppercase; letter-spacing: 0.4px; margin-bottom: 8px; }
.cs-card-picker__options { display: grid; grid-template-columns: repeat(auto-fit, minmax(120px, 1fr)); gap: 8px; }
.cs-card-opt { position: relative; display: flex; flex-direction: column; gap: 4px; padding: 8px; border: 2px solid #e5e7eb; border-radius: 10px; background: #fff; cursor: pointer; transition: border-color 0.15s; }
.cs-card-opt:hover { border-color: #b0c4de; }
.cs-card-opt.active { border-color: #4caf50; box-shadow: 0 0 0 3px rgba(76, 175, 80, 0.15); }
.cs-card-opt input { position: absolute; opacity: 0; pointer-events: none; }
.cs-card-opt__name { font-size: 12px; font-weight: 700; color: #333; }
.cs-card-opt__desc { font-size: 11px; color: #888; line-height: 1.3; }

/* Mini previews */
.cs-card-thumb { position: relative; display: block; height: 70px; border-radius: 8px; overflow: hidden; }
.cs-card-thumb i { position: absolute; display: block; }
.cs-card-thumb--1 { background: #f0893a; }
.cs-card-thumb--1 .t-photo { width: 22px; height: 22px; border-radius: 50%; background: #fff; top: 10px; left: calc(50% - 11px); }
.cs-card-thumb--1 .t-line { height: 5px; border-radius: 3px; background: rgba(255,255,255,0.85); width: 60%; left: 20%; top: 40px; }
.cs-card-thumb--1 .t-line--short { width: 40%; left: 30%; top: 51px; }
.cs-card-thumb--2 { background: linear-gradient(160deg, #94a3b8, #475569); border-bottom: 4px solid #2ab361; }
.cs-card-thumb--2 .t-photo { width: 30px; height: 30px; border-radius: 50%; background: #e2e8f0; top: 8px; left: calc(50% - 15px); }
.cs-card-thumb--2 .t-line { left: 0; right: 0; bottom: 0; height: 24px; background: linear-gradient(to top, rgba(15,23,42,0.95), rgba(15,23,42,0)); }
.cs-card-thumb--2 .t-line--short { height: 4px; border-radius: 3px; background: #fff; width: 40%; left: 8px; bottom: 8px; right: auto; }
.cs-card-thumb--3 { background: #fff; border: 1px solid #e5e7eb; border-bottom: 3px solid #16a34a; box-shadow: 0 2px 6px rgba(15,23,42,0.12); }
.cs-card-thumb--3 .t-photo { width: 18px; height: 18px; border-radius: 50%; background: #e2e8f0; border: 2px solid #fff; top: 6px; left: 8px; z-index: 1; }
.cs-card-thumb--3 .t-line { left: 0; right: 0; top: 0; height: 30px; background: linear-gradient(135deg, #16a34a, #15803d); }
.cs-card-thumb--3 .t-line--short { width: auto; height: 20px; left: 8px; right: 8px; top: 38px; bottom: auto; border-radius: 5px; background: #dcfce7; }

.cs-card-thumb--4 { background: linear-gradient(160deg, #111827, #1e1b4b); border: 2px solid #22c55e; box-shadow: 0 0 8px rgba(34,197,94,0.55), inset 0 0 0 1px #06b6d4; }
.cs-card-thumb--4 .t-photo { width: 22px; height: 22px; border-radius: 50%; background: #e2e8f0; border: 2px solid #22c55e; box-shadow: 0 0 6px #22c55e; top: 8px; left: calc(50% - 11px); }
.cs-card-thumb--4 .t-line { left: 0; right: 0; top: 0; height: 45%; background: linear-gradient(175deg, rgba(255,255,255,0.22), rgba(255,255,255,0)); }
.cs-card-thumb--4 .t-line--short { height: 5px; border-radius: 3px; background: #22c55e; box-shadow: 0 0 6px #22c55e; width: 44%; left: 28%; top: 42px; }

/* Classes table */
.cs__panel--table { padding: 10px; overflow-x: auto; }
.cs-cls-table { width: 100%; border-collapse: collapse; font-size: 12px; }
.cs-cls-table th { padding: 6px 8px; background: #f5f5f5; border-bottom: 2px solid #e0e0e0; text-align: left; font-weight: 700; color: #555; white-space: nowrap; }
.cs-cls-table td { padding: 4px 6px; border-bottom: 1px solid #f0f0f0; vertical-align: middle; }
.cs-cls-table tr:hover td { background: #fafafa; }
.cs-cls-drag { cursor: grab; color: #bbb; font-size: 16px; user-select: none; padding: 0 4px; }
.cs-cls-drag:active { cursor: grabbing; }
.cs-cls-num { color: #aaa; font-size: 11px; min-width: 20px; }
.cs-cls-input { width: 100%; border: 1px solid #e0e0e0; border-radius: 5px; padding: 4px 7px; font-size: 12px; outline: none; box-sizing: border-box; }
.cs-cls-input:focus { border-color: var(--primaryColor, #3a7bd5); }
.cs-cls-input--sm { max-width: 90px; }
.cs-cls-active { text-align: center; }
.cs-cls-del { background: none; border: none; color: #e53e3e; font-size: 17px; cursor: pointer; padding: 0 4px; line-height: 1; }
.cs-cls-del:hover { color: #c0392b; }
.cs-cls-drag-over td { background: #e8f4fd !important; }
.cs-cls-add { margin-top: 8px; width: 100%; padding: 7px; border: 1px dashed #b0c4de; border-radius: 7px; background: #f8fbff; color: #3a7bd5; font-size: 13px; font-weight: 600; cursor: pointer; }
.cs-cls-add:hover { background: #e8f4fd; }
.cs-cls-shifts-cell { white-space: nowrap; }
.cs-cls-shifts-display { display: inline-flex; align-items: center; gap: 4px; flex-wrap: wrap; max-width: 160px; padding: 3px 0; }
.cs-cls-shift-badge { background: #e8f0fe; color: #3a7bd5; border-radius: 4px; padding: 1px 5px; font-size: 10px; font-weight: 600; }
.cs-cls-shift-empty { color: #bbb; font-size: 11px; font-style: italic; }
.cs-cls-eye-cell { width: 28px; text-align: center; }
.cs-cls-copypaste-cell { white-space: nowrap; display: flex; gap: 4px; }
.cs-cls-eye-btn { background: none; border: 1.5px solid #d1d5db; border-radius: 6px; width: 28px; height: 28px; display: inline-flex; align-items: center; justify-content: center; cursor: pointer; color: #9ca3af; font-size: 15px; transition: border-color 0.15s, color 0.15s, background 0.15s; }
.cs-cls-eye-btn:hover { border-color: #3a7bd5; color: #3a7bd5; background: #f0f4ff; }
.cs-cls-eye-btn.active { border-color: #3a7bd5; color: #3a7bd5; background: #e8f0fe; }
.cs-cls-eye-btn.disabled { opacity: 0.4; cursor: not-allowed; }
.cs-cls-eye-btn.disabled:hover { border-color: #d1d5db; color: #9ca3af; background: none; }
.cs-cls-shifts-row td { padding: 0; background: #f9fbff; }
.cs-cls-shifts-td { padding: 0 !important; }
.cs-cls-shifts-wrap { padding: 10px 14px; display: flex; flex-wrap: wrap; gap: 8px; align-items: flex-end; overflow: hidden; flex-direction: column; }
.cs-cls-shifts-items { display: contents; }

/* Expand/collapse row animation */
.shifts-expand-enter-active { transition: max-height 0.32s cubic-bezier(0.4,0,0.2,1), opacity 0.22s ease; overflow: hidden; max-height: 300px; }
.shifts-expand-leave-active { transition: max-height 0.22s cubic-bezier(0.4,0,0.2,1), opacity 0.18s ease; overflow: hidden; }
.shifts-expand-enter-from { max-height: 0; opacity: 0; }
.shifts-expand-leave-to { max-height: 0; opacity: 0; }
.shifts-expand-enter-to, .shifts-expand-leave-from { max-height: 300px; opacity: 1; }

/* Individual shift item add/remove animation */
.shift-item-enter-active { transition: all 0.22s cubic-bezier(0.4,0,0.2,1); }
.shift-item-leave-active { transition: all 0.18s cubic-bezier(0.4,0,0.2,1); position: absolute; }
.shift-item-enter-from { opacity: 0; transform: translateY(-8px) scale(0.96); }
.shift-item-leave-to { opacity: 0; transform: translateX(12px) scale(0.94); }
.cs-cls-shift-item { display: flex; align-items: center; gap: 6px; background: #fff; border: 1px solid #e0e0e0; border-radius: 7px; padding: 6px 10px; font-size: 12px; }
.cs-cls-shift-label { font-weight: 700; color: #888; min-width: 20px; }
.cs-cls-shift-item label { display: flex; align-items: center; gap: 4px; color: #555; }
.cs-cls-input--time { width: 120px; padding: 6px 10px; font-size: 14px; }
.cs-cls-shift-add { padding: 5px 12px; border: 1px dashed #b0c4de; border-radius: 7px; background: #f8fbff; color: #3a7bd5; font-size: 12px; cursor: pointer; }
.cs-cls-shift-add:hover { background: #e8f4fd; }
</style>
