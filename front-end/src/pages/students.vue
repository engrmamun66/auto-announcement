<script setup>
import { onMounted, inject, ref, reactive } from 'vue';
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
import Ahelper from './../pages/attendence-childs/attendacnceHelper'


const route = inject('route');
const router = inject('router');
const emitter = inject('emitter');
const printDiv = inject('printDiv');
const helper = inject('helper');
const classes = inject('classes');
const CONFIG = inject('CONFIG');
let http = inject('http'); 
const punchToCallStudent = inject('punchToCallStudent');
const punchToSubmitAttendance = inject('punchToSubmitAttendance');
const makeCarcode = inject('makeCarcode');
const callbacks = inject('callbacks');
const all_students = inject('all_students', [])
const getAllStudents = inject('getAllStudents', () => {})

let students = ref([])
let studentLogs = ref([])
let only_similler_students = ref(false)
let params = ref({
    "page_no": 1,
    "total": 3,
    "totalPages": 1,
    "limit": 100,

    class_name: null,
    name: null,
    card_no: null,
    dakhela: route.query?.dakhela || null,
    sound1: null,
})
let addMode = ref(false)
let showSearchForm = ref(true)
let targetStd = ref(null)
let columnName = ref('sound1')
let targetStdForBarcode = ref(null)
let editModeTabIndex = ref(1)
// let filterForm

async function getStudents({id=null}={}){
  try {
    let parameters = {...params.value, id}

    if(only_similler_students.value && parameters.dakhela){
      parameters.class_name = null;
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
      students.value = response.data.data;
      params.value = {...params.value, ...response.data.pagination};
    } 
    
  } catch (error) {
    console.warn('getStudents_error::', error);
  }
}

function playThis (i, key = "isPlaying_sound1", student) {
 
  students.value?.forEach((item, i) => {
    item[key] = false
  });
  
  student[key] = true
  
}
 
async function clearParams({dakhela=null, id=null, get=true}={}){

  if(!get) getStudents()
  
  params.value.page_no = 1
  params.value.total = 3
  params.value.totalPages = 1
  params.value.limit = 100 
    
  params.value.class_name = null
  params.value.name = null
  params.value.card_no = null
  params.value.dakhela = dakhela
  params.value.sound1 = null
  only_similler_students.value = false
  editModeTabIndex.value = 1
  if(get) getStudents({id}) 
  let studentsTab = document.querySelector('.students-tab')
  if(studentsTab) studentsTab.click()
}
 
async function deleteAudio(std, colName){
  let text = prompt('Type secret pass code')
  if(text === 'delete' || text === String(new Date().getDate()) || text === 'D'){
    http.delete(`/students/delete-audio/${std.id}/${colName}`).then(()=>{
      std[colName] = null
    })
  } else if(text) {
    emitter.emit('toaster-error', { message: 'দয়া করে সঠিক পাসকোড দিন' })
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
  id_type: 1,
})

let is___adding = ref(false)

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
  payload.id_type = 1

  addMode.value = false 
  is___adding.value = false 
  editModeTabIndex.value = 1
}

function prepareToEdit(std){
  Object.keys(payload).forEach(key => {
    payload[key] = std[key]
  });
  addMode.value = true
  editModeTabIndex.value = 1
}
 


async function onClickClone(std){
  try {

    const data = {}

    Object.keys(payload).forEach(key => {
      data[key] = std[key]
    });

    std._cloning = true

    if(!std.sound1){
      emitter.emit('toaster-warning', { message: 'কপি করার আগে সাউন্ড রেকর্ড করুন' })
      return
    }


    if(!std.dakhela_new){
      emitter.emit('toaster-warning', {message: 'নতুন দাখেল নাম্বার লিখুন'})
      return
    }
    
    data.dakhela_new = Math.abs(Number(std.dakhela_new)) 
    console.log('data.dakhela_newdata.dakhela_new///', data.dakhela_new);
    
    
    http.post(`/students/clone/${std.id}`, data).then(async (response) => {
      if(response.status == 200){
        std.cloneMode = false
        clearParams({dakhela: std.dakhela})
        only_similler_students.value = true
        await getStudents()
        getAllStudents()
      }
    }).catch((err) => { 
      if(err.response.data?.message){
        emitter.emit('toaster-error', { message: err.response.data?.message })
      }
    }).finally(()=>{
      
    })
  } catch (error) {
    console.warn('getStudents_error::', error);
  }
}


async function addStudent(){
  try {

    if(!payload.name) return emitter.emit('toaster-warning', {message: 'নাম লিখুন'})
    if(!payload.class) return emitter.emit('toaster-warning', {message: 'ক্লাস নির্বাচন করুন'})
    if(!payload.dakhela) return emitter.emit('toaster-warning', {message: 'দাখেল নাম্বার লিখুন'})
    is___adding.value = true
    http.post('/students/add', payload).then(response => {
      if(response.status == 200){
        let { id } = response.data.data; 
        if(id){          
          clearParams({id}) 
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

    if(!payload.name) return emitter.emit('toaster-warning', {message: 'নাম লিখুন'})
    if(!payload.class) return emitter.emit('toaster-warning', {message: 'ক্লাস নির্বাচন করুন'})
    if(!payload.dakhela) return emitter.emit('toaster-warning', {message: 'দাখেল নাম্বার লিখুন'})
    is___adding.value = true
    http.post(`/students/update`, payload).then(response => {
      if(response.status == 200){
        let { id } = response.data.data; 
        if(id){          
          clearParams({id, get: false}) 
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

    if(!confirm('Do you want to delete?')) return;
    let passcode = prompt('Type passcode to delete')
    if(passcode !== String(new Date().getDate()) && passcode !== 'D') {
      emitter.emit('toaster-error', {message: 'দয়া করে সঠিক পাসকোড দিন'})
      return
    }

    
    http.delete(`/students/delete/${id}`).then(response => {
      if(response.status == 200){
         students.value.splice(i, 1)
      }
    }).catch(() => {}).finally(()=>{ 

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

  await getStudents()

  if(route.query.log === 'true' && route.query.dakhela){
      let student = students.value.find(std => Number(std.dakhela) === Number(route.query.dakhela))
      if(student){
        prepareToEdit(student)
        editModeTabIndex.value = 2
        getStudentPuchLogs()
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

function onChange_dateTimePicker(data){
  punchToSubmitAttendance(makeCarcode(targetStudent.value), {source: 'manual_button', delay: 0, punch_time: data.startDateTime })
}



</script>

<template>
    <div class="d-flex justify-content-between align-items-center flex-wrap">
      <h1>{{ !addMode ? 'Students' : 'Add Student'}}</h1> 

      <div class="d-flex justify-content-end">
        <Btn @click="showSearchForm = !showSearchForm;editModeTabIndex=1" class="me-2"><i class='bx bx-search transformY-2px size-1' ></i> {{ showSearchForm ? "Hide" : 'Show' }} search</Btn>
        <Btn v-if="!addMode" class="me-2" @click="addMode = !addMode;editModeTabIndex=1;clearParams();payload.id = null" ><i class='bx bx-plus'></i> Add Student</Btn>
        <Btn v-else class="me-2 red" @click="addMode = !addMode;editModeTabIndex=1;clearParams();payload.id = null" >Cancel</Btn>
        <!-- <Btn @click="router.push({name: 'import'})"><i class='bx bxs-file-import' ></i> Import</Btn> -->
      </div>
    </div>

    <template v-if="addMode">
      <div class="w-100 d-flex justify-content-center" >

        <div class="add-form-wrapper">
          <form @submit.prevent="false" @click.stop.prevent="false">
            <div class="row" :class="[payload?.id ? 'mt-2' : 'mt-4']">

              <div class="col-12 d-flex justify-content-between align-items-center">
                
                <Tabset v-if="payload?.id" @onTab="(tab) => {
                  editModeTabIndex = tab;
                  if(tab == 2) getStudentPuchLogs();
                }"></Tabset> 

                <label class="using-card-title-in-form" v-if="CONFIG?.settings?.attendance?.status && payload?.id && payload?.name">
                  {{ String(payload?.name).indexOf('Copied') > -1 ? 'This card for guardian' : 'this card for student' }}
                </label>


              </div>


    
                <template v-if="editModeTabIndex == 1">

                  <div class="col-12">
                    <div class="form-group">
                      <label for="email">Class</label>
                      <select v-model="payload.class" class="form-control cb-input" id="ClassId" :disabled="payload.name && payload.name.indexOf('||dakhela') > -1">
                        <option :value="null">-class-</option>
                        <template v-for="(cls, index) in classes" :key="index">
                          <option :value="cls.class_name">{{cls.class_name}}</option>
                        </template>                  
                      </select>
                    </div>
                  </div>
    
                  <div class="col-12">
                    <div class="form-group">
                      <label for="name">Name</label>
                      <input v-model="payload.name" type="text" class="form-control cb-input" :disabled="payload.name && payload.name.indexOf('||dakhela') > -1">
                    </div>
                  </div>
    
                  <div class="col-12">
                    <div class="form-group">
                      <label for="name">Dakhela</label>
                      <input v-model="payload.dakhela" type="number" class="form-control cb-input" :disabled="payload.name && payload.name.indexOf('||dakhela') > -1">
                    </div>
                  </div>
    
                  <div class="col-12">
                    <div class="form-group">
                      <label for="year">Year</label> 
                      <select v-model="payload.year" class="form-control cb-input" :disabled="payload.name && payload.name.indexOf('||dakhela') > -1">
                        <option :value="new Date().getFullYear()">{{ new Date().getFullYear() }}</option>
                        <option :value="new Date().getFullYear() - 1">{{ new Date().getFullYear() - 1 }}</option>
                        <option :value="new Date().getFullYear() - 2">{{ new Date().getFullYear() - 2 }}</option>
                        <option :value="new Date().getFullYear() - 3">{{ new Date().getFullYear() - 3 }}</option>
                      </select>
                    </div>
                  </div>

                  <div class="col-12">
                    <div class="form-group">
                      <label for="name">Note</label>
                      <input v-model="payload.note" type="text" class="form-control cb-input" :disabled="payload.name && payload.name.indexOf('||dakhela') > -1">
                    </div>
                  </div>

                  <div class="col-12" v-if="CONFIG?.card_owners?.length">
                    <div class="form-group d-flex align-items-center gap-3">
                      <label>Card Owner</label>
                      <div class="d-flex gap-2"> 
                        <template v-for="owner in CONFIG?.card_owners">
                          <div @click.stop="payload.card_owner = owner.id" class="d-flex justify-content-start each-owner-name">
                              <span :class="{'checked': payload.card_owner == owner.id}" customized-radio ></span>
                              <label class="cp">{{ owner.name }}</label>
                          </div>  
                        </template>
                      </div>
                    </div>
                  </div>
    
                  <div class="col-12 d-flex justify-content-center">
                    <Btn @click.stop="clearPayload" class="red me-2" >Cancel</Btn>
                    <Btn v-if="!payload.id" @click="addStudent" addStudentAttr class="me-0" >Submit <BtnLoader v-if="is___adding"></BtnLoader> </Btn>
                    <Btn v-else @click="updateStudent" updateStudentAttr class="me-0" v-if="payload.name && payload.name.indexOf('||dakhela') === -1">Update <BtnLoader v-if="is___adding"></BtnLoader> </Btn>
                  </div> 
                </template>


                <template v-else-if="editModeTabIndex == 2"> 
                  <div class="col-12 overflow-y-scroll">
                     <table>
                      <thead>
                        <th>Name</th> 
                        <th>Date</th>
                        <th>Time</th>
                        <th>Before</th>
                      </thead>

                      <tbody>
                        <template v-if="studentLogs?.length">
                          <template v-for="(student, i) in studentLogs">
                            <tr>
                              <td>{{ student?.name }}</td>
                              <td>{{ helper.enToBnDate(moment(student?.punch_exact_time_text).format('DD MMMM, dddd')).replace(/ /g, '&nbsp;') }}</td>
                              <td>{{ helper.enToBnDate(moment(student?.punch_exact_time_text).format('hh:mm:ss&nbsp;A')) }}</td>
                              <td>{{ helper.enToBnDate(moment().diff(student?.punch_exact_time_text, 'days')) }} দিন</td>
                            </tr> 
                          </template>
                        </template>
                        <template v-else> 
                          <tr>
                            <td colspan="44">No log found</td> 
                          </tr>  
                        </template>
                      </tbody>
                     </table>
                  </div> 
                </template> 


            </div>
          </form>
        </div>

      </div>
    </template> 

    <template v-else>
      
      <!-- Search -->
      <div v-if="showSearchForm" class="form-area mt-3 p-4 border radius-10">
        <form @submit.prevent.stop="getStudents">
          <div class="row">
            <div class="col-md-3 col-12">
              <div class="form-group">
                <label for="email">Class</label>
                <select v-model="params.class_name" class="form-control" id="ClassId">
                  <option :value="null">-class-</option>
                  <template v-for="(cls, index) in classes" :key="index">
                    <option :value="cls.class_name">{{cls.class_name}}</option>
                  </template>
                  
                </select>
              </div>
            </div>
            <div class="col-md-3 col-12">
              <div class="form-group">
                <label for="email">Dakhela

                  <span tooltip="All Smillar">
                    <input v-model="only_similler_students" :value="only_similler_students" style="opacity: 0.7;" type="checkbox" @change="()=>{
                      if(params.dakhela){
                        getStudents()
                      }
                    }" >
                  </span>
                </label>
                <input v-model="params.dakhela" type="number" class="form-control">
              </div> 
            </div>
            <!-- <div class="col-md-2 col-12">
              <div class="form-group">
                <label for="email">Card</label>
                <input v-model="params.card_no" type="text" class="form-control">
              </div>
            </div> -->
            <div class="col-md-3 col-12">
              <div class="form-group">
                <label for="name">Name</label>
                <input v-model="params.name" type="text" class="form-control">
              </div>
            </div>
            <div class="col-md-3 col-12">
              <div class="form-group">
                <label for="email">Media</label>
                <select v-model="params.sound1" class="form-control">
                  <option :value="null">-All-</option>
                  <option value="no_sound">No Sound</option> 
                  <option value="has_sound">Has Sound</option> 
                </select>
              </div>
            </div>
            <div class="col-md-12 mt-2">
              <div class="form-group mt-md-3"> 
                  <div class="d-flex">
                    <Btn class="me-1"></Btn> 
                    <Btn @click.stop="clearParams();getStudents();editModeTabIndex=1" class="me-1 red">Clear</Btn> 

                  </div>
                </div>
              </div>
            </div>

            <div class="col-12 mt-4 w-100 all-class-buttons-to-filter-area">
              <div class="all-class-buttons-to-filter">
                <template v-for="cls in classes">
                  <button class="class-short-btn" :class="{'active': params.class_name === cls.class_name}" var="cls?.display_name || cls.class_short" 
                  @click="params.page_no = 1;params.class_name = cls.class_name;getStudents()" >{{ helper.ucfirst(cls?.display_name || cls.class_short) }}</button>
                </template>

              </div>
            </div>
            
           
       
          
        </form>
      </div>
  
  
       <myTable>
          <template #thead>
            <thead>
              <tr>
                <th>{{ CONFIG?.studentTableColumns?.class || 'Class' }}</th>
                <th>{{ CONFIG?.studentTableColumns?.name || 'Name' }}</th>
                <th>{{ CONFIG?.studentTableColumns?.card_owner || 'Card Owner' }}</th>
                <!-- <th>Card</th> -->
                <th>{{ CONFIG?.studentTableColumns?.dakhela || 'Dakhela' }}</th>
                <th>{{ CONFIG?.studentTableColumns?.year || 'Year' }}</th>
                <th>{{ CONFIG?.studentTableColumns?.sound || 'Sound' }}</th>
                <!-- <th>Sound-2</th> -->
                <th>{{ CONFIG?.studentTableColumns?.status || 'Status' }}</th>
                <th>{{ CONFIG?.studentTableColumns?.punch || 'Punch' }}</th>
                <th>{{ CONFIG?.studentTableColumns?.action || 'Action' }}</th> 
              </tr>
            </thead>
          </template>
          <template #rows>
            <template v-if="students?.length">
              <template v-for="(std, i) in students.toReversed()">
                <tr>
                  <td class="text-left"> {{ std.class }} </td> 
                  <td class="text-left cp" @click.stop="prepareToEdit(std)" :student-id="std.id" >{{ std.name.split('||')?.[0] }}</td>
                  <td> 
                    <p class="mb-1">{{ callbacks.getCardOwnerName(std?.card_owner) }}</p>
                    <div class="student-note" tooltip="Note" v-if="std?.note">{{ std?.note }}</div>
                  </td> 
                  <td> 
                    <div class="align-items-center d-flex">
                      <span class="p-1" @dblclick="params.dakhela = std.dakhela">{{ std.dakhela }}</span>
                      <span tooltip="Cone Student">
                      <i v-if="std.name && String(std.name)?.indexOf('||dakhela') > -1 === false" @click.stop="()=>{
                        std.cloneMode = !(!!(std.cloneMode));
                      }" class="bx bxs-copy-alt cp px-1"></i>
                      </span>
                    </div>
                    
                    <template v-if="std?.cloneMode">
                      <div class="std-clone-area">
                        <input type="number" @input="std.dakhela_new = $event.target.value" />
                        <button @click="onClickClone(std)">Copy</button>
                      </div>
                      <p v-if="std?.error_message" class="text-danger">
                        {{ std.error_message }} 
                      </p>
                    </template>
                    
                  </td> 
                  
                  <td> {{ std.year }} </td> 
                  <template v-for="column in ['sound1']">
                    <td> 
                      <!-- Sound -->
                      <template v-if="std[column]">            
                        <template v-if="!std[`isPlaying_${column}`]">            
                          <div class="d-flex align-items-center">
                            <Btn  @click.stop="playThis(i, `isPlaying_${column}`, std); " class="radius-10 sm sound w-100" style="padding: 2px auto;" >
                              <i class='bx bx-play size-1 transformY-3px'></i>&nbsp;Play
                            </Btn>
                            <!-- <span v-if="std.name.indexOf('||dakhela') > -1 === false" class="ms-2 me-1 cp" @click.stop="deleteAudio(std, column)" > -->
                            <span class="ms-2 me-1 cp" @click.stop="deleteAudio(std, column)" >
                              <i class='bx bxs-trash-alt text-danger size-1' ></i>
                            </span>
                          </div> 
                        </template>
                        <template v-else>
                          <Player  :src="std[column]" @close="std[`isPlaying_${column}`] = false"></Player>
                        </template>
                      </template>  
                      <template v-else>
  
                        <div class="d-flex align-items-center">
                          <AudioUpload :student="std" :column="column" @change="({audio_path, audio_url})=>{
                            std[column] = audio_url
                          }" ></AudioUpload>
                          <span tooltip="Rcord Sound" @click="targetStd=std;columnName=column">
                            <i class='bx bxs-microphone p-1 ms-1 cp' ></i>
                          </span>
                        </div>
  
                      </template>  
                    </td> 
                  </template>
                  <td> <Switch size="sm" v-model="std.status" @change="async (status) => {
                    await http.post('/students/update-status', {id: std.id, status} );
                  
                  }"></Switch> </td> 

                  <td>
                    <template v-if="CONFIG?.settings?.attendance?.status">
                      <template v-if="std.name.indexOf('Copied') > -1">
                        <button class="class-short-btn px-2 for-call" 
                        @click.stop="punchToCallStudent(makeCarcode(std), {message: 'কার্ডটি সফলভাবে পাঞ্চ হয়েছে।', source: 'manual_button', for_attendence: false})">
                          <!-- For Guardian -->
                          Call&nbsp;Punch
                        </button>
                      </template> 
                      <template v-else>

                        <div class="d-flex justify-content-start gap-1">
                          <button class="class-short-btn px-2 for-attendence" 
                          @auxclick.stop="punchToSubmitAttendance(makeCarcode(std), {source: 'manual_button', delay: 0})"
                          @click.stop="punchToSubmitAttendance(makeCarcode(std), {source: 'manual_button', delay: 4000})"
                          >
                              <!-- For Students Attendence -->
                              Attendence
                          </button>
                          <!-- For Students Attendence calendar-->
                          <button class="class-short-btn px-2 for-attendence" @click.stop="() => {
                            targetStudent = std; 
                            $refs.dateTimePickerRef.setTime(moment().format('HH:mm'))
                            $refs.dateTimePickerRef.toggle()

                          }" >
                              <i class='bx bxs-calendar'></i> 
                          </button>

                        </div>
                        <ul>
                          <li v-for="shift in helper.getShifts(classes, std.class_short, false)">
                            {{ Ahelper.printShift(shift) }}
                          </li>
                        </ul>
                      </template> 
                    </template> 
                    <template v-else>
                      <button class="class-short-btn px-2" @click.stop="punchToCallStudent(makeCarcode(std), {message: 'কার্ডটি সফলভাবে পাঞ্চ হয়েছে।', source: 'manual_button'})">
                        Punch
                      </button>
                    </template> 
                  </td>
                  <td> 
                    <div class="d-flex justify-content-center action-icons">
                      <!-- <i @click.stop="targetStdForBarcode=std" class='bx bx-barcode cp size-1p5' ></i> -->
                      
                      <!-- <span tooltip="Copy barcode">
                        <i @click="({target}) => helper.copyToClipboard(makeCarcode(std), {el: target.parentElement})" class='bx bxs-copy-alt cp px-1' style="font-size: 18px" ></i>
                      </span> -->
                     
                      <ul>
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
                  <td colspan="88" class="text-center">No student found</td>                 
              </tr>
            </template>
          </template>
       </myTable>
  
       <div class="d-flex justify-content-center">
          <Pagination v-if="params?.totalPages > 1" v-model="params" @jumpToPage="(page) => {
            params.page_no = page
            getStudents()
          }" ></Pagination>
       </div> 
       <div v-if="route.query.barcode" class="d-flex justify-content-center mt-3 ">
          <router-link :to="{name: 'home', query: {barcode: route.query.barcode}}" class="bg1 border2 radius-5 text-center text-black-50" style="width: 200px">Back And Push Barcode</router-link>
       </div> 

    </template>

    
     <!-- Audio Recorder Modal -->
     <template v-if="targetStd && columnName">
      <modal @close="targetStd=null" :title="false">
        <div style="height:100px" class="d-flex justify-content-center align-items-center">

          <AudioRecorAndUpload :student="targetStd" :column="columnName" @uploaded="({audio_path, audio_url})=>{
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

    
     <!-- Barcode Modal View -->
     <template v-if="targetStdForBarcode">
      <modal @close="targetStdForBarcode=null" :title="false">
        <div style="height:220px" class="d-flex justify-content-center align-items-center">
          <div class="d-flex justify-content-center align-items-center flex-column w-100">
              <div id="PRINTABLE_AREA">
                <Barcode :data="makeCarcode(targetStdForBarcode)"  @load="printDiv('PRINTABLE_AREA')"></Barcode>
              </div>
              <div class="d-flex justify-content-center align-items-center mt-3">
                <span class="print-buton cp px-5" @click="printDiv('PRINTABLE_AREA')">
                  <i class='bx bx-printer px-1' style="font-size: 18px" ></i> Print
                </span>        
                <span tooltip="Copy barcode">
                    <i @click="({target}) => helper.copyToClipboard(makeCarcode(targetStdForBarcode), {el: target.parentElement})" class='bx bxs-copy-alt cp px-1' style="font-size: 18px" ></i>
                </span> 
              </div>     
            </div>
        </div>
      </modal>
     </template>


     <EmDateTimePicker ref="dateTimePickerRef"
        v-model="pickerModelValue"
        @change="onChange_dateTimePicker"
        @close="false"
        :displayFormat="'DD MMM, Y'"
        :rangePicker="false" 
        :timePicker="true" 
        :minDate="moment().subtract(1, 'month')"
        :isDisabled="false"
        :autoOpen="false"
        :timePickerButtons="true"
        :use24FormatTimeForEvents="true"
        :invisible="true"
        displayIn="modal" 
        :buttons="{applyBtn: 'Set-Attendace', todayBtn: false}"
        >
    </EmDateTimePicker>

 

</template>

<style>
.print-buton{
  padding: 5px 5px;
  border-radius: 5px;
  background: var(--grad1);
  /* margin-left: 0px 20px; */
}
.add-form-wrapper{
  width: 600px;
  padding: 20px;
  border: 1px solid rgba(255, 255, 255, 0.545);
  margin-top: 70px;
  border-radius: 10px;
  background: var(--grad2);
  box-shadow: 0px 43px 50px #00000061;
}
@media screen and (max-width: 500px) {
  .add-form-wrapper{ 
    margin-top: 20px; 
    width: 100%;
  }
}
.add-form-wrapper .form-group{
  padding-bottom: 20px;
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
.class-short-btn{
  padding: 1px 10px;
  text-align: center;
  background: var(--grad3);
  margin-right: 5px;
  border-radius: 5px;
  color: white;
  margin-bottom: 5px;
  transition: all 0.3s;
  border: 2px solid transparent;
  scale: 1;
  transition: 0.3s all;
}
.class-short-btn.for-call,
.class-short-btn.attendence {
  width: 104px;
}
.class-short-btn.for-call{
  background: #00529e;
}
.class-short-btn.for-attendence{
  background: #009a9e;
}
.class-short-btn:hover{
  box-shadow: 0px 3px 0px rgba(0, 0, 0, 0.126), 0px 6px 4px rgba(0, 0, 0, 0.465);
}
.class-short-btn.active{ 
  border: 2px solid #fa6548;
  box-shadow: 0px 3px 10px rgba(252, 210, 0, 0.881), 0px 6px 4px rgba(0, 0, 0, 0.465), inset 0px 3px 2px rgba(252, 210, 0, 0.881);
  text-shadow: -1px 1px 0px black; 
  /* scale: 1.1; */
  z-index: 1123223;
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
.action-icons > *:not(:last-child){
  margin-right: 8px;
}
.overflow-y-scroll{
  max-height: calc(100vh - 390px);
  overflow-y: auto;
  padding-bottom: 15px;
}
@media (max-width: 500px) {
  .overflow-y-scroll{
    max-height: calc(100vh - 390px);
    overflow-y: auto;
  }
}
[customized-radio]{
  width: 17px;
  height: 17px;
  border-radius: 50%;
  border: 1px solid var(--primaryColor);
  background-color: white;
  cursor: pointer;
  margin-right: 5px;
  transform: translateY(3px);
}
[customized-radio].checked{ 
  border-color: var(--primaryColor);
  background: radial-gradient(circle, var(--primaryColor) 0%, var(--primaryColor) 30%, #e2e2e2 40%, transparent 100%);
}
.each-owner-name{
    padding: 3px 10px;
    background: #f0f0f0;
    border-radius: 32px;
    box-shadow: 0px 3px 0px #0000004f;
}
.student-note{
    width: 100%;
    padding: 1px 5px;
    background-color: #ffffff4f;
    border-radius: 3px;
    font-size: 13px;
}
.using-card-title-in-form{
  padding: 5px 15px; 
  border-radius: 15px;
  background: var(--grad1);
  border-color: var(--primaryColor);
}
</style>

