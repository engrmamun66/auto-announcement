<script setup>
import { onMounted, inject, ref, reactive, watch, provide, onBeforeUnmount, watchEffect } from 'vue';
import moment from 'moment/moment'
import { useRouter, useRoute } from 'vue-router';
import Note from '../components/note.vue'
import myTable from '../components/myTable.vue'
import Modal from '../components/modal.vue'
import Barcode from '../components/createBarcode.vue'
import Btn from '../components/Btn.vue'
import Pagination from '../components/Pagination.vue'
import BtnLoader from '../components/BtnLoader.vue'
import Switch from '../components/Switch.vue'
import AudioUpload from '../components/AudioUpload.vue'
import Player from '../components/Player.vue'
import AudioRecorAndUpload from '../components/AudioRecorAndUpload.vue'
import RecoringAnimation from '../components/RecoringAnimation.vue'
import Tabset from '../components/Tabset.vue'
import EmDateTimePicker from '../components/EmDateTimePicker.vue'
import StudentAddEdit from '../components/StudentAddEdit.vue'
import CloneStudent from '../components/CloneStudent.vue'
import Ahelper from './../pages/attendence-childs/attendacnceHelper'


const route = inject('route');
const router = inject('router');
const emitter = inject('emitter');
const printDiv = inject('printDiv');
const helper = inject('helper');
const storage = inject('storage');
const classes = inject('classes');
const CONFIG = inject('CONFIG');
const appAccessData = inject('appAccessData');
const sendRemoteAction = inject('sendRemoteAction');
const Socket = inject('Socket');
const is_connected_with_main_app = inject('is_connected_with_main_app');
let http = inject('http');
const punchToCallStudent = inject('punchToCallStudent');
const punchToSubmitAttendance = inject('punchToSubmitAttendance');
const makeCarcode = inject('makeCarcode');
const callbacks = inject('callbacks');
const all_students = inject('all_students', [])
const all_students_non_copied = inject('all_students_non_copied', [])
const getAllStudents = inject('getAllStudents', () => {})

let students = ref([])
let studentLogs = ref([])
const isIPAccess = inject('isIPAccess')
let showPhoneModal = ref(false)
let qrDataUrl = ref('')
let copiedPhoneUrl = ref(false)

function copyPhoneUrl({target}) {
  target.setAttribute('tooltip', 'Copied')
  navigator.clipboard.writeText(buildPhoneUrl()).then(() => {
    copiedPhoneUrl.value = true
    setTimeout(() => copiedPhoneUrl.value = false, 2000)
    setTimeout(() => {
      target.setAttribute('tooltip', 'Copy link')
    }, 1500)
  })
}

function buildPhoneUrl() {
  const ip = globalThis.GLOBAL_DATA?.env?.LOCAL_IP || 'localhost'
  const port = globalThis.GLOBAL_DATA?.env?.PORT || 2323
  return `http://${ip}:${port}/app/#/students`
}

async function openPhoneModal() {
  showPhoneModal.value = true
  if (qrDataUrl.value) return
  try {
    const QRCode = (await import('qrcode')).default
    qrDataUrl.value = await QRCode.toDataURL(buildPhoneUrl(), { width: 260, margin: 2 })
  } catch (e) {
    console.error('QR error', e)
  }
}

let only_similler_students = ref(storage('only_similler_students', false).value)
watch(only_similler_students, (bool) => storage('only_similler_students').value = bool )


let ___params = {
    "page_no": 1,
    "total": 3,
    "totalPages": 1,
    "limit": 100,

    class_short: route.query?.classShort || null,
    name: null,
    card_no: null,
    dakhela: !route.query?.classShort ? route.query?.dakhela || null : null,
    sound1: null,
    phone_number: null,
}
let params = ref(sessionStorage.getItem('students_params') ? JSON.parse(sessionStorage.getItem('students_params')) : ___params)
if(route.query?.classShort || route.query?.dakhela){
  params.value = ___params
}

watch(params, (newVal, oldVal) => {
  sessionStorage.setItem('students_params', JSON.stringify(newVal))
}, {deep: true, immediate: true});

let addMode = ref(false)
let targetStd = ref(null)
let columnName = ref('sound1')
let targetStdForBarcode = ref(null)
let editModeTabIndex = ref(1)
provide('editModeTabIndex', editModeTabIndex)
function hide_modals(event){
  if (event.key === 'Escape') { 
    targetStd.value = null
    addMode.value = false
  }
}
watch(addMode, (bool) => {
  if(bool){
    document.addEventListener('keyup', hide_modals)
  }else {
    document.removeEventListener('keyup', hide_modals)
  }
})
watch(targetStd, (_targetStd) => {
  if(_targetStd){
    document.addEventListener('keyup', hide_modals)
  }else {
    document.removeEventListener('keyup', hide_modals)
  }
})
// let filterForm

function debounce(fn, delay) {
  let timer
  return (...args) => { clearTimeout(timer); timer = setTimeout(() => fn(...args), delay) }
}

async function getStudents({id=null}={}){
  try {
    // console.log('params.value', params.value);
    let parameters = {...params.value, id}
    delete parameters.class_name
    delete parameters.total
    delete parameters.totalPages

    if(only_similler_students.value && parameters.dakhela){
      parameters.class_short = null;
      parameters.name = null;
      parameters.card_no = null;
      let dakehela_number = Number(parameters.dakhela)
      
      
      let student = all_students.value.find(s => {
        return s.dakhela == dakehela_number
      })
      if(student){
        if(/||dakhela::\d+/g.test(student.name)){
          let [ _, main_dakhele ] = /dakhela::(\d+)/g.exec(student.name) || []
          if(main_dakhele){
            main_dakhele = Number(main_dakhele)
            parameters.dakhela = main_dakhele
          }
          parameters.only_similler_students = true 
        }  
      } 
    }
    let response = await http.get('/students', { params: {...parameters, id} }) 
    if(response.status == 200){
      students.value = response.data?.data || [];
      params.value = {...params.value, ...response.data.pagination};
    } 
    
  } catch (error) {
    console.warn('getStudents_error::', error);
  }
}

const getStudentsDebounced = debounce(getStudents, 300)

function playThis (i, key = "isPlaying_sound1", student) {
 
  students.value?.forEach((item, i) => {
    item[key] = false
  });
  
  student[key] = true
  
}
 
async function clearParams({dakhela=null, id=null, get=true}={}){

  params.value.page_no = 1
  params.value.total = 3
  params.value.totalPages = 1
  params.value.limit = 100 
    
  params.value.class_short = null
  params.value.name = null
  params.value.card_no = null
  params.value.dakhela = dakhela
  params.value.sound1 = null
  params.value.phone_number = null
  only_similler_students.value = false
  editModeTabIndex.value = 1
  if(get) getStudents({id}) 
  let studentsTab = document.querySelector('.students-tab')
  if(studentsTab) studentsTab.click()
}
 
async function deleteAudio(std, colName){
  let is_confired = confirm(helper.t('Do you want to delete this audio?'))
  if(is_confired){
    http.delete(`/students/delete-audio/${std.id}/${colName}`).then(()=>{
      std[colName] = null
    })
  } else if(text) {
    emitter.emit('toaster-error', { message: helper.t('Please enter the correct passcode') })
  }
}

let payload = reactive({
  id: null,
  class: null,
  name: null,
  class_short: null,
  dakhela: null,
  year: new Date().getFullYear(),
  card_no: null,
  card_owner: null,
  note: null,
  phone_number: null,
  profile_image: null,
})

let is___adding = ref(false)
let profileImageFile = ref(null)
let profileImagePreview = ref('')
let devices = ref([])
let selectedDevices = ref([])
let showCloneModal = ref(false)
let studentToClone = ref(null)

function clearPayload(){
  payload.id = null
  payload.class = null
  payload.name = null
  payload.class_short = null
  payload.dakhela = null
  payload.year = new Date().getFullYear()
  payload.card_no = null
  payload.card_owner = null
  payload.note = null
  payload.phone_number = null
  payload.profile_image = null
  clearProfileImageFile()

  addMode.value = false
  is___adding.value = false
  editModeTabIndex.value = 1
}

async function getDevices(){
  try {
    const response = await http.get('/devices')
    if(response.status == 200){
      devices.value = response.data.data || response.data || []
      selectedDevices.value = devices.value
    }
  } catch (error) {
    console.warn('getDevices_error::', error)
  }
}

function startAddingNewStudent(){
  addMode.value = true
  editModeTabIndex.value = 1
  clearParams()
  payload.id = null
  payload.class = null
  payload.name = null
  payload.class_short = null
  payload.dakhela = null
  payload.year = new Date().getFullYear()
  payload.phone_number = null
  payload.profile_image = null
  payload.card_owner = null
  payload.note = null
  payload.card_no = null
  clearProfileImageFile()
  selectedDevices.value = devices.value
  is___adding.value = false
}

function prepareToEdit(std){
  Object.keys(payload).forEach(key => {
    payload[key] = std[key]
  });
  clearProfileImageFile()
  selectedDevices.value = devices.value
  addMode.value = true
  editModeTabIndex.value = 1
}

function clearProfileImageFile(){
  if (profileImagePreview.value) {
    URL.revokeObjectURL(profileImagePreview.value)
  }
  profileImageFile.value = null
  profileImagePreview.value = ''
}

function onProfileImageChange(event){
  const file = event.target?.files?.[0] || null
  clearProfileImageFile()
  if (file) {
    profileImageFile.value = file
    profileImagePreview.value = URL.createObjectURL(file)
  }
}

onBeforeUnmount(() => {
  clearProfileImageFile()
})
 


function onClickClone(std){
  studentToClone.value = std
  showCloneModal.value = true
}

function onCloneSuccess(){
  clearParams({dakhela: studentToClone.value?.dakhela})
  only_similler_students.value = true
  getStudents()
  getAllStudents()
}

async function getStudentByDakhela(dakhela){
  try {

    let response = await http.get(`/student/by-dakhela/${dakhela}`)
    if(response.status == 200){
      let student = response.data;
      if(student && student?.id){
        return student
      } else {
        return null
      }
    }  
  } catch (error) {
    console.warn('getStudents_error::', error);
  }
}


async function addStudent(){
  try {

    if(payload.dakhela){
      let isAdded = await getStudentByDakhela(payload.dakhela)
      if(isAdded){
        emitter.emit('toaster-error', {message: helper.t('Dakhela number {value} already exists', { value: payload.dakhela })})
        is___adding.value = false
        return
      }
    }

    if(!payload.name) return emitter.emit('toaster-warning', {message: helper.t('Please enter name')})
    if(!payload.class) return emitter.emit('toaster-warning', {message: helper.t('Please select class')})
    if(!payload.dakhela) return emitter.emit('toaster-warning', {message: helper.t('Please enter dakhela number')})
    if(payload.phone_number && !/^01\d{9}$/.test(String(payload.phone_number).trim())) return emitter.emit('toaster-warning', {message: helper.t('Invalid phone number')})

    is___adding.value = true
    

    const formData = new FormData()
    Object.keys(payload).forEach((key) => {
      const value = payload[key]
      if (value !== null && value !== undefined) {
        formData.append(key, value)
      }
    })
    if (profileImageFile.value) {
      formData.append('profile_image_file', profileImageFile.value)
    }

    http.post('/students/add', formData, {formData: true}).then(async response => {
      if(response.status == 200){
        let { id } = response.data.data;
        if(id){
          clearParams({id})
        }
        getAllStudents()

        if(selectedDevices.value?.length){
          try {
            const userData = {
              pin: payload.dakhela,
              name: payload.name,
              card: payload.card_no || '',
              privilege: 0
            }
            let successCount = 0
            for (const device of selectedDevices.value) {
              const deviceSn = typeof device === 'object' ? device.serial_number : device
              const response = await fetch(`/${deviceSn}/add-user`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(userData)
              })
              if(response.ok) successCount++
            }
            if(successCount === selectedDevices.value.length){
              emitter.emit('toaster-success', { message: helper.t('Student added to {count} device(s)', { count: selectedDevices.value.length }) })
            } else {
              emitter.emit('toaster-warning', { message: helper.t('Student added to {count} of {total} device(s)', { count: successCount, total: selectedDevices.value.length }) })
            }
          } catch (error) {
            emitter.emit('toaster-warning', { message: helper.t('Student added but failed to add to device') })
            console.warn('add_to_device_error::', error)
          }
        }
      }
    }).catch(() => {}).finally(()=>{
      clearPayload()
    })
  } catch (error) {
    console.warn('getStudents_error::', error);
  }
}
async function updateStudent(){
  try {

    if(!payload.name) return emitter.emit('toaster-warning', {message: helper.t('Please enter name')})
    if(!payload.class) return emitter.emit('toaster-warning', {message: helper.t('Please select class')})
    if(!payload.dakhela) return emitter.emit('toaster-warning', {message: helper.t('Please enter dakhela number')})
    if(payload.phone_number && !/^01\d{9}$/.test(String(payload.phone_number).trim())) return emitter.emit('toaster-warning', {message: helper.t('Invalid phone number')})
    is___adding.value = true
    const formData = new FormData()
    Object.keys(payload).forEach((key) => {
      const value = payload[key]
      if (value !== null && value !== undefined) {
        formData.append(key, value)
      }
    })
    if (profileImageFile.value) {
      formData.append('profile_image_file', profileImageFile.value)
    }

    http.post(`/students/update`, formData, {formData: true}).then(async response => {
      if(response.status == 200){
        let { id } = response.data.data;
        getAllStudents()
        getStudents()

        if(selectedDevices.value?.length){
          try {
            const userData = {
              pin: payload.dakhela,
              name: payload.name,
              card: payload.card_no || '',
              privilege: 0
            }
            let successCount = 0
            for (const device of selectedDevices.value) {
              const deviceSn = typeof device === 'object' ? device.serial_number : device
              const response = await fetch(`/${deviceSn}/update-user`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(userData)
              })
              if(response.ok) successCount++
            }
            if(successCount === selectedDevices.value.length){
              emitter.emit('toaster-success', { message: helper.t('Student updated on {count} device(s)', { count: selectedDevices.value.length }) })
            } else {
              emitter.emit('toaster-warning', { message: helper.t('Student updated on {count} of {total} device(s)', { count: successCount, total: selectedDevices.value.length }) })
            }
          } catch (error) {
            emitter.emit('toaster-warning', { message: helper.t('Student updated but failed to update on device') })
            console.warn('update_to_device_error::', error)
          }
        }
      }
    }).catch(() => {}).finally(()=>{
      clearPayload()
    })
  } catch (error) {
    console.warn('getStudents_error::', error);
  }
}


 
async function deleteStudent(id, i){
  try {

    if(!confirm(helper.t('Do you want to delete?'))) return;
    // let passcode = prompt('Type passcode to delete')
    let passcode = true
    // if(passcode !== String(new Date().getDate()) && passcode !== 'D') {
    //   emitter.emit('toaster-error', {message: 'দয়া করে সঠিক পাসকোড দিন'})
    //   return
    // }

    
    const studentToDelete = students.value[i]

    http.delete(`/students/delete/${id}`).then(async (response) => {
      if(response.status == 200){
         students.value.splice(i, 1)

        // Remove student from all devices
        if(devices.value?.length && studentToDelete?.dakhela){
          try {
            let successCount = 0
            for(const device of devices.value){
              const deviceSn = typeof device === 'object' ? device.serial_number : device
              const devResponse = await fetch(`/${deviceSn}/remove-user`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ pin: studentToDelete.dakhela })
              })
              if(devResponse.ok) successCount++
            }

            if(successCount === devices.value.length){
              emitter.emit('toaster-success', { message: helper.t('Student deleted from {count} device(s)', { count: devices.value.length }) })
            } else if(successCount > 0){
              emitter.emit('toaster-warning', { message: helper.t('Student deleted from {count} of {total} device(s)', { count: successCount, total: devices.value.length }) })
            }
          } catch (deviceError) {
            emitter.emit('toaster-warning', { message: helper.t('Student deleted but failed to remove from devices') })
          }
        }
      }
    }).catch(() => {}).finally(() => {
      getStudents()
      getAllStudents()
    })
  } catch (error) {
    console.warn('getStudents_error::', error);
  }
}


/**
 * 
 * @param date=2025-07-22
 */
async function getStudentPuchLogs({date=null, day=null}={}){
  studentLogs.value = []
  if(!payload.id){
    return
  }
  let student = students.value.find(std => std.id == payload.id)
  if(student){
    http.post(`/punch-log/get-log/`, { student, date, day }).then(response => {
      if(response.status == 200){
         studentLogs.value = response.data.data
      }
    }).catch(() => {}).finally(()=>{ 

    })
  }
}
 
onMounted(async()=>{

  emitter.on('document_clicked', ()=>{
    addMode.value = false
    editModeTabIndex.value = 1
  })

  await getDevices()
  await getStudents()

  if(route.query.dakhela){
    let student = await getStudentByDakhela(route.query.dakhela)
    if(student){
      if(route.query.log === 'true'){
        prepareToEdit(student)
        editModeTabIndex.value = 2
        getStudentPuchLogs()
      } 
      else {
        clearParams({dakhela: route.query.dakhela, get: true})
      }
    } 
  }
})
const log = console.log 


let dateTimePickerRef = ref(null)
let targetStudent = ref(null)
let pickerModelValue = reactive({
  startDate: new Date(),
  endDate: new Date(),
  startTime: '07:00',
  endTime: '11:00',
})

function is_skip_sms(){
  let devmode = route.query.dev === 'true' 
  if(!devmode) return true
  let allow = confirm('Allow SMS')
  if(allow) return !allow
}

function onChange_dateTimePicker(data){
  punchToSubmitAttendance(makeCarcode(targetStudent.value), {source: 'manual_button', delay: 0, punch_time: data.startDateTime, skipSms: is_skip_sms() })
}

function onClickAttendance(std){
  if(!confirm(helper.t('Are you sure to submit attendance?'))) return;
  punchToSubmitAttendance(makeCarcode(std), {source: 'manual_button', delay: 0, skipSms: is_skip_sms()})
}

let PunchButtonsRef = ref([])
let showBulkPunchModal = ref(false)
let bulkPunchProgress = ref(0)
let bulkPunchRunning = ref(false)
let bulkPunchDone = ref(false)

function bulkPunch() {
  if (!PunchButtonsRef.value?.length) return;
  bulkPunchProgress.value = 0;
  bulkPunchRunning.value = false;
  bulkPunchDone.value = false;
  showBulkPunchModal.value = true;
}

async function startBulkPunch() {
  if (bulkPunchRunning.value) return;
  bulkPunchRunning.value = true;
  bulkPunchDone.value = false;
  const buttons = [...PunchButtonsRef.value];
  for (let i = 0; i < buttons.length; i++) {
    buttons[i].click();
    bulkPunchProgress.value = Math.round(((i + 1) / buttons.length) * 100);
    await new Promise(r => setTimeout(r, 300));
  }
  bulkPunchRunning.value = false;
  bulkPunchDone.value = true;
}

let fixedWidthSoundCol = ref(Boolean(sessionStorage.getItem('fixedWidthSoundCol_students') === 'true'))
watch(fixedWidthSoundCol, (newVal) => {
  sessionStorage.setItem('fixedWidthSoundCol_students', String(newVal))
})


</script>

<template>

    <div class="d-flex justify-content-between align-items-center flex-wrap">
      <h1>{{ !addMode ? helper.t('Students') : helper.t('Add Student') }}</h1>

      <div class="d-flex justify-content-end align-items-center flex-wrap gap-2">
        <div v-if="!isIPAccess" class="btn-group me-2" style="display:inline-flex;align-items:stretch;">

          <Btn style="background: #1565C0;border-top-right-radius: 0px; border-bottom-right-radius: 0px;" @click="openPhoneModal"><i class='bx bx-qr'></i> {{ helper.t('Open With Phone') }}</Btn>
          <button class="btn" style="background:#005a4a;color:#fff;border-left:1px solid rgba(255,255,255,0.2);padding:0 12px;display:inline-flex;align-items:center;justify-content:center;"
            :tooltip="helper.t('Copy link')"
            @click.prevent="copyPhoneUrl">
            <i class="bx bx-link" style="pointer-events: none;"></i>
          </button>
        </div>
        <Btn class="me-2" style="background: #673AB7;" :tooltip="`params.total = ${params?.total}`" >
          {{ helper.t('Total') }}: 
          <span class="bg-success- p-1">{{ all_students_non_copied?.length }}</span>
           <!-- <span>{{ params?.total || '0' }}</span> -->
        </Btn>
        <template v-if="!CONFIG?.settings?.attendance?.only_attendance_feature">
          <Btn @click.stop="bulkPunch()" style="background: #673AB7;" :disabled="!PunchButtonsRef?.length">{{ helper.t('Bulk Punch') }} ({{ PunchButtonsRef?.length || 0 }})</Btn>
        </template>
        <Btn v-if="!addMode" class="me-2" @click="startAddingNewStudent" ><i class='bx bx-plus'></i> {{ helper.t('Add New') }}</Btn>
      </div>
    </div>


    <!-- Student Add/Edit Modal -->
    <StudentAddEdit
      v-model="addMode"
      :payload="payload"
      :editModeTabIndex="editModeTabIndex"
      @update:editModeTabIndex="(tab) => editModeTabIndex = tab"
      :classes="classes"
      :profileImagePreview="profileImagePreview"
      :profileImageFile="profileImageFile"
      :devices="devices"
      :selectedDevices="selectedDevices"
      @update:selectedDevices="(val) => selectedDevices = val"
      :isAdding="is___adding"
      :studentLogs="studentLogs"
      :appAccessData="appAccessData"
      :CONFIG="CONFIG"
      :students="students"
      @add-student="addStudent"
      @update-student="updateStudent"
      @get-punch-logs="getStudentPuchLogs"
      @profile-image-change="onProfileImageChange"
      @clear-payload="clearPayload"
    />

    <CloneStudent
      v-model="showCloneModal"
      :student="studentToClone"
      :devices="devices"
      @clone-success="onCloneSuccess"
    />













      
    <!-- Search -->
    <div class="form-area mt-3 p-4 border radius-10">
      <div asform>
        <div class="row">
          <div class="col-md-3 col-12">
            <div class="form-group">
              <label for="email">{{ helper.t('Class') }}</label>
              <select v-model="params.class_short" @change="getStudents" class="form-control cb-input" id="ClassId">
                <option :value="null">-{{helper.t('class')}}-</option>
                <template v-for="(cls, index) in classes" :key="index">
                  <option :value="cls.class_short">{{cls.class_name}}</option>
                </template>
                
              </select>
            </div>
          </div>
          <div class="col-md-3 col-12">
            <div class="form-group sssffefefasdgsadfg">
              <label for="email">{{ helper.t('Dakhela') }}
                <template v-if="!CONFIG?.settings?.attendance?.only_attendance_feature">
                  <span tooltip="All Smillar">
                    <input v-model="only_similler_students" :value="only_similler_students" style="opacity: 0.7;" type="checkbox" @change="()=>{
                      if(params.dakhela){
                        getStudents()
                      }
                    }" >
                  </span>
                </template>
              </label>
              <input v-model="params.dakhela" @keyup="getStudentsDebounced" @input="getStudentsDebounced" type="number" class="form-control cb-input" :placeholder="helper.t('Search dakhela...')">
            </div> 
          </div>
          <!-- <div class="col-md-2 col-12">
            <div class="form-group">
              <label for="email">Card</label>
              <input v-model="params.card_no" type="text" class="form-control cb-input">
            </div>
          </div> -->
          <div class="col-md-3 col-12">
            <div class="form-group">
              <label for="name">{{ helper.t('Name') }}</label>
              <input v-model="params.name" type="text" class="form-control cb-input" :placeholder="helper.t('Search name...')" @keyup="getStudentsDebounced" @input="getStudentsDebounced">
            </div>
          </div>
          <div class="col-md-3 col-12">
            <div class="form-group">
              <label>{{ helper.t('Phone Number') }}</label>
              <input v-model="params.phone_number" type="tel" class="form-control cb-input" :placeholder="helper.t('Search phone...')" @keyup="getStudentsDebounced" @input="getStudentsDebounced">
            </div>
          </div>
          <template v-if="!CONFIG?.settings?.attendance?.only_attendance_feature">
            <div class="col-md-3 col-12">
              <div class="form-group">
                <label for="email">{{ helper.t('Sound') }}</label>
                <select v-model="params.sound1" @change="getStudents" class="form-control cb-input">
                  <option :value="null">-{{helper.t('All')}}-</option>
                  <option value="no_sound">No</option> 
                  <option value="has_sound">Yes</option> 
                </select>
              </div>
            </div>
          </template>

          <div class="col-md-3 col-12" style="margin-top: 12px;">
            <div class="form-group mt-md-3"> 
                <div class="d-flex justify-content-between w-100">
                  <div>
                    <Btn @click.stop="getStudents()" class="me-1"></Btn>
                    <Btn @click.stop="clearParams();getStudents();editModeTabIndex=1" class="me-1 red">Clear</Btn>
                  </div>
                  
                </div>
              </div>
          </div>
          
          </div>

          <div class="col-12 mt-4 w-100 all-class-buttons-to-filter-area d-none d-md-block">
            <div class="all-class-buttons-to-filter">
              <template v-for="cls in classes">
                <button class="class-short-btn" :class="{'active': params.class_short === cls.class_short}" var="cls?.display_name || cls.class_short"
                @click="clearParams({get: false});params.page_no = 1;params.class_short = cls.class_short;getStudents()" >{{ helper.ucfirst(cls?.display_name || cls.class_short) }}</button>
              </template>

            </div>
          </div>
          
          
      
        
        </div>
      
    </div>
 

    <myTable class="mt-3">
      <template #thead>
        <thead>
          <tr>
            <th class="d-none d-md-table-cell">{{ helper.t('Class') }}</th>
            <th>{{ helper.t('Name') }}</th>
            <th class="d-none d-md-table-cell">{{ helper.t('Image') }}</th>
            <template v-if="!CONFIG?.settings?.attendance?.only_attendance_feature">
              <th class="d-none d-lg-table-cell">{{ helper.t('Card Owner') }}</th>
            </template>
            <th class="d-none d-md-table-cell">{{ helper.t('Phone') }}</th>
            <th>{{ helper.t('Dakhela') }}</th>
            <th class="d-none d-lg-table-cell">{{ helper.t('Year') }}</th>
            <template v-if="!CONFIG?.settings?.attendance?.only_attendance_feature">
              <th class="d-none d-lg-table-cell" @dblclick="fixedWidthSoundCol = !fixedWidthSoundCol" :style="fixedWidthSoundCol ? 'width: 300px;' : ''" :tooltip="helper.t('Double Click')" flow="down">
                {{ helper.t('Sound') }}
                <template v-if="fixedWidthSoundCol">
                  <i class='bx bx-arrow-from-right transformY-3px' ></i>
                  <i class='bx bx-arrow-from-left transformY-3px' ></i>
                </template>
              </th>
            </template>
            <th>{{ helper.t('Status') }}</th>
            <th>
              {{ helper.t('Punch') }}
              <template v-if="CONFIG?.settings?.attendance?.status">
                / {{ helper.t('Attendance') }}
              </template>
            </th>
            <th>{{ helper.t('Action') }}</th>
          </tr>
        </thead>
      </template>
      <template #rows>
        <template v-if="students?.length">
          <template v-for="(std, i) in students.toReversed()">
            <tr @auxclick="log(std)" :style="!std.status ? 'opacity: 0.9' : ''"  >
              <td class="text-left d-none d-md-table-cell" @click.stop="log(std)"> {{ std.class }} </td>
              <td class="text-left cp" @click.stop="prepareToEdit(std)" :student-id="std.id">
                {{ std.name.split('||')?.[0] }}
                <div class="d-md-none mt-1">
                  <small class="text-muted d-block">{{ std.class }}</small>
                  <small v-if="std.phone_number" class="text-muted">{{ String(std.phone_number).slice(0,3) + '...' + String(std.phone_number).slice(-3) }}</small>
                </div>
              </td>
              <td class="d-none d-md-table-cell">
                <img class="profile-thumb" :src="std.profile_image || '/default-profile-image.png'" alt="profile" />
              </td>
              <template v-if="!CONFIG?.settings?.attendance?.only_attendance_feature">
                <td class="d-none d-lg-table-cell">
                  <p class="mb-1">{{ callbacks.getCardOwnerName(std?.card_owner) }}</p>
                  <div class="student-note" :tooltip="helper.t('Note')" v-if="std?.note">{{ std?.note }}</div>
                </td>
              </template>
              <td class="d-none d-md-table-cell">
                <span v-if="std.phone_number" class="text-muted small">{{ String(std.phone_number).slice(0,3) + '...' + String(std.phone_number).slice(-3) }}</span>
              </td>
              <td> 
                <div class="align-items-center d-flex">
                  <span class="p-1" @dblclick="params.dakhela = std.dakhela">{{ std.dakhela }}</span>
                  <!-- No need multiple card Access If using only for attendance -->
                  <span id="CLONE___STUDENT" v-if="CONFIG?.settings?.attendance?.only_attendance_feature === false" :tooltip="helper.t('Clone Student')">
                    <i v-if="std.name && String(std.name)?.indexOf('||dakhela') > -1 === false" @click.stop="onClickClone(std)" class="bx bxs-copy-alt cp px-1">
                    </i>
                  </span>
                </div>
                
              </td> 
              
              <td class="d-none d-lg-table-cell"> {{ std.year }} </td>
              <template v-if="!CONFIG?.settings?.attendance?.only_attendance_feature">
                <template v-for="column in ['sound1']">
                  <td class="d-none d-lg-table-cell">
                    <!-- Sound -->
                    <template v-if="std[column]">            
                      <template v-if="!std[`isPlaying_${column}`]">            
                        <div class="d-flex align-items-center">
                          <Btn  @click.stop="playThis(i, `isPlaying_${column}`, std); " class="radius-10 sm sound w-100" style="padding: 2px auto;" >
                            <i class='bx bx-play size-1 transformY-3px'></i>&nbsp;{{ helper.t('Play') }}
                          </Btn>
                          <!-- <span v-if="std.name.indexOf('||dakhela') > -1 === false" class="ms-2 me-1 cp" @click.stop="deleteAudio(std, column)" > -->
                          <span class="ms-2 me-1 cp" @click.stop="deleteAudio(std, column)" >
                            <i class='bx bxs-trash-alt text-danger size-1' ></i>
                          </span>
                        </div> 
                      </template>
                      <template v-else>
                        <Player  :src="std[column]" @close="std[`isPlaying_${column}`] = false" :fire-end-event="true" @ended="std[`isPlaying_${column}`] = false"></Player>
                      </template>
                    </template>  
                    <template v-else>
  
                      <div class="d-flex align-items-center">
                        <AudioUpload :student="std" :column="column" @change="({audio_path, audio_url})=>{
                          std[column] = audio_url
                        }" ></AudioUpload>
                        <span :tooltip="helper.t('Rcord Sound')" @click="targetStd=std;columnName=column">
                          <i class='bx bxs-microphone p-1 ms-1 cp' ></i>
                        </span>
                      </div>
  
                    </template>  
                  </td> 
                </template>
              </template>
              <td> 
                <Switch size="sm" v-model="std.status" @change="async (status) => {
                await http.post('/students/update-status', {id: std.id, status} );
              
                }"></Switch> 
              </td> 

              <td>
                <template v-if="CONFIG?.settings?.attendance?.status">
                  <template v-if="std.name.indexOf('Copied') > -1">
                    <button ref="PunchButtonsRef" class="class-short-btn px-2 for-call" 
                    @click.stop="() => {
                      let barcode = makeCarcode(std);
                      let data = {message: 'কার্ডটি সফলভাবে পাঞ্চ হয়েছে।', source: 'manual_button', for_attendence: false};
                      punchToCallStudent(barcode, data)
                    } 
                    ">
                      <!-- For Guardian-->
                      <!-- Call Punch -->
                      Call&nbsp;Punch
                    </button>
                  </template> 
                  <template v-else>

                    <div class="d-flex justify-content-start gap-1">
                      <button class="class-short-btn px-2 for-attendence" style="--tmaxW: 27em" :tooltip="helper.getShifts(classes, std.class_short, false).map(shift => Ahelper.printShift(shift)).join(' | ')"
                      @click.stop="onClickAttendance(std)"
                      >
                          <!-- For Students Attendence -->
                          Attendance
                      </button>
                      <!-- For Students Attendence calendar-->
                      <button class="class-short-btn px-2 for-attendence" 
                      :tooltip="helper.getShifts(classes, std.class_short, false).map(shift => Ahelper.printShift(shift)).join(' | ')"
                      style="--tmaxW: 27em"
                      @click.stop="async() => {
                        targetStudent = std; 
                        $refs.dateTimePickerRef.setTime(moment().format('HH:mm'))
                        await helper.wait(100)
                        $refs.dateTimePickerRef.toggle()

                      }" >
                          <i class='bx bxs-calendar'></i> 
                      </button>

                    </div>
                
                      <!-- <small v-for="shift in helper.getShifts(classes, std.class_short, false)">
                        {{ Ahelper.printShift(shift) }}<br>
                      </small>  -->
                  </template> 
                </template> 
                <template v-else>
                  <button ref="PunchButtonsRef" class="class-short-btn px-2" @click.stop="punchToCallStudent(makeCarcode(std), {message: 'কার্ডটি সফলভাবে পাঞ্চ হয়েছে।', source: 'manual_button'})">
                    Punch
                  </button>
                </template> 
              </td>
              <td> 
                <div class="d-flex justify-content-center action-icons">
                  <ul class="d-flex gap-1">
                    <li tooltip="Edit student" class="fs-5 transformY-3px">
                      <i @click="prepareToEdit(std)" class='bx bx-edit cp' ></i>
                    </li>
                    <li tooltip="Delete student" class="fs-5 transformY-3px">
                      <i @click="deleteStudent(std.id, i)" class='bx bx-trash text-danger cp' ></i>
                    </li>
                  </ul>
      
                </div>
              </td> 
          </tr> 

          
            
          </template>
        </template>
        <template v-else>
          <tr>
              <td colspan="88" class="text-center">{{ helper.t('No student found') }}</td>
          </tr>
        </template>
      </template>
    </myTable>

    <div class="d-flex justify-content-center mt-3">
      <Pagination v-if="params?.totalPages > 1" v-model="params" @jumpToPage="(page) => {
        params.page_no = page
        getStudents()
      }" ></Pagination>
    </div> 
    <div v-if="route.query.barcode" class="d-flex justify-content-center mt-3 ">
      <router-link :to="{name: 'home', query: {barcode: route.query.barcode}}" class="bg1 border2 radius-5 text-center text-black-50" style="width: 200px">{{ helper.t('Back And Push Barcode') }}</router-link>
    </div>

  
    <!-- Open With Phone Modal -->
    <modal v-if="showPhoneModal" :title="helper.t('Open With Phone')" @close="showPhoneModal = false">
      <div class="phone-modal">
        <div class="phone-modal__qr">
          <img v-if="qrDataUrl" :src="qrDataUrl" />
          <div v-else class="phone-modal__qr-spinner"><div class="recorder-spinner"></div></div>
        </div>
        <p class="phone-modal__hint"><i class='bx bx-scan'></i> {{ helper.t('Point your phone camera at the QR code to open the app') }}</p>
        <div class="phone-modal__url-row">
          <a :href="buildPhoneUrl()" target="_blank" class="phone-modal__url">{{ buildPhoneUrl() }}</a>
          <button @click="copyPhoneUrl" class="phone-modal__copy-btn" :class="{ 'phone-modal__copy-btn--copied': copiedPhoneUrl }">
            <i :class="copiedPhoneUrl ? 'bx bx-check' : 'bx bx-copy'"></i>
            {{ copiedPhoneUrl ? helper.t('Copied!') : helper.t('Copy') }}
          </button>
        </div>
      </div>
    </modal>

    <!-- Bulk Punch Modal -->
    <modal v-if="showBulkPunchModal" :title="helper.t('Bulk Punch')" @close="!bulkPunchRunning && (showBulkPunchModal = false)" :close-on-esc="!bulkPunchRunning" :close-on-click-away="false">
      <div>
        <p class="mb-3">Punch <strong>{{ PunchButtonsRef?.length }}</strong> displayed students?</p>

        <template v-if="bulkPunchRunning || bulkPunchDone">
          <div class="mb-2 d-flex justify-content-between">
            <small>{{ bulkPunchDone ? helper.t('Done!') : helper.t('Punching...') }}</small>
            <small>{{ bulkPunchProgress }}%</small>
          </div>
          <div class="progress mb-3" style="height:10px">
            <div class="progress-bar" :class="bulkPunchDone ? 'bg-success' : 'bg-primary'" role="progressbar"
              :style="{width: bulkPunchProgress + '%'}" :aria-valuenow="bulkPunchProgress" aria-valuemin="0" aria-valuemax="100">
            </div>
          </div>
          <Btn v-if="bulkPunchDone" class="w-100" @click="showBulkPunchModal = false">{{ helper.t('Close') }}</Btn>
        </template>

        <template v-else>
          <div class="d-flex gap-2">
            <Btn class="red flex-fill" @click="showBulkPunchModal = false">{{ helper.t('Cancel') }}</Btn>
            <Btn class="green flex-fill" @click="startBulkPunch()">{{ helper.t('Start Punch') }}</Btn>
          </div>
        </template>
      </div>
    </modal>


    <template v-if="targetStd && columnName">
    <modal @close="targetStd=null" :title="false">
      <div style="height:100px" class="d-flex justify-content-center align-items-center">

        <AudioRecorAndUpload :student="targetStd" :column="columnName" :uploadAfterRecord="true" @uploaded="({audio_path, audio_url})=>{
          students.forEach(student => {
            if(student.id == targetStd.id){
              student[columnName] = audio_url;
            }
          })
          targetStd = null;
          columnName = null;
        }">
        </AudioRecorAndUpload>
      </div>
    </modal>

    </template>
  

    <EmDateTimePicker ref="dateTimePickerRef"
      v-model="pickerModelValue"
      @change="onChange_dateTimePicker"
      @close="false"
      :displayFormat="'DD-MMM-Y'"
      :rangePicker="false" 
      :timePicker="true" 
      :minDate="moment().subtract(1, 'month')"
      :isDisabled="false"
      :autoOpen="false"
      :timePickerButtons="true"
      :use24FormatTimeForEvents="true"
      :invisible="true"
      :pickTimeFirst="true"
      displayIn="modal" 
      :buttons="{applyBtn: 'Set-Attendace', todayBtn: false}"
      >
    </EmDateTimePicker>


</template>

<style>
.recorder-overlay {
  position: fixed;
  inset: 0;
  z-index: 9999;
  background: rgba(0,0,0,0.6);
  display: flex;
  align-items: center;
  justify-content: center;
}
.recorder-overlay__box {
  position: relative;
  width: 500px;
  height: 500px;
  max-width: 96vw;
  max-height: 96vh;
  background: #111;
  border-radius: 8px;
  overflow: hidden;
}
.recorder-overlay__frame {
  border: none;
  width: 100%;
  height: 100%;
}
.recorder-overlay__loader {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #111;
  z-index: 10001;
}
.recorder-spinner {
  width: 52px;
  height: 52px;
  border: 5px solid rgba(255,255,255,0.2);
  border-top-color: #fff;
  border-radius: 50%;
  animation: recorder-spin 0.8s linear infinite;
}
@keyframes recorder-spin {
  to { transform: rotate(360deg); }
}

/* Phone Modal */
.phone-modal {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
  padding: 8px 0 4px;
}
.phone-modal__qr {
  width: 220px;
  height: 220px;
  border-radius: 12px;
  overflow: hidden;
  border: 1px solid #e5e7eb;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f9fafb;
}
.phone-modal__qr img {
  width: 100%;
  height: 100%;
  display: block;
}
.phone-modal__qr-spinner {
  display: flex;
  align-items: center;
  justify-content: center;
}
.phone-modal__qr-spinner .recorder-spinner {
  border-color: rgba(0,0,0,0.1);
  border-top-color: #4a6fa5;
}
.phone-modal__hint {
  font-size: 13px;
  color: #6b7280;
  margin: 0;
  display: flex;
  align-items: center;
  gap: 6px;
}
.phone-modal__hint .bx {
  font-size: 16px;
  color: #4a6fa5;
}
.phone-modal__url-row {
  display: flex;
  align-items: center;
  width: 100%;
  background: #f3f4f6;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  overflow: hidden;
}
.phone-modal__url {
  flex: 1;
  font-size: 12px;
  font-family: monospace;
  color: #374151;
  padding: 8px 12px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  text-decoration: none;
}
.phone-modal__url:hover { text-decoration: underline; }
.phone-modal__copy-btn {
  flex-shrink: 0;
  border: none;
  border-left: 1px solid #e5e7eb;
  background: #fff;
  color: #374151;
  padding: 8px 14px;
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 5px;
  transition: background 0.15s;
}
.phone-modal__copy-btn:hover { background: #f9fafb; }
.phone-modal__copy-btn--copied { color: #16a34a; }
.recorder-overlay__close {
  position: absolute;
  top: 10px;
  right: 14px;
  z-index: 10000;
  background: #e53935;
  color: #fff;
  border: none;
  border-radius: 50%;
  width: 36px;
  height: 36px;
  font-size: 18px;
  cursor: pointer;
  line-height: 1;
  box-shadow: 0px 2px 15px #0000006e;
}
.print-buton{
  padding: 5px 5px;
  border-radius: 5px;
  background: var(--grad1);
  /* margin-left: 0px 20px; */
} 
.all-class-buttons-to-filter-area{
  min-height: 40px;
  overflow-y: auto;
}
.all-class-buttons-to-filter{ 
  display: flex;
  flex-wrap: wrap;
  justify-content: flex-start;
}
.class-short-btn {
  padding: 5px 14px;
  text-align: center;
  background: var(--grad3);
  margin-right: 5px;
  border-radius: 20px;
  color: white;
  margin-bottom: 5px;
  border: 2px solid transparent;
  font-size: 12.5px;
  font-weight: 600;
  letter-spacing: 0.2px;
  cursor: pointer;
  transition: transform 0.15s, box-shadow 0.15s, border-color 0.15s, background 0.15s;
  box-shadow: 0 2px 5px rgba(0,0,0,0.15);
  position: relative;
}
.class-short-btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 10px rgba(0,0,0,0.22);
}
.class-short-btn:active {
  transform: translateY(0px);
  box-shadow: 0 1px 3px rgba(0,0,0,0.15);
}
.class-short-btn.active {
  border-color: #fbbf24;
  background: linear-gradient(90deg, #92400e 0%, #b45309 100%);
  box-shadow: 0 0 0 3px rgba(251,191,36,0.35), 0 3px 8px rgba(0,0,0,0.25);
  transform: translateY(-1px);
  z-index: 1;
}
.class-short-btn.for-call,
.class-short-btn.attendence {
  width: 104px;
}
.class-short-btn.for-call {
  background: #00529e;
}
.class-short-btn.for-attendence {
  background: #009a9e;
}
.std-clone-area{
  display: flex;
  justify-content: flex-start;
}
.std-clone-area input{
  padding: 5px 8px;
  border: 1px solid #b8b8b8;
  border-radius: 6px;
  width: 100px;
}
.std-clone-area button{
  padding: 5px 10px;
  border: 1px solid #b8b8b8;
  border-radius: 6px;
  margin-left: 5px;
}
.profile-thumb{
  width: 34px;
  height: 34px;
  flex-shrink: 0;
  border-radius: 50%;
  object-fit: cover;
  border: 1px solid #cfcfcf;
  background: #fff;
}
.action-icons > *:not(:last-child){
  margin-right: 8px;
}
.student-note{
    width: 100%;
    padding: 1px 5px;
    background-color: #ffffff4f;
    border-radius: 3px;
    font-size: 13px;
}
</style>
