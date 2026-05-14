<template>
  <div class="env-editor">
    <div class="env-header">
      <div>
        <h4 class="env-title">Environment Config</h4>
        <div class="env-subtitle">Editing `{{ selectedFile }}` (Raw + JSON preview)</div>
      </div>
      <div class="env-actions">
        <select v-model="selectedFile" class="form-select form-select-sm env-select" @change="loadConfig">
          <option value="config.example.js">config.example.js</option>
          <option value="config.js">config.js</option>
        </select>
        <button class="btn btn-sm btn-outline-secondary" @click="loadConfig" :disabled="loading">
          Reload
        </button>
        <!-- <button class="btn btn-sm btn-outline-secondary" @click="refreshPreview" :disabled="loading">
          Preview
        </button> -->
        <button class="btn btn-sm btn-primary" @click="saveConfig" :disabled="loading">
          Save
        </button>
      </div>
    </div>

    <div v-if="errorMessage" class="alert alert-danger py-2">{{ errorMessage }}</div>
    <div v-if="successMessage" class="alert alert-success py-2">{{ successMessage }}</div>

    <div class="env-tabs">
      <button class="env-tab" :class="{ active: activeTab === 'raw' }" @click="activeTab = 'raw'">
        Raw File
      </button>
      <button class="env-tab" :class="{ active: activeTab === 'preview' }" @click="activeTab = 'preview'">
        JSON Preview
      </button>
    </div>

    <div v-if="activeTab === 'raw'" class="env-panel">
      <textarea
        v-model="rawText"
        class="form-control env-textarea"
        spellcheck="false"
        rows="24"
      ></textarea>
    </div>
    <div v-else class="env-panel">
      <pre class="env-preview">{{ jsonPreview }}</pre>
    </div>
  </div>
</template>

<script setup>
import { inject, onMounted, ref, watch } from 'vue'

const http = inject('http')
const loading = ref(false)
const rawText = ref('')
const jsonPreview = ref('')
const errorMessage = ref('')
const successMessage = ref('')
let previewTimer = null
const activeTab = ref('raw')
const selectedFile = ref('config.js')

async function loadConfig(){
  loading.value = true
  errorMessage.value = ''
  successMessage.value = ''
  try {
    const res = await http.get('/env-config', { params: { file: selectedFile.value } })
    if (res.status === 200) {
      rawText.value = res.data?.raw || ''
      const dataToUse = res.data?.data ?? null
      jsonPreview.value = dataToUse ? JSON.stringify(dataToUse, null, 2) : ''
    }
  } catch (error) {
    errorMessage.value = 'Failed to load config.'
  } finally {
    loading.value = false
  }
}

async function refreshPreview(){
  if (!rawText.value) {
    jsonPreview.value = ''
    return
  }
  try {
    const res = await http.post('/env-config/validate', { raw: rawText.value, file: selectedFile.value })
    if (res.status === 200) {
      jsonPreview.value = JSON.stringify(res.data?.data ?? null, null, 2)
      errorMessage.value = ''
    }
  } catch (error) {
    errorMessage.value = 'Invalid config syntax.'
  }
}

async function saveConfig(){
  loading.value = true
  errorMessage.value = ''
  successMessage.value = ''
  try {
    const res = await http.post('/env-config', { raw: rawText.value, file: selectedFile.value })
    if (res.status === 200) {
      jsonPreview.value = JSON.stringify(res.data?.data ?? null, null, 2)
      successMessage.value = 'Saved successfully.'
    }
  } catch (error) {
    errorMessage.value = 'Invalid config or save failed.'
  } finally {
    loading.value = false
  }
}

watch(rawText, () => {
  if (previewTimer) clearTimeout(previewTimer)
  previewTimer = setTimeout(refreshPreview, 500)
})

onMounted(loadConfig)
</script>

<style scoped>
.env-editor{
  background: #ffffff;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  padding: 16px;
}
.env-header{
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 10px;
}
.env-title{
  margin: 0;
  font-weight: 700;
}
.env-subtitle{
  font-size: 12px;
  color: #6b7280;
}
.env-actions{
  display: inline-flex;
  gap: 8px;
  align-items: center;
}
.env-select{
  min-width: 170px;
}
.env-tabs{
  display: inline-flex;
  gap: 8px;
  margin: 6px 0 10px;
}
.env-tab{
  border: 1px solid #e5e7eb;
  background: #ffffff;
  color: #374151;
  padding: 6px 12px;
  border-radius: 999px;
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
}
.env-tab.active{
  background: #111827;
  border-color: #111827;
  color: #ffffff;
}
.env-panel{
  margin-top: 4px;
}
.env-textarea{
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace;
  font-size: 12px;
  line-height: 1.5;
  min-height: 460px;
  max-height: calc(100vh - 250px);
  overflow-y: auto;
}
.env-preview{
  background: #0b1220;
  color: #e2e8f0;
  border-radius: 10px;
  padding: 12px;
  border: 1px solid #1f2937;
  min-height: 460px;
  max-height: calc(100vh - 250px);
  overflow-y: auto;
  overflow: auto;
  font-size: 12px;
}
</style>
