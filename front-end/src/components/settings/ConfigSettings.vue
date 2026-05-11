<template>
  <Rightbar title="Settings" @unmount="$emit('unmount')">
    <div class="cs">
      <div v-if="loading" class="cs__loading">Loading...</div>
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
        <div v-if="activeKey" class="cs__panel-wrap" data-no-auto-i18n="true">
          <div class="cs__panel">
            <FormNode :obj="drafts" :propKey="activeKey" :depth="0" />
          </div>
          <p v-if="errors[activeKey]" class="cs__error">{{ errors[activeKey] }}</p>
          <div class="cs__actions">
            <button class="cs__btn cs__btn--reset-all" @click="resetAll" :disabled="resettingAll">
              {{ resettingAll ? 'Resetting...' : 'Reset All to Default' }}
            </button>
            <div class="cs__actions-right">
              <button class="cs__btn cs__btn--reset" @click="resetDraft(activeKey)">Reset</button>
              <button class="cs__btn cs__btn--save" @click="save(activeKey)" :disabled="saving[activeKey]">
                {{ saving[activeKey] ? 'Saving...' : 'Save' }}
              </button>
            </div>
          </div>
        </div>

      </template>
    </div>
  </Rightbar>
</template>

<script setup>
import { ref, reactive, inject, onMounted, onUnmounted } from 'vue';
import Rightbar from '../Rightbar.vue';
import FormNode from './FormNode.vue';

const emit = defineEmits(['unmount']);
const http = inject('http');

const loading = ref(true);
const activeKey = ref(null);
const settings = ref({});
const drafts = reactive({});
const saving = reactive({});
const errors = reactive({});
const hasSaved = ref(false);
const resettingAll = ref(false);


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
  if (!confirm('Reset all settings to default values?')) return;
  resettingAll.value = true;
  try {
    await http.post('/settings/reset');
    hasSaved.value = true;
    await load();
  } catch(e) {
    alert('Reset failed');
  } finally {
    resettingAll.value = false;
  }
}

function resetDraft(key) {
  drafts[key] = JSON.parse(JSON.stringify(settings.value[key]));
  errors[key] = '';
}

async function save(key) {
  errors[key] = '';
  saving[key] = true;
  try {
    await http.post(`/settings/${key}`, { value: drafts[key] });
    settings.value[key] = JSON.parse(JSON.stringify(drafts[key]));
    hasSaved.value = true;
  } catch(e) {
    errors[key] = 'Save failed';
  } finally {
    saving[key] = false;
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
  transition: background 0.15s, color 0.15s;
}
.cs__tab:not(.active):hover { background: #e8e8e8 !important; }

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
.cs__btn--reset-all { background: #fff3f3; color: #c0392b; border: 1px solid #f5c6cb; }
.cs__btn--reset-all:hover { background: #ffe0e0; }
.cs__btn--reset-all:disabled { opacity: 0.6; cursor: not-allowed; }
.cs__error { color: #e53e3e; font-size: 12px; margin: 0; }
</style>
