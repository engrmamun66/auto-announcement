<template>
  <div class="sms-overlay" @click.self="$emit('close')">
    <div class="sms-modal">

      <div class="sms-modal__header">
        <span><i class='bx bxs-message-rounded-dots'></i> {{ helper.t('Send SMS') }}</span>
        <button class="sms-modal__close" @click="$emit('close')"><i class='bx bx-x'></i></button>
      </div>

      <div class="sms-modal__body">

        <!-- Left: recipients -->
        <div class="sms-panel">
          <div class="sms-panel__title-row">
            <div class="sms-panel__title">{{ helper.t('Recipients') }}</div>
            <button class="sms-uncheck-btn" @click="tab === 'class' ? selectedClasses = [] : selectedDakhelas = []">{{ helper.t('Uncheck all') }}</button>
          </div>

          <div class="sms-tabs">
            <button :class="['sms-tab', tab === 'class' && 'sms-tab--active']" @click="tab='class'">{{ helper.t('By Class') }}</button>
            <button :class="['sms-tab', tab === 'students' && 'sms-tab--active']" @click="tab='students'">{{ helper.t('Select Students') }}</button>
          </div>

          <!-- Class tab -->
          <template v-if="tab === 'class'">
            <div class="sms-class-list">
              <label v-for="cls in activeClasses" :key="cls.class_short" class="sms-check">
                <input type="checkbox" :value="cls.class_short" v-model="selectedClasses" />
                {{ cls.class_name || cls.class_short }}
                <small>({{ studentsForClass(cls.class_short).length }})</small>
              </label>
            </div>
          </template>

          <!-- Students tab -->
          <template v-else>
            <input v-model="studentSearch" :placeholder="helper.t('Search name / dakhela...')" class="sms-search" />
            <div class="sms-student-list">
              <label v-for="s in filteredStudents" :key="s.id" class="sms-check">
                <input type="checkbox" :value="s.dakhela" v-model="selectedDakhelas" />
                <span class="sms-std-name">{{ s.name.split('||')[0] }}</span>
                <small class="text-muted">{{ s.class_short }} · {{ s.phone_number || helper.t('no phone') }}</small>
              </label>
            </div>
          </template>

          <div class="sms-recipient-count">
            <i class='bx bx-user'></i> {{ resolvedNumbers.length }} {{ helper.t('recipient(s) with phone') }}
          </div>
        </div>

        <!-- Right: message -->
        <div class="sms-panel">
          <div class="sms-panel__title">{{ helper.t('Message') }}</div>

          <div class="sms-template-row">
            <select v-model="selectedTemplateId" class="sms-select">
              <option value="">{{ helper.t('-- Select template --') }}</option>
              <option v-for="t in templates" :key="t.id" :value="t.id">{{ t.title }}</option>
            </select>
            <button class="sms-icon-btn" :tooltip="helper.t('Save as template')" @click="showSaveTemplate = !showSaveTemplate"><i class='bx bx-save'></i></button>
            <button v-if="selectedTemplateId" class="sms-icon-btn sms-icon-btn--danger" :tooltip="helper.t('Delete template')" @click="deleteTemplate"><i class='bx bx-trash'></i></button>
          </div>

          <div v-if="showSaveTemplate" class="sms-save-tpl">
            <input v-model="newTemplateTitle" :placeholder="helper.t('Template title...')" class="sms-search" />
            <select v-model="newTemplateType" class="sms-select" style="width:120px">
              <option value="custom">{{ helper.t('Custom') }}</option>
              <option value="in">{{ helper.t('Check-in') }}</option>
              <option value="out">{{ helper.t('Check-out') }}</option>
            </select>
            <button class="sms-icon-btn sms-icon-btn--primary" @click="saveTemplate">{{ helper.t('Save') }}</button>
          </div>

          <textarea
            v-model="message"
            class="sms-textarea"
            :placeholder="helper.t('Type message or select template')"
            rows="5"
          ></textarea>
          <small>{{ helper.t('Type message... use {name}, {time}, {date}, {class}') }}</small>

          <div class="sms-char-count">{{ message.length }} {{ helper.t('chars') }} · ~{{ Math.ceil(message.length / 160) }} SMS</div>

          <div class="sms-preview" v-if="message">
            <div class="sms-preview__label">{{ helper.t('Preview') }}</div>
            <div class="sms-preview__text">{{ resolveMessage(message, previewStudent) }}</div>
          </div>

          <button class="sms-send-btn" :disabled="sending || !resolvedNumbers.length || !message.trim()" @click="sendSms">
            <template v-if="sending"><i class='bx bx-loader-alt bx-spin'></i> {{ helper.t('Sending...') }}</template>
            <template v-else><i class='bx bx-send'></i> {{ helper.t('Send to') }} {{ resolvedNumbers.length }} {{ helper.t('recipient(s)') }}</template>
          </button>

          <div v-if="sendResult" :class="['sms-result', sendResult.ok ? 'sms-result--ok' : 'sms-result--err']">
            {{ sendResult.ok ? helper.t('Sent successfully') : `${helper.t('Error')}: ${sendResult.error}` }}
          </div>
        </div>
      </div>

    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted, inject } from 'vue';

const emit = defineEmits(['close']);

const http = inject('http');
const classes = inject('classes');
const all_students_non_copied = inject('all_students_non_copied');
const emitter = inject('emitter');
const helper = inject('helper');

const tab = ref('class');
const selectedClasses = ref([]);
const selectedDakhelas = ref([]);
const studentSearch = ref('');
const message = ref('');
const selectedTemplateId = ref('');
const templates = ref([]);
const showSaveTemplate = ref(false);
const newTemplateTitle = ref('');
const newTemplateType = ref('custom');
const sending = ref(false);
const sendResult = ref(null);

const activeClasses = computed(() => (classes.value || []).filter(c => c.isActive !== false));

function studentsForClass(class_short) {
  return (all_students_non_copied.value || []).filter(s => s.class_short === class_short && s.phone_number);
}

const filteredStudents = computed(() => {
  const q = studentSearch.value.toLowerCase();
  return (all_students_non_copied.value || []).filter(s =>
    !q || s.name.toLowerCase().includes(q) || String(s.dakhela).includes(q)
  );
});

const resolvedNumbers = computed(() => {
  const students = all_students_non_copied.value || [];
  if (tab.value === 'class') {
    return students
      .filter(s => selectedClasses.value.includes(s.class_short) && s.phone_number)
      .map(s => s.phone_number);
  }
  return students
    .filter(s => selectedDakhelas.value.includes(s.dakhela) && s.phone_number)
    .map(s => s.phone_number);
});

const previewStudent = computed(() => {
  const students = all_students_non_copied.value || [];
  if (tab.value === 'class' && selectedClasses.value.length) {
    return students.find(s => s.class_short === selectedClasses.value[0]) || null;
  }
  if (selectedDakhelas.value.length) {
    return students.find(s => s.dakhela === selectedDakhelas.value[0]) || null;
  }
  return null;
});

function resolveMessage(tpl, student) {
  const now = new Date();
  const time = now.toLocaleTimeString('bn-BD', { hour: '2-digit', minute: '2-digit' });
  const date = now.toLocaleDateString('bn-BD');
  return tpl
    .replace(/{name}/g, student?.name?.split('||')[0] || 'Student')
    .replace(/{time}/g, time)
    .replace(/{date}/g, date)
    .replace(/{class}/g, student?.class_short || '');
}

watch(selectedTemplateId, (id) => {
  if (!id) return;
  const tpl = templates.value.find(t => t.id == id);
  if (tpl) message.value = tpl.message;
});

async function loadTemplates() {
  try {
    const res = await http.get('/sms/templates');
    templates.value = res.data || [];
  } catch {}
}

async function saveTemplate() {
  if (!newTemplateTitle.value || !message.value) return;
  try {
    const res = await http.post('/sms/templates', {
      title: newTemplateTitle.value,
      message: message.value,
      type: newTemplateType.value,
    });
    templates.value.push(res.data);
    selectedTemplateId.value = res.data.id;
    newTemplateTitle.value = '';
    showSaveTemplate.value = false;
  } catch {}
}

async function deleteTemplate() {
  if (!selectedTemplateId.value) return;
  if (!confirm(helper.t('Delete this template?'))) return;
  await http.delete(`/sms/templates/${selectedTemplateId.value}`);
  templates.value = templates.value.filter(t => t.id != selectedTemplateId.value);
  selectedTemplateId.value = '';
  message.value = '';
}

async function sendSms() {
  if (!resolvedNumbers.value.length || !message.value.trim()) return;
  sending.value = true;
  sendResult.value = null;
  try {
    // Build personalized or single batch message
    await http.post('/sms/send', {
      numbers: resolvedNumbers.value,
      message: message.value,
    });
    sendResult.value = { ok: true };
    emitter.emit('toaster-success', { message: `SMS sent to ${resolvedNumbers.value.length} recipient(s)` });
  } catch (e) {
    sendResult.value = { ok: false, error: e?.response?.data?.error || e.message };
  } finally {
    sending.value = false;
  }
}

onMounted(loadTemplates);
</script>

<style scoped>
.sms-overlay {
  position: fixed; inset: 0; background: rgba(0,0,0,0.55);
  display: flex; align-items: center; justify-content: center;
  z-index: 9999;
}
.sms-modal {
  background: #fff; border-radius: 14px; width: min(96vw, 860px);
  min-height: 70vh; max-height: 90vh; display: flex; flex-direction: column; overflow: hidden;
  box-shadow: 0 8px 40px rgba(0,0,0,0.25);
}
.sms-modal__header {
  display: flex; align-items: center; justify-content: space-between;
  padding: 14px 18px; background: #fff; color: #1f2937;
  font-size: 15px; font-weight: 700; flex-shrink: 0;
  border-bottom: 1px solid #e5e7eb;
}
.sms-modal__close {
  background: none; border: none; color: #6b7280; font-size: 22px; cursor: pointer;
  display: flex; align-items: center;
}
.sms-modal__body {
  display: flex; flex: 1; overflow: hidden;
}
.sms-panel {
  flex: 1; padding: 14px; display: flex; flex-direction: column; gap: 10px;
  overflow-y: auto; min-width: 0;
}
.sms-panel + .sms-panel { border-left: 1px solid #e5e7eb; }
.sms-panel__title { font-size: 12px; font-weight: 700; color: #6b7280; text-transform: uppercase; letter-spacing: 0.5px; }
.sms-tabs { display: flex; gap: 0; border: 1px solid #e5e7eb; border-radius: 8px; overflow: hidden; flex-shrink: 0; }
.sms-tab { flex: 1; padding: 6px; background: #f9fafb; border: none; font-size: 12px; font-weight: 600; cursor: pointer; color: #374151; }
.sms-tab--active { background: var(--grad3, #3a7bd5); color: #fff; }
.sms-class-list, .sms-student-list { display: flex; flex-direction: column; gap: 6px; overflow-y: auto; }
.sms-check { display: flex; align-items: center; gap: 8px; font-size: 13px; cursor: pointer; padding: 4px 6px; border-radius: 6px; }
.sms-check:hover { background: #f3f4f6; }
.sms-check input { cursor: pointer; }
.sms-std-name { font-weight: 600; }
.sms-recipient-count { font-size: 12px; color: #6b7280; margin-top: auto; padding-top: 6px; border-top: 1px solid #f3f4f6; }
.sms-search { width: 100%; padding: 6px 10px; border: 1px solid #e5e7eb; border-radius: 8px; font-size: 13px; outline: none; }
.sms-select { flex: 1; padding: 6px 32px 6px 10px; border: 1px solid #e5e7eb; border-radius: 8px; font-size: 13px; outline: none; background: #fff url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%236b7280' d='M6 8L1 3h10z'/%3E%3C/svg%3E") no-repeat right 10px center; appearance: none; -webkit-appearance: none; cursor: pointer; }
.sms-template-row { display: flex; gap: 6px; align-items: center; }
.sms-save-tpl { display: flex; gap: 6px; align-items: center; }
.sms-icon-btn { padding: 6px 10px; border: 1px solid #e5e7eb; border-radius: 8px; background: #f9fafb; cursor: pointer; font-size: 15px; display: flex; align-items: center; }
.sms-icon-btn--danger { color: #dc2626; border-color: #fca5a5; }
.sms-icon-btn--primary { background: var(--grad3, #3a7bd5); color: #fff; border-color: transparent; }
.sms-textarea { width: 100%; border: 1px solid #e5e7eb; border-radius: 8px; padding: 8px 10px; font-size: 13px; resize: vertical; outline: none; font-family: inherit; box-sizing: border-box; min-height: 120px; }
.sms-char-count { font-size: 11px; color: #9ca3af; text-align: right; }
.sms-preview { background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 8px; padding: 10px; }
.sms-preview__label { font-size: 11px; font-weight: 700; color: #16a34a; margin-bottom: 4px; }
.sms-preview__text { font-size: 13px; color: #374151; white-space: pre-wrap; }
.sms-send-btn {
  padding: 10px; background: var(--grad3, #3a7bd5); color: #fff;
  border: none; border-radius: 10px; font-size: 14px; font-weight: 700;
  cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 6px;
}
.sms-send-btn:disabled { opacity: 0.5; cursor: not-allowed; }
.sms-result { padding: 8px 12px; border-radius: 8px; font-size: 13px; font-weight: 600; }
.sms-result--ok { background: #f0fdf4; color: #16a34a; }
.sms-result--err { background: #fef2f2; color: #dc2626; }
@media (max-width: 600px) {
  .sms-modal__body { flex-direction: column; }
  .sms-panel + .sms-panel { border-left: none; border-top: 1px solid #e5e7eb; }
}
.sms-panel__title-row { display: flex; align-items: center; justify-content: space-between; }
.sms-uncheck-btn { background: none; border: none; font-size: 11px; color: #9ca3af; cursor: pointer; padding: 0; text-decoration: underline; }
.sms-uncheck-btn:hover { color: #374151; }
</style>
