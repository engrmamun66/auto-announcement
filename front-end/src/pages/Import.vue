<script setup>
import { onMounted, onBeforeUnmount, inject, ref, reactive, computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import Note from '../components/note.vue'
import myTable from '../components/myTable.vue'
import Modal from '../components/modal.vue'
import Barcode from '../components/createBarcode.vue'
import Btn from '../components/Btn.vue'
import FileUpload from '../components/FileUpload.vue'
import BtnLoader from '../components/BtnLoader.vue'
import Rightbar from '../components/Rightbar.vue'
import ImportMappingModal from '../components/ImportMappingModal.vue'
import ImportReport from '../components/ImportReport.vue'


const emitter = inject('emitter');
let http = inject('http');
let moment = inject('moment');
const helper = inject('helper');
const getAllStudents = inject('getAllStudents');
let loading = ref(false);
let loading2 = ref(false);

let showReport = ref(false);
let importResult = ref(null);

// ---------- Import: file inspected -> sheet-mapping modal -> report
let inspection = ref(null);

function onImported(data){
     inspection.value = null;
     importResult.value = data || {};
     showReport.value = true;
     getAllStudents()
}


// ---------- Export dropdown
const EXPORT_PARTS = [
     { key: 'students', label: 'Students' },
     { key: 'schedules', label: 'Schedules' },
     { key: 'settings', label: 'Settings' },
     { key: 'attendance', label: 'Attendances (last 12 months)' },
]
let showExportMenu = ref(false);
let showExportSelection = ref(false);
const exportSelection = reactive({ students: true, schedules: true, settings: false, attendance: false })

function closeExportMenu(){ showExportMenu.value = false }
onMounted(() => document.addEventListener('click', closeExportMenu))
onBeforeUnmount(() => document.removeEventListener('click', closeExportMenu))

function exportSelected(){
     const parts = EXPORT_PARTS.map(p => p.key).filter(k => exportSelection[k])
     if(!parts.length) return emitter.emit('toaster-warning', {message: helper.t('Select at least one item to export')})
     showExportSelection.value = false
     exportParts(parts)
}

// Saves a blob response, using the server's file name when it sends one
function saveDownload(response, fallbackName){
     const url = window.URL.createObjectURL(new Blob([response.data]));
     const disposition = response.headers?.['content-disposition'] || ''
     // Prefix with this server's subdomain so files from different sites don't get mixed up (cb3_callingbird_….xlsx)
     const fileName = `${helper.subdomain()}_${(disposition.match(/filename="?([^";]+)"?/) || [])[1] || fallbackName}`
     const link = document.createElement("a");
     link.href = url;
     link.setAttribute("download", fileName);
     document.body.appendChild(link);
     link.click();
     link.remove();
     window.URL.revokeObjectURL(url);
}

// ---------- Media (.zip): students' audio and profile images in public/media
let showMediaImport = ref(false);
let mediaZip = ref(null);
let mediaOverwrite = ref(false);
let mediaBusy = ref(false);
let mediaReport = ref(null);

async function exportMedia(){
     showExportMenu.value = false;
     loading.value = true;
     try {
          const response = await http.get('/data/media/export', {responseType: "blob"})
          saveDownload(response, 'callingbird_media.zip')
     } catch (error) {
          emitter.emit('toaster-error', {message: helper.t('Export failed')})
     } finally {
          loading.value = false;
     }
}

function openMediaImport(){
     mediaZip.value = null
     mediaOverwrite.value = false
     mediaReport.value = null
     showMediaImport.value = true
}

async function importMedia(){
     if(!mediaZip.value) return
     mediaBusy.value = true
     try {
          const response = await http.post('/data/media/import', {file: mediaZip.value, overwrite: String(mediaOverwrite.value)}, {formData: true})
          mediaReport.value = response.data
          emitter.emit('toaster-success', {message: helper.t('Media import completed')})
     } catch (error) {
          emitter.emit('toaster-error', {message: error?.response?.data?.error || helper.t('Import failed')})
     } finally {
          mediaBusy.value = false
     }
}

const optionalCols = ['id', 'class_short', 'card_no', 'year', 'status', 'sound1', 'created', 'card_owner', 'options', 'note', 'device_index', 'profile_image', 'phone_number'];

async function eraseAll() {
     try {
          let confi = confirm(helper.t('Do you want to delete all students?'))
          if(!confi) return
          let passKey = prompt(helper.t('Type passcode to confirm'))
          if(!['DD', 'dd', 'delete'].includes(passKey)) {
               alert(helper.t('Wrong passcode!'))
               return
          }
          loading2.value = true
          http.get('/students/erase-all').then(response => {
               if(response.status == 200){
                    emitter.emit('toaster-success', {message: helper.t('All students have been deleted')})
               }
               getAllStudents()
               loading2.value = false
          })
     } catch (error) {
          loading2.value = false
     }
}


// One Excel file with a sheet for each part (Students / Schedules / Settings / Attendance)
async function exportParts(parts){
     showExportMenu.value = false;
     loading.value = true;
     try {
          const response = await http.get('/data/export', {params: {parts: parts.join(',')}, responseType: "blob"})
          saveDownload(response, `callingbird_${parts.join('_')}.xlsx`)
     } catch (error) {
          emitter.emit('toaster-error', {message: helper.t('Export failed')})
     } finally {
          loading.value = false;
     }
}
 
</script>

<template>
     <div class="d-flex justify-content-between align-items-center mb-4">
          <h1>{{ helper.t('Import / Export') }}</h1>
          <div class="right-align" >
               <!-- <Btn v-if="useRoute().query.dev == 'true'" @click="eraseAll" class="red me-1" ><i class='bx bxs-eraser' ></i> {{ helper.t('Delete All Students') }} <BtnLoader v-if="loading"></BtnLoader> </Btn> -->
               <Btn @click="eraseAll" v-if="true" class="red me-1" ><i class='bx bxs-eraser' ></i> {{ helper.t('Delete All Students') }} <BtnLoader v-if="loading2"></BtnLoader> </Btn>
               <Btn @click="openMediaImport" class="white me-1"><i class='bx bxs-file-archive'></i> {{ helper.t('Import Media') }}</Btn>
               <div class="export-dd" @click.stop>
                    <Btn @click="showExportMenu = !showExportMenu" :disabled="loading"><i class='bx bxs-file-export' ></i> {{ helper.t('Export') }} <i class='bx bx-chevron-down'></i> <BtnLoader v-if="loading"></BtnLoader></Btn>
                    <div v-if="showExportMenu" class="export-dd__menu">
                         <button type="button" @click="exportParts(['students'])"><i class='bx bxs-user'></i> {{ helper.t('Export Students') }}</button>
                         <button type="button" @click="exportParts(['schedules'])"><i class='bx bxs-calendar'></i> {{ helper.t('Export Schedules') }}</button>
                         <button type="button" @click="exportParts(['settings'])"><i class='bx bxs-cog'></i> {{ helper.t('Export Settings') }}</button>
                         <button type="button" @click="exportParts(['attendance'])"><i class='bx bx-user-pin'></i> {{ helper.t('Export Attendances') }} <small>({{ helper.t('last 12 months') }})</small></button>
                         <div class="export-dd__sep"></div>
                         <button type="button" @click="exportParts(EXPORT_PARTS.map(p => p.key))"><i class='bx bxs-package'></i> {{ helper.t('Export Everything') }}</button>
                         <button type="button" @click="showExportMenu = false; showExportSelection = true"><i class='bx bx-list-check'></i> {{ helper.t('Export by selection') }}…</button>
                         <div class="export-dd__sep"></div>
                         <button type="button" @click="exportMedia()"><i class='bx bxs-file-archive'></i> {{ helper.t('Export Media') }} <small>(.zip)</small></button>
                    </div>
               </div>

          </div>
     </div>
     <FileUpload @inspected="(data) => inspection = data"></FileUpload>

     <ImportMappingModal v-if="inspection" :inspection="inspection" @close="inspection = null" @imported="onImported" />

     <Modal v-if="showExportSelection" :title="helper.t('Export by selection')" width="420px" @close="showExportSelection = false">
          <p class="small text-muted mb-2">{{ helper.t('Each item becomes its own sheet in the same Excel file.') }}</p>
          <label v-for="part in EXPORT_PARTS" :key="part.key" class="export-pick">
               <input type="checkbox" v-model="exportSelection[part.key]" /> {{ helper.t(part.label) }}
          </label>
          <div class="d-flex justify-content-end gap-2 mt-3">
               <button type="button" class="btn btn-secondary" @click="showExportSelection = false">{{ helper.t('Cancel') }}</button>
               <button type="button" class="btn btn-primary" @click="exportSelected()"><i class='bx bxs-file-export'></i> {{ helper.t('Export') }}</button>
          </div>
     </Modal>

     <Modal v-if="showMediaImport" :title="helper.t('Import Media')" width="480px" @close="showMediaImport = false">
          <p class="small text-muted mb-2">{{ helper.t('Upload a .zip of audio and image files (e.g. from Export Media). Files are added to the media folder.') }}</p>
          <input type="file" accept=".zip,application/zip" class="form-control" :disabled="mediaBusy" @change="mediaZip = $event.target.files[0] || null; mediaReport = null" />
          <label class="export-pick mt-2">
               <input type="checkbox" v-model="mediaOverwrite" :disabled="mediaBusy" /> {{ helper.t('Replace existing files with the same name') }}
          </label>
          <div v-if="mediaReport" class="media-report">
               <span class="badge bg-success">{{ helper.t('Added') }}: {{ mediaReport.added.length }}</span>
               <span class="badge bg-primary">{{ helper.t('Replaced') }}: {{ mediaReport.replaced.length }}</span>
               <span class="badge bg-secondary">{{ helper.t('Skipped (already exist)') }}: {{ mediaReport.skipped.length }}</span>
               <span class="badge bg-danger">{{ helper.t('Rejected') }}: {{ mediaReport.rejected.length }}</span>
               <div v-for="row in mediaReport.rejected" :key="row.name" class="small text-muted mt-1">{{ row.name }} — {{ row.reason }}</div>
          </div>
          <div class="d-flex justify-content-end gap-2 mt-3">
               <button type="button" class="btn btn-secondary" :disabled="mediaBusy" @click="showMediaImport = false">{{ mediaReport ? helper.t('Close') : helper.t('Cancel') }}</button>
               <button type="button" class="btn btn-primary" :disabled="!mediaZip || mediaBusy" @click="importMedia()">
                    <i class='bx bxs-file-import'></i> {{ mediaBusy ? helper.t('Importing...') : helper.t('Import') }} <BtnLoader v-if="mediaBusy"></BtnLoader>
               </button>
          </div>
     </Modal>

     <Rightbar v-if="showReport" :title="helper.t('Import Report')" size="sm" @unmount="showReport = false">
          <ImportReport :report="importResult" />
     </Rightbar>

     <div class="card mt-4 border-0 shadow-sm">
          <div class="card-header bg-light d-flex align-items-center gap-2">
               <i class='bx bxs-info-circle text-primary fs-5'></i>
               <strong>{{ helper.t('Excel Import Instructions') }}</strong>
          </div>
          <div class="card-body">
               <p class="text-muted small mb-3">
                    <i class='bx bx-check-circle text-success me-1'></i>{{ helper.t('First row must be the header row (column names)') }}<br>
                    <i class='bx bx-check-circle text-success me-1'></i>{{ helper.t('Columns can be in any order') }}
               </p>

               <div class="row g-3">
                    <div class="col-md-4">
                         <div class="p-3 rounded bg-danger bg-opacity-10 h-100">
                              <div class="fw-semibold text-danger mb-2">
                                   <i class='bx bxs-error me-1'></i>{{ helper.t('Required Columns') }}
                              </div>
                              <p class="small text-muted mb-2">{{ helper.t('These 3 columns must exist in the header row:') }}</p>
                              <div class="d-flex flex-wrap gap-1">
                                   <span class="badge bg-danger">name</span>
                                   <span class="badge bg-danger">dakhela</span>
                                   <span class="badge bg-danger">class</span>
                              </div>
                         </div>
                    </div>

                    <div class="col-md-4">
                         <div class="p-3 rounded bg-primary bg-opacity-10 h-100">
                              <div class="fw-semibold text-primary mb-2">
                                   <i class='bx bxs-tag me-1'></i>{{ helper.t('Optional Columns') }}
                              </div>
                              <p class="small text-muted mb-2">{{ helper.t('These columns are optional (include if available):') }}</p>
                              <div class="d-flex flex-wrap gap-1">
                                   <span v-for="col in optionalCols" :key="col" class="badge bg-primary bg-opacity-75">{{ col }}</span>
                              </div>
                         </div>
                    </div>

                    <div class="col-md-4">
                         <div class="p-3 rounded bg-success bg-opacity-10 h-100">
                              <div class="fw-semibold text-success mb-2">
                                   <i class='bx bxs-magic-wand me-1'></i>{{ helper.t('Auto-filled Rules') }}
                              </div>
                              <ul class="small text-muted mb-0 ps-3">
                                   <li>{{ helper.t('class_short — auto resolved from config if not provided') }}</li>
                                   <li>{{ helper.t('year — defaults to current year if empty') }}</li>
                                   <li>{{ helper.t('status — defaults to 1 (active) if empty') }}</li>
                              </ul>
                         </div>
                    </div>
               </div>
          </div>
     </div>

</template>

<style scoped>
.export-dd{ position: relative; display: inline-block; }
.export-dd__menu{
     position: absolute; right: 0; top: calc(100% + 6px); z-index: 20;
     min-width: 260px; padding: 6px; border-radius: 10px;
     background: #fff; border: 1px solid #e5e7eb; box-shadow: 0 12px 28px rgba(15, 23, 42, 0.18);
}
.export-dd__menu button{
     display: flex; align-items: center; gap: 8px; width: 100%;
     padding: 8px 10px; border: none; border-radius: 7px; background: transparent;
     text-align: left; font-size: 14px; color: #1f2937; cursor: pointer;
}
.export-dd__menu button:hover{ background: #f1f5f9; }
.export-dd__menu button i{ font-size: 17px; color: #475569; }
.export-dd__menu small{ color: #94a3b8; }
.export-dd__sep{ height: 1px; background: #e5e7eb; margin: 4px 6px; }
.export-pick{ display: flex; align-items: center; gap: 8px; padding: 6px 0; cursor: pointer; }
.media-report{ display: flex; flex-wrap: wrap; gap: 6px; margin-top: 10px; }
.media-report > div{ flex-basis: 100%; }
</style>

 
