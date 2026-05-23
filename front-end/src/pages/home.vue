<script setup>
import moment from 'moment/moment'
import { onMounted, inject, ref, watch, computed, onBeforeUnmount, nextTick } from 'vue';
import Note from '../components/note.vue'
import myTable from '../components/myTable.vue'
import Modal from '../components/modal.vue'
import Barcode from '../components/createBarcode.vue'
import Btn from '../components/Btn.vue'
import FileUpload from '../components/FileUpload.vue'
import Switch from '../components/Switch.vue'
import BtnLoader from '../components/BtnLoader.vue'
import BarcodeScannigAnimation from '../components/BarcodeScannigAnimation.vue'
import EmergencyMode from '../components/EmergencyMode.vue'
import PlayingAnimation from '../components/PlayingAnimation.vue'
import SwitchBoard from '../components/SwitchBoard.vue'
import Confirm from '../components/Confirm.vue'
import helper from '../utilities/helper';


 
const route = inject('route');
const router = inject('router');
const emitter = inject('emitter');
const storage = inject('storage');
const http = inject('http');
const playback_speed = inject('playback_speed');
const is_started_schedule = inject('is_started_schedule');
const stop_clear_and_reload = inject('stop_clear_and_reload');
const speakText = inject('speakText');
const callbacks = inject('callbacks');
const getSchedules = inject('getSchedules');
const punchToCallStudent = inject('punchToCallStudent');
const makeCarcode = inject('makeCarcode');
const appUseForbiddened = inject('appUseForbiddened');
const showSwithBoardModal = inject('showSwithBoardModal');
const borad_image_url = inject('borad_image_url');
const CONFIG = inject('CONFIG');
const switches_PreviewInHomePage = inject('switches_PreviewInHomePage');
const isUsingSpeakerAutoControl = inject('isUsingSpeakerAutoControl');
const isSpeakersAutoMode = inject('isSpeakersAutoMode');

let speedList = [
     {label: helper.t('Normal'), value: 1.0},
     {label: helper.t('Medium'), value: 1.25},
     {label: helper.t('Faster'), value: 1.5},
]

const log = console.log

const classes = inject('classes');
const wattingList = inject('wattingList');

let toggleSettings = inject('toggleSettings') 
let refreshDOM = inject('refreshDOM') 
let isIPAccess = inject('isIPAccess') 
let sendRemoteAction = inject('sendRemoteAction') 

let emergency_mode = inject('emergency_mode')
let palylistComponent = inject('palylistComponent')

function toggleEmergencyMode() {
  emergency_mode.value = !emergency_mode.value
  if (isIPAccess) {
    sendRemoteAction({ from: 'ip', action: 'toogle_emergency_mode', data: emergency_mode.value })
  }
}

const barcodePlaceholder = computed(() =>
  emergency_mode.value
    ? helper.t('Emergency mode activated')
    : helper.t('Student ID')
)

const all_students = inject('all_students', [])

let manually_paused_the_playlist = inject('manually_paused_the_playlist')

function handlePayPause(){
     const { currentItem, audio } = palylistComponent.value
     audio.currentTime = 0;
     if(audio.paused){
          audio.play()
          manually_paused_the_playlist.value = false
     } else {
          audio.pause()
          manually_paused_the_playlist.value = true
     }
     
}


function onClickSpeed(item){
     playback_speed.value = item.value
     if(isIPAccess){
          sendRemoteAction({
               from: 'ip',
               action: 'set_playback_speed',
               data: item.value
          })
     }
}

let ttoout
function inputBarcode(event){
     clearTimeout(ttoout)

     if(appUseForbiddened.value === true) return

     ttoout = setTimeout(() => {          
        
          
          let input_value = event.target.value;
          if(!input_value) return

          const is_digits = /^\d{1,}$/.test(input_value)
          if(is_digits){
               let dakhela_number = Number(input_value)
               let student = all_students.value.find(s => s.dakhela === dakhela_number)
               if(student){
                    event.target.value = ''
                    punchToCallStudent(makeCarcode(student))
               } else {
                    emitter.emit('toaster-error', { message: helper.t('No information found for this dakhela') })
               } 
          } else {
               const barcode = input_value
               punchToCallStudent(barcode)
               setTimeout(() => {
                    event.target.value = ''
               }, 300); 
          }
     }, 10);
}
 


 
async function checkSchedule(){   
     if(!is_started_schedule.value){          
          if(confirm(helper.t('Do you want to stop?'))){
               stop_clear_and_reload()
          } else {               
               is_started_schedule.value = true
          } 
                 
     } 

     await nextTick()

     if(isIPAccess){
          sendRemoteAction({
               from: 'ip',
               action: 'toogle_is_started_schedule',
               data: Boolean(is_started_schedule.value),
          })
     }
}

let tab = ref(1)
watch(tab, getSchedules)
watch(toggleSettings, getSchedules)


function originalDakhela({name}){
     if(!name) return false
     let match = name.match(/dakhela::(\d+)/);

     if (match) {
          return match[1]
     } else {
          return false
     }
}

let card_dynamic_width = ref(200)

onMounted(()=>{

     if(route.query.barcode){
          punchToCallStudent(route.query.barcode)
          setTimeout(() => {
               router.push({name: 'home'})
          }, 100);
     }

     emitter.on('document_click', updateStudetCardSize)
     emitter.on('document_resize', updateStudetCardSize)
     emitter.on('document_mousemove', updateStudetCardSize)
})

function updateStudetCardSize(){
     let targetCard = document.getElementById('students_card_container')
     if(targetCard){
          let bound = targetCard.getBoundingClientRect()
          let width = Math.floor(bound.width) 

          const scroolbarWidth = 10 
          
          if(width < 400){
               card_dynamic_width.value = width - 15
          } 
          else if(width < 600){
               card_dynamic_width.value = Math.floor(width / 2) - (scroolbarWidth)
          }
          else if(width < 800){
               card_dynamic_width.value = Math.floor(width / 3) - (scroolbarWidth)
          } 
          else if(width < 1000){
               card_dynamic_width.value = Math.floor(width / 4) - (scroolbarWidth)
          } 
          else if(width < 1200){
               card_dynamic_width.value = Math.floor(width / 5) - (scroolbarWidth)
          } 
          else if(width < 1400){
               card_dynamic_width.value = Math.floor(width / 6) - (scroolbarWidth)
          } 
          else if(width < 1600){
               card_dynamic_width.value = Math.floor(width / 7) - (scroolbarWidth)
          } 
          else if(width < 1800){
               card_dynamic_width.value = Math.floor(width / 8) - (scroolbarWidth)
          } 
          else {
               card_dynamic_width.value = 300
          } 
     }
}
function removeFromWattingList(student, i){
     wattingList.value.splice(i, 1)
     if(isPayingThisCard(student)){
          emitter.emit('stop_playing_and_clear_current_item_and_playnext', true)
     }
}

function isPayingThisCard(student){
     return !student.is_called && student?.dakhela == storage('currentItem').value?.dakhela
}
function isMatchedWithCurrentItem(student){
     return student?.dakhela == storage('currentItem').value?.dakhela
}
function makeAsUncalled(student){
     let status = student.is_called
     student.is_called = false;
     student.is__playing = false;
}

let showRecallConfirmation = ref(false)
function recallAllPunchedStudents(){
     wattingList.value.forEach(makeAsUncalled)
}

</script>

<template>

     <span v-if="refreshDOM" ></span>



     <div class="d-flex align-items-center bttt">
          <!-- <div class="togglerbtn">
               <btn @click="toggleSettings = !toggleSettings" class="px-3 shadow me-2"><i class='bx bx-list-ul'></i></btn>
          </div> -->
          
          <div class="relative w-100 me-2">
               <EmergencyMode v-if="emergency_mode"></EmergencyMode>
               <EmergencyMode v-if="emergency_mode" style="left:calc(100% - 30px)"></EmergencyMode>
               <input id="BARCODE_INPUT" type="text" @keyup.enter="inputBarcode" @paste="inputBarcode" class="form-control px-4 py-2 text-center py-1 cb-input"
               :placeholder="barcodePlaceholder">
          </div>

          <div v-if="is_started_schedule" class="me-2 p-1 px-2 play-pause" 
          :class="{ 'emergency-active': emergency_mode }" 
          @click="toggleEmergencyMode()"
          :tooltip="helper.t('Emergency Mode')" flow="down" style="--tfsize:12px"
           >
               <i class='bx bxs-bell-ring'></i>
          </div>

          <div v-if="!manually_paused_the_playlist" @click="handlePayPause()" class="me-2 p-1 px-2 play-pause"><i class='bx bx-pause'></i></div>
          <div v-else @click="handlePayPause()" class="me-2 p-1 px-2 play-pause"><i class='bx bx-play'></i></div>

          <!-- Add here a button group (Normal & Faster) with icon prefix -->
          <div class="btn-group me-2" role="group">
               <template v-for="item in speedList">
                    <button :tooltip="helper.t('Playback Speed({value})').replace('{value}', item.value)" flow="down" style="--tfsize:12px" type="button" class="btn btn-outline-primary playbackButton" :class="{'active': playback_speed === item.value }" @click="onClickSpeed(item)">
                         {{ item.label }}
                    </button>
               </template>
          </div>

          <div v-if="isUsingSpeakerAutoControl" class="me-2 p-1 position-relative" @click.stop="showSwithBoardModal = !showSwithBoardModal">
               <img :src="borad_image_url" alt="" class="board-image">
               <span class="manual-mode" v-if="!isSpeakersAutoMode">{{ helper.t('manual') }}</span>
          </div> 
         
          <BarcodeScannigAnimation v-if="is_started_schedule" :scannig="is_started_schedule" class="me-1"  ></BarcodeScannigAnimation> 
          <Switch v-model="is_started_schedule" @click="checkSchedule" size="lg" :yes="helper.t('Started')" :no="helper.t('Stopped')" :bothVisible="false" class="me-2" ></Switch>
     </div>

     



     <div class="sections mt-3">
          <div class="single-section class-list " v-if="toggleSettings">
               <div class="tab-view" >
                    <div :class="{'active': tab==1}" @click="tab=1">{{ helper.t('Punch') }}</div>
                    <div :class="{'active': tab==2}" @click="tab=2">{{ helper.t('Call') }}</div>
               </div>
               <div class="inner-list">
                    <ul>
                         
                         <template v-if="tab==1">
                              <template v-if="callbacks.running_punch_schedules().length">
                                   <template v-for="(item, i) in callbacks.running_punch_schedules()">
                                        <li class="mb-2" >                    
                                             <h3> 
                                                  {{ helper.ucfirst(item?.title) }}
                                             </h3>
                                             <p class="time-duration"> 
                                                  {{ helper.formatTime(item.start_time) }} - {{ helper.formatTime(item.end_time) }}
                                             </p>
                                             <div class="d-flex flex-wrap">
                                                  <p class="m-1 p-1 border3 radius-5" v-for="cls in item.classes">{{ helper.ucfirst(cls.display_name) }}</p>
                                             </div>                                    
                                        </li>

                                   </template>
                              </template>
                              <!-- Incomming puch -->
                              <template v-if="callbacks.incoming_punch_schedules().length">                                    
                                   <h4 class="p-2 border3 radius-5 my-2 shadow me-1" style="background:var(--grad1)">{{ helper.t('Incoming punch...') }}</h4>
                                   <template v-for="item in callbacks.incoming_punch_schedules()">
                                        <li class="mb-2" >                    
                                             <h4 class="mb-1"> 
                                                  {{ helper.ucfirst(item?.title) }}  <kbd v-if="item.incoming_time" > {{ helper.ms_to_hour_minute(item.incoming_time) }} </kbd>
                                             </h4>
                                             <p class="time-duration"> 
                                                  {{ helper.formatTime(item.start_time) }} - {{ helper.formatTime(item.end_time) }}
                                             </p>
                                             <div class="d-flex flex-wrap mb-3">
                                                  <span class="m-1 classes-left w-100">
                                                       <span v-for="cls in item.classes">
                                                            {{ helper.ucfirst(cls.display_name) }}
                                                       </span>
                                                  </span>
                                             </div> 
                                        </li>
                                   </template> 
                              </template>
                              <!-- Times up puch -->
                              <template v-if="true">
                                  <h4 v-if="callbacks.timesup_punch_schedules()?.length" class="p-2 border3 radius-5 my-2 shadow me-1" style="background:var(--grad1)">{{ helper.t('Times Up') }}</h4>
                                  <template v-for="item in callbacks.timesup_punch_schedules()">
                                         <li class="mb-2" >                    
                                              <h4 class="mb-1"> 
                                                  {{ helper.ucfirst(item?.title) }}
                                              </h4>
                                              <p class="time-duration"> 
                                                   {{ helper.formatTime(item.start_time) }} - {{ helper.formatTime(item.end_time) }}
                                              </p>  
                                         </li>
                                    </template>
                              </template>
                         </template>
                         <template v-else-if="tab==2">
                              <template v-if="callbacks.running_call_schedules().length">
                                   <!-- running call scheduls -->
                                   <template v-for="(item, i) in callbacks.running_call_schedules()">
                                        <li class="mb-2" >                    
                                             <h3 class="mb-1"> 
                                                  {{ helper.ucfirst(item?.title) }}
                                             </h3>
                                             <p class="time-duration"> 
                                                  {{ helper.formatTime(item.start_time) }} - {{ helper.formatTime(item.end_time) }}
                                             </p>
                                             <div class="d-flex flex-wrap">
                                                  <span class="m-1 classes-left w-100" >
                                                       <span v-for="cls in item.classes">
                                                            {{ helper.ucfirst(cls.display_name) }}
                                                       </span>
                                                  </span>
                                             </div>   
                                                                              
                                        </li>
                                        
                                   </template>
                              </template>
                              <!-- Incomming call -->
                              <template v-if="callbacks.incoming_call_schedules().length">
                                   <h4 class="p-2 border3 radius-5 my-2 shadow me-1" style="background:var(--grad1)">{{ helper.t('Incoming call...') }}</h4>
                                   <template v-for="item in callbacks.incoming_call_schedules()">
                                        <li class="mb-0" >                    
                                             <h4> 
                                                  {{ helper.ucfirst(item?.title) }}  <kbd v-if="item.incoming_time" > {{ helper.ms_to_hour_minute(item.incoming_time) }} </kbd>
                                             </h4>
                                             <p class="time-duration"> 
                                                  {{ helper.formatTime(item.start_time) }} - {{ helper.formatTime(item.end_time) }}
                                             </p>
                                             <div class="d-flex flex-wrap mb-3" v-show="!item?.__hideClasses">
                                                  <span class="m-1 classes-left w-100" >
                                                       <span v-for="cls in item.classes">
                                                            {{ helper.ucfirst(cls.display_name) }}
                                                       </span>
                                                  </span>
                                             </div> 
                                        </li>
                                         <!-- <li class="text-center text-black-50">No schedule at now</li> -->
                                    </template>
                              </template>
                               <!-- Times up puch -->
                               <template v-if="true">
                                   <h4 v-if="callbacks.timesup_call_schedules()?.length" class="p-2 border3 radius-5 my-2 shadow me-1" style="background:var(--grad1)">{{ helper.t('Times Up') }}</h4>
                                  <template v-for="item in callbacks.timesup_call_schedules()">
                                         <li class="mb-2" >                    
                                              <h4 class="mb-1"> 
                                                   {{ helper.ucfirst(item?.title) }} 
                                              </h4>
                                              <p class="time-duration"> 
                                                   {{ helper.formatTime(item.start_time) }} - {{ helper.formatTime(item.end_time) }}
                                              </p> 
                                         </li>
                                    </template>
                              </template>
                         </template>
                    </ul>
               </div>
          </div>


          <div class="single-section watting-list relative">
               <div class="header-and-tools">
                    <h4 class="header-title"> {{ helper.t('Puch Board') }} </h4>
                    <div class="right-section" v-if="wattingList?.length">
                         <span class="outlined" >{{ helper.t('Waitting:') }} {{ wattingList.filter(student => !student.is_called).length }}/{{ wattingList.length }}</span>
                         <span class="outlined" >{{ helper.t('Completed:') }} {{ wattingList.filter(student => student.is_called).length }}/{{ wattingList.length }}</span>
                         <button class="action-button" @click.stop="showRecallConfirmation = true" ><i class='bx bxs-speaker transformY-1px' ></i> {{ helper.t('Recall All') }}</button>
                    </div> 
               </div>
               <div class="set-max-height" id="students_card_container">
                    <div v-if="wattingList?.length">
                         <template v-for="(student, i) in wattingList" :key="i"> 
                              <div class="student-box" :class="{'is_called': student.is_called}" 
                              :style="`--std-card-width:${card_dynamic_width}px`"
                              :barcode="student?.barcode" :card-id="student.id" :playing="isPayingThisCard(student)" >
                                   <div class="card-content" :class="{ 'bg_animation': student?.isPlaying }" >
                                        <!-- Student name -->
                                        <div class="student-name cp d-flex" @click="()=>{
                                             router.push({name: 'students', query: {
                                                  dakhela: student.dakhela,
                                                  barcode,
                                             }})
                                        }">
                                             {{ student.name.split('||')?.[0] }} 
                                             <!-- <i class='bx bx-filter transformY-3px cp'></i> -->
                                        </div>
                                        <div class="class-name">
                                             {{ student.class }} <span>[{{ student.dakhela }}]{{ originalDakhela(student) ? `[main:${originalDakhela(student)}]` : '' }} </span>
                                        </div> 
                                        <div class="class-name panch-time mt-1 cp" @click="log({student, currentItem: storage('currentItem').value}) ">
                                             <div class="d-flex justify-content-between align-items-center" @click.stop="()=>{ router.push({name: 'students', query: { dakhela: student.dakhela, barcode, log: true }}) }" >
                                                  <label :tooltip="!student?.call_slot ? '' : 'Punched: ' + moment(student.punch_exact_time_text).format('hh:mm:ss A')" class="cp"> 
                                                       <span v-if="!student?.call_slot && student?.emergency_mode " class="text-danger">{{ helper.t('Emergency Call') }}</span>
                                                       <span v-else v-html="student?.call_slot"></span>
                                                        
                                                  </label>
                                             </div>
                                        </div>

                                        <div v-if="callbacks.getCardOwnerName(student.card_owner) && CONFIG.card_not_set_message" class="class-name panch-time mt-1 cp d-flex justify-content-between" tooltip="Card Owner">
                                             <label v-if="student.card_owner"> <i class='bx bxs-id-card fs-5 transformY-4px'></i> {{ callbacks.getCardOwnerName(student.card_owner) }} </label> 
                                             <label v-else> <i class='bx bxs-id-card fs-5 transformY-4px'></i> {{ CONFIG.card_not_set_message }} </label> 
                                             <PlayingAnimation v-if="!student?.sound1_haserror && isPayingThisCard(student)"></PlayingAnimation>
                                        </div>
                                       
                                        <div v-if="student?.sound1_haserror" class="class-name panch-time mt-1 cp" @click="()=>{
                                                       router.push({name: 'students', query: {
                                                            dakhela: student.dakhela,
                                                            barcode,
                                                       }})
                                                  }">
                                             <div class="d-flex justify-content-between align-items-center" >
                                                  <label class="cp text-danger">
                                                       এই অডিওটি পুনরায় রেকর্ড করুন!
                                                  </label>
                                                  <button class="click-here">{{ helper.t('Click Here') }}</button>
                                             </div>
                                        </div>
                                   <div class="icons"> 
                                        <span class="header-span-item" @click.stop="student.is_called ? makeAsUncalled(student) : () => {}"
                                        :class="{
                                             'cp': student.is_called && !student?.sound1_haserror,
                                             'waitting': !student.is_called && !student?.sound1_haserror,
                                             'completed': student.is_called && !student?.sound1_haserror,
                                             'calling': !manually_paused_the_playlist && isPayingThisCard(student) && !student?.sound1_haserror,
                                             'paused': !student.is_called && manually_paused_the_playlist && isMatchedWithCurrentItem(student) && !student?.sound1_haserror,
                                             'has-error': student?.sound1_haserror,
                                        }">
                                             <i v-if="student.is_called && !student?.sound1_haserror" class='bx bx-sync size-09 transformY-2px' ></i>
                                             {{ student?.sound1_haserror ? helper.t('Error') : (!student.is_called ? (isPayingThisCard(student) ? (manually_paused_the_playlist ? helper.t('Paused') : helper.t('Calling...')) : 'Waitting') : 'Completed') }}
                                        </span>
                                        <span v-if="student?.total_punch > 1" class='header-span-item comp'>{{ helper.t('Punched:') }} {{ student?.total_punch }}</span>
                                   </div>
                                   <span @click="removeFromWattingList(student, i)" class="card-canceller">
                                             <i class='bx bx-x'></i>
                                   </span>
                                   </div>
                              </div> 
                         </template>
                    </div>
                    <div v-else>
                         <div class="p-5 text-muted w-100 radius-5" style="border: 1px solid #949494;height:">
                              <h5 class="text-center">{{ helper.t('Punch Board is Empty') }}</h5>
                         </div>
                    </div>
               </div>
          </div>
          <div v-if="switches_PreviewInHomePage" class="single-section right-sections">
               <div class="set-max-height">
                    <div class="switching-display-area">
                         <SwitchBoard viewType="home" :chunkSize="4"></SwitchBoard>
                    </div>
               </div>
          </div>
     </div>


     <Confirm v-model="showRecallConfirmation" @yes="recallAllPunchedStudents()" >
          সকল শিক্ষার্থীদের পুনরায় ডাকতে চান ?
     </Confirm>



 
     

</template>


<style>
.play-pause{
     border: 1px solid var(--primaryColor);
    color: rgb(255, 255, 255);
    background: var(--grad3);
    border-radius: 5px;
    font-size: 18px;
    cursor: pointer;
}
.play-pause.emergency-active {
  background: #dc3545;
  border-color: #dc3545;
  animation: emergency-pulse 1s infinite;
}
@keyframes emergency-pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.6; }
}
.sections {
  display: flex;
  gap: 20px;
  /* justify-content: space-between; */
}
.sections > .single-section {
  height: calc(100vh - 163px);
  border-radius: 10px;
  padding: 15px;
  background-color: rgba(255, 255, 255, 0.382);
}
.class-list {
  width: 300px;
  /* margin-right: 20px; */
}
.class-list .inner-list {
  height: calc(100% - 80px);
  overflow-y: auto;
}
.class-list .inner-list ul {
  overflow-y: auto;
}
.watting-list {
  padding: 15px;
  width: 100%;
}
.watting-list .header-and-tools{  
     display: flex;
    /* flex-wrap: wrap; */
    justify-content: space-between;
    /* align-items: center; */
    width: 100%;
    padding: 0 0 8px;
    border-bottom: 1px solid #f1f1f1e1;
    box-shadow: 0 1px #0004;
    min-height: 40px;
    max-height: 42px;
    margin-bottom: 20px;
    overflow-x: auto;
}
.watting-list .header-and-tools .right-section{  
  display: flex;
  flex-wrap: wrap;  
  justify-content: flex-end; 
  overflow-x: auto;
  align-items: center;
  gap: 10px;
}
.watting-list .header-and-tools .right-section .outlined{  
  padding: 3px 10px;
  color: var(--primaryColor);
  border: 1px solid var(--primaryColor);
  background: #f1f1f1;
  border-radius: 4px; 
  opacity: 0.8;
  font-size: 14px;
}
.watting-list .header-and-tools .right-section .action-button{  
     padding: 3px 10px;
     border: 1px solid var(--primaryColor);
     background: var(--primaryColor);
     color: white;
     border-radius: 4px;  
     font-size: 14px;
} 
.watting-list .set-max-height {
     max-height: calc(100% - 60px);
     width: 100%;
     overflow-y: auto;
     padding-right: 5px;
}
.watting-list .set-max-height > div {
  max-height: 100%;
  width: 100%;
  display: flex;
  justify-content: flex-start;
  flex-direction: row;
  flex-wrap: wrap;
  overflow-y: auto;
  /* column-gap: 15px; */
  column-gap: 10px;
  row-gap: 10px;
}
.watting-list .set-max-height div .student-box {
     --call-done: linear-gradient(0deg, #2fe9df00 0%, #9c9cec00 100%); 
}



.watting-list .set-max-height div .student-box {
  position: relative; 
  width: var(--std-card-width, 200px);
  min-height: 90px;
  border: 1px solid rgb(7, 109, 146);
  background: var(--call-done); 
  border-radius: 5px;
}
.watting-list .set-max-height div .student-box.is_called {
  opacity: 0.7;
}
.watting-list .set-max-height div .student-box .icons {
  position: absolute;
  width: 100%;
  height: 20px;
  right: 0px;
  top: 4px; 
  padding-left: 12px;
  display: flex; 
  justify-content: start;
  gap: 6px;
}
.watting-list .set-max-height div .student-box > div{
  padding: 15px; 
}

.watting-list .set-max-height div .student-box .card-content{
     padding-top: 25px;
}
.watting-list .set-max-height div .student-box .student-name,
.watting-list .set-max-height div .student-box .class-name{
  width: 100%;
}
.watting-list .set-max-height div .student-box .student-name{
  font-weight: bold;
  color: #333;
}
.watting-list .set-max-height div .student-box .student-name:hover{
     color: var(--primaryColor);
     text-decoration: underline;
}
.watting-list .set-max-height div .student-box .class-name{
     background-color: rgb(255 255 255 / 30%);
    border-radius: 5px;
    border: 1px solid #ffffff36;
    padding: 0px 10px;
    font-size: 14px;
}
.tab-view{
     display: flex;
     justify-content: space-between;
     margin-bottom: 15px;
}
.tab-view div{
     background: rgba(255, 255, 255, 0.146);
    border-radius: 0px;
    cursor: pointer;
    padding: 12px;
    width: 50%;
    border-bottom: 2px transparent;
    text-align: center;
}
.tab-view div:first-child{
     border-top-left-radius: 5px;
}
.tab-view div:last-child{
     border-top-right-radius: 5px;
}
.tab-view div.active{
     background: rgba(255, 255, 255, 0.495);
     border-bottom: 2px solid white;
     
}

@media screen and (max-width: 450px) {
     .sections {
          flex-direction: column;
     }
     .togglerbtn{
          position: fixed;
          top: 10px;
          right: 10px;
          z-index: 99999; 
     }
     .togglerbtn > button,
     .togglerbtn > button:active,
     .togglerbtn > button:active:focus
     { 
          background: var(--grad3) !important;
          color: rgb(255, 255, 255);
     }
     .bttt{
          flex-wrap: wrap;
     }
     .bttt > *{
          margin-bottom: 5px;
     }
}
.card-canceller{
     position: absolute;
     top: -1px;
     right: -1px;
     background: #da4646;
     color: #fff;
     padding: 0 4px;
     border-bottom-left-radius: 9px;
     cursor: pointer;
     opacity: 0;
     transition: all .3s;
     border-top-right-radius: 4px; 
}
.student-box:hover .card-canceller{
     opacity: 1;
}
.header-span-item{ 
     padding-left: 4px;
     border-radius: 2px;
     font-size: 11px; 
     color: #333;
     margin-top: 1px;
}
.header-span-item.calling,
.header-span-item.paused,
.header-span-item.waitting,
.header-span-item.completed,
.header-span-item.has-error{
     padding: 0px 8px;
     border-radius: 25px;
     padding-top: 1px;
     color: black;
}
.header-span-item.waitting{ 
     background-color: yellow; 
}
.header-span-item.completed{ 
     color: #ffffff;
     background-color: rgb(7, 165, 39); 
}
.header-span-item.calling{ 
     color: #ffffff;
     background-color: rgb(233, 5, 191); 
}
.header-span-item.paused{ 
     color: #ffffff;
     background-color: rgb(233, 96, 5); 
}
.header-span-item.has-error{ 
     color: #ffffff;
     background-color: rgb(233, 39, 5); 
}
.manual-mode{
     position: absolute;
     width: 100%;
     height: 16px;
     background-color: #ff0000f7;
     font-size: 10px;
     color: #ffffff;
     z-index: 2;
     bottom: 0;
     left: 0;
     text-align: center;
     border-radius: 8px;
     pointer-events: none;
}
.switching-display-area{
     max-height: calc(100vh - 198px);
     overflow-y: auto;
}
.click-here{
     background: #da4646;
     color: #fff;
     padding: 3px 4px; 
     border-radius: 6px;
     cursor: pointer;
     opacity: 1;
     font-size: 10px;
     border: none;
}
.time-duration{
     margin-bottom: 0;
     border: 1px solid #999999;
     padding: 2px 5px;
     border-radius: 5px;
     margin-right: 5px;
     background-color: #c9c9c9;
}
.classes-left{
     display: flex;
     flex-direction: column;
     gap: 5px;
     max-height: 210px;
     overflow-y: auto;
     padding-right: 5px;
}
.classes-left > span{
     border-bottom: 1px solid #999999;
}
.playbackButton{
     background: rgb(255, 255, 255);
     color: black;
     border-color: var(--primaryColor);
}
.playbackButton:hover,
.playbackButton.active
{
     color: white;
     background: var(--grad3);
     border-color: var(--primaryColor);
}
</style>
