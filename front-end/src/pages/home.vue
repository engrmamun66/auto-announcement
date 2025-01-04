<script setup>
import { onMounted, inject, ref, watch, computed } from 'vue';
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
import helper from '../utilities/helper';


 
const emitter = inject('emitter');
const storage = inject('storage');
const http = inject('http');
const is_started_schedule = inject('is_started_schedule');
const stop_clear_and_reload = inject('stop_clear_and_reload');
const speakText = inject('speakText');
const callbacks = inject('callbacks');
const getSchedules = inject('getSchedules');

const classes = inject('classes');
const wattingList = inject('wattingList');

let toggleSettings = inject('toggleSettings') 
let refreshDOM = inject('refreshDOM') 

let emergency_mode = inject('emergency_mode')




let ttoout
function inputBarcode(event){
     clearTimeout(ttoout)

     ttoout = setTimeout(() => {          
        
          if(!is_started_schedule.value){
               emitter.emit('toaster-error', { message: 'Schedule not started'})
               return
          }
          let barcode = event.target.value;
          if(barcode){
               checkAndList(barcode)
               setTimeout(() => {
                    event.target.value = ''
               }, 300);
          }
     }, 10);
}

/**
 * 
 * student['is_called']
 */

function checkAndList(barcode='play-417-2024'){
     try {
          if(barcode == 'i' || barcode == 'I'){
               emergency_mode.value = !emergency_mode.value
               return
          }

          if(!emergency_mode.value){
               if(!(/^[a-z_0-9]+-\d{1,}-sound(1|2|3)/gi.test(barcode))){
                    emitter.emit('toaster-error', { message: 'Barcode is not valid', duration: 5000})
                    return
               }
          }


          let [ class_short ] = barcode.split('-') // nursary-23-sound1-2024

                    
          if(!emergency_mode.value){
               let isAllowed = callbacks.isMatchedAnySchedule(class_short)
             
               if(!isAllowed){
                    emitter.emit('toaster-error', { message: 'Not matched with any punch schedule'})
                    return
               }
               let targetClass = classes.value.filter(cls => cls.class_short == class_short)?.[0];
               if(!targetClass?.isActive){
                    emitter.emit('toaster-error', { message: 'This class is inactive now'})
                    return
               }
          }




          http.get('/single-student', { params: { barcode } }).then(response => {
               if(response.status == 200){
                    let student = response.data.data;
                    student['barcode'] = barcode;
                    student['puch_exact_time'] = helper.miliseconds();

                    let findLast = wattingList.value.findLast(s => s.id == student.id)
                    let findLastIndex = wattingList.value.findLastIndex(s => s.id == student.id)
                  

                   
                    if(!student[student['soundColName']]){
                         emitter.emit('toaster-error', { message: `Sound not added for this student. <i><a href="http://localhost:3006/#/students?dakhela=${student.dakhela}" target="_blank" >Add</a></i>`, duration: 10000})
                         speakText(student.name + ', her voice is not added yet')
                    }

                   


                    
                    student['emergency_mode'] = emergency_mode.value
                    
                    if(!emergency_mode.value){
                         const { running_call_schedules, incoming_call_schedules  } = callbacks
                         let rs = running_call_schedules()
                         let is = incoming_call_schedules()
                         
                         if(rs.length){
                              student['start_ms'] = rs[0].start_ms
                              student['end_ms'] = rs[0].end_ms
                         } else {
                              student['start_ms'] = is[0].start_ms
                              student['end_ms'] = is[0].end_ms
                         } 

                         // ----
                         if(!findLast){
                              wattingList.value.push(student)
                              emitter.emit('pushed_a_student__or__rechecktoPlay', student)
                         }
                         else if(findLast && findLast?.is_called){
                              wattingList.value.splice(findLastIndex, 0, student)
                              emitter.emit('pushed_a_student__or__rechecktoPlay', student)
                         } else if (findLast) {
                              let studentCard = document.querySelector(`[barcode="${barcode}"]`)
                              if(studentCard){
                                   studentCard.classList.add('bx-fade-down')
                                   setTimeout(() => {
                                        studentCard.classList.remove('bx-fade-down')
                                        
                                   }, 2000);
                              }
                              emitter.emit('toaster-warning', { message: 'Already added in here'})
                         }
                    } else {
                         student['start_ms'] = helper.miliseconds() - 1000
                         student['end_ms'] = helper.miliseconds() + (10 * 1000)
                         wattingList.value.unshift(student)                        
                    } 

                    storage('wattingList').value = wattingList.value;
               }
          })
     } catch (error) {
          console.warn('checkAndList_error::', error);
     }
}

 
function checkSchedule(){   
     if(!is_started_schedule.value){          
          if(confirm('You want to stop?')){
               stop_clear_and_reload()
          } else {               
               is_started_schedule.value = true
          } 
                 
     } 
}

let tab = ref(1)
watch(tab, getSchedules)
watch(toggleSettings, getSchedules)

</script>

<template>

     <span v-if="refreshDOM" ></span>



     <div class="d-flex align-items-center bttt">
          <div class="togglerbtn">
               <btn @click="toggleSettings = !toggleSettings" class="px-3 shadow me-2"><i class='bx bx-list-ul'></i></btn>
          </div>
          
          <div class="relative w-100 me-2">
               <EmergencyMode v-if="emergency_mode"></EmergencyMode>
               <input id="BARCODE_INPUT" type="text" @keyup.enter="inputBarcode" class="form-control px-4 py-2 text-center py-1 shadow" placeholder="Barcode receiver field">
          </div>
         
          <BarcodeScannigAnimation v-if="is_started_schedule" :scannig="is_started_schedule" class="me-1"  ></BarcodeScannigAnimation> 
          <Switch v-model="is_started_schedule" @click="checkSchedule" size="lg" yes="Started" no="Stopped" :bothVisible="false" class="me-2" ></Switch> 
     </div>

     



     <div class="sections mt-3">
          <div class="class-list" v-if="toggleSettings">
               <div class="inner-list">
                    <div class="tab-view" >
                         <div :class="{'active': tab==1}" @click="tab=1">Punch</div>
                         <div :class="{'active': tab==2}" @click="tab=2">Call</div>
                    </div>
                    <ul>
                         
                         <template v-if="tab==1">
                              <template v-if="callbacks.running_punch_schedules().length">
                                   <template v-for="(item, i) in callbacks.running_punch_schedules()">
                                        <li class="mb-2" >                    
                                             <h3> 
                                                  {{ item.title }}  
                                             </h3>
                                             <p> 
                                                  {{ helper.formatTime(item.start_time) }} - {{ helper.formatTime(item.end_time) }}
                                             </p>
                                        <div class="d-flex flex-wrap">
                                             <p class="m-1 p-1 border3 radius-5" v-for="cls in item.classes">{{ cls.class_short }}</p>
                                        </div>                                    
                                        </li>

                                   </template>
                              </template>
                              <!-- Incomming puch -->
                              <template v-if="callbacks.incoming_punch_schedules().length">                                    
                                   <h4 class="p-2 border3 radius-5 my-2 shadow me-1" style="background:var(--grad1)">Incoming...</h4>
                                   <template v-for="item in callbacks.incoming_punch_schedules()">
                                        <li class="mb-0" >                    
                                             <h4> 
                                                  {{ item?.title }}  <kbd> {{ helper.ms_to_hour_minute(item.incoming_time) }} </kbd>
                                             </h4>
                                             <p> 
                                                  {{ helper.formatTime(item.start_time) }} - {{ helper.formatTime(item.end_time) }}
                                             </p>
                                             <!-- <div class="d-flex flex-wrap">
                                                  <p class="m-1 p-1 border3 radius-5" v-for="cls in item.classes">{{ cls.class_short }}</p>
                                             </div>                                     -->
                                        </li>
                                        <!-- <li class="text-center text-black-50">No schedule at now</li> -->
                                   </template> 
                              </template>
                              <!-- Times up puch -->
                              <template v-if="true">
                                  <h4 v-if="callbacks.timesup_punch_schedules()?.length" class="p-2 border3 radius-5 my-2 shadow me-1" style="background:var(--grad1)">Times Up</h4>
                                  <template v-for="item in callbacks.timesup_punch_schedules()">
                                         <li class="mb-0" >                    
                                              <h4> 
                                                   {{ item?.title }} 
                                              </h4>
                                              <p> 
                                                   {{ helper.formatTime(item.start_time) }} - {{ helper.formatTime(item.end_time) }}
                                              </p>
                                              <!-- <div class="d-flex flex-wrap">
                                                   <p class="m-1 p-1 border3 radius-5" v-for="cls in item.classes">{{ cls.class_short }}</p>
                                              </div>                                     -->
                                         </li>
                                         <!-- <li class="text-center text-black-50">No schedule at now</li> -->
                                    </template>
                              </template>
                         </template>
                         <template v-else-if="tab==2">
                              <template v-if="callbacks.running_call_schedules().length">
                                   <!-- running call scheduls -->
                                   <template v-for="(item, i) in callbacks.running_call_schedules()">
                                        <li class="mb-2" >                    
                                             <h3> 
                                                  {{ item.title }}
                                             </h3>
                                             <p> 
                                                  {{ helper.formatTime(item.start_time) }} - {{ helper.formatTime(item.end_time) }}
                                             </p>
                                             <div class="d-flex flex-wrap">
                                                  <p class="m-1 p-1 border3 radius-5" v-for="cls in item.classes">{{ cls.class_short }}</p>
                                             </div>                                    
                                        </li>
                                        
                                   </template>
                              </template>
                              <!-- Incomming call -->
                              <template v-if="callbacks.incoming_call_schedules().length">
                                   <h4 class="p-2 border3 radius-5 my-2 shadow me-1" style="background:var(--grad1)">Incoming...</h4>
                                   <template v-for="item in callbacks.incoming_call_schedules()">
                                         <li class="mb-0" >                    
                                              <h4> 
                                                   {{ item?.title }}  <kbd> {{ helper.ms_to_hour_minute(item.incoming_time) }} </kbd>
                                              </h4>
                                              <p> 
                                                   {{ helper.formatTime(item.start_time) }} - {{ helper.formatTime(item.end_time) }}
                                              </p>
                                              <!-- <div class="d-flex flex-wrap">
                                                   <p class="m-1 p-1 border3 radius-5" v-for="cls in item.classes">{{ cls.class_short }}</p>
                                              </div>                                     -->
                                         </li>
                                         <!-- <li class="text-center text-black-50">No schedule at now</li> -->
                                    </template>
                              </template>
                               <!-- Times up puch -->
                               <template v-if="true">
                                  <h3 v-if="callbacks.timesup_call_schedules()?.length" class="p-2 border3 radius-5 my-2 shadow me-1" style="background:var(--grad1)">Times Up</h3>
                                  <template v-for="item in callbacks.timesup_punch_schedules()">
                                         <li class="mb-0" >                    
                                              <h4> 
                                                   {{ item?.title }} 
                                              </h4>
                                              <p> 
                                                   {{ helper.formatTime(item.start_time) }} - {{ helper.formatTime(item.end_time) }}
                                              </p>
                                              <!-- <div class="d-flex flex-wrap">
                                                   <p class="m-1 p-1 border3 radius-5" v-for="cls in item.classes">{{ cls.class_short }}</p>
                                              </div>                                     -->
                                         </li>
                                         <!-- <li class="text-center text-black-50">No schedule at now</li> -->
                                    </template>
                              </template>
                         </template>
                    </ul>
               </div>
          </div>
          <div class="watting-list">
               <div class="set-max-height">
                    <div>
                         <template v-for="(student, i) in wattingList" :key="i"> 
                              <div class="student-box" :class="{'is_called': student.is_called}" :barcode="student?.barcode" >
                                   <div :class="{ 'bg_animation': student?.isPlaying }">
                                        <div class="student-name">{{ student.name }}</div>
                                        <div class="class-name">
                                             {{ student.class }} [{{ student.dakhela }}]
                                        </div>
                                       <div class="icons"> 
                                             <i v-if="!student.is_called" class='bx bx-check'></i>
                                             <i v-else-if="student.is_called" class='bx bx-check-double' ></i> 
                                             <i v-else class='bx bx-checkbox-square' ></i> 
                                       </div>
                                   </div>
                              </div> 
                         </template>
                    </div>
               </div>
          </div>
     </div>



 
     

</template>


<style>
.sections {
  display: flex;
  justify-content: space-between;
}
.sections > div {
  height: calc(100vh - 163px);
  border-radius: 10px;
  padding: 15px;
  background-color: rgba(255, 255, 255, 0.382);
}
.class-list {
  width: 300px;
  margin-right: 20px;
}
.class-list .inner-list {
  height: calc(100% - 20px);
  overflow-y: auto;
}
.class-list .inner-list ul {
  overflow-y: auto;
}
.watting-list {
  padding: 15px;
  width: 100%;
  display: flex;
  flex-wrap: wrap; /* Wraps to the next column */
  gap: 1rem; /* Spacing between columns */
}
.watting-list .set-max-height {
  max-height: calc(100% - 20px);
  width: 100%;

  /* overflow-y: auto; */
}
.watting-list .set-max-height div {
  max-height: 100%;
  width: 100%;
  display: flex;
  justify-content: flex-start;
  flex-direction: row;
  flex-wrap: wrap;
  overflow-y: auto;
}
.watting-list .set-max-height div .student-box {
     --call-done: linear-gradient(0deg, #2fe9df00 0%, #9c9cec00 100%); 
     --waiting-for-call: linear-gradient(0deg, #2fe9df00 0%, #22ca22b8 100%);
     --calling: linear-gradient(0deg, #2fe9df00 0%, #09d21ebb 100%);
}



.watting-list .set-max-height div .student-box {
  position: relative;
  margin-bottom: 15px;
  margin-right: 15px;
  width: 200px;
  min-height: 90px;
  border: 1px solid rgb(7, 109, 146);
  background: var(--waiting-for-call);
  background: var(--calling); 
  background: var(--call-done); 
  border-radius: 5px;
}
.watting-list .set-max-height div .student-box.is_called {
  opacity: 0.5;
}
.watting-list .set-max-height div .student-box .icons {
  position: absolute;
  width: 100%;
  height: 20px;
  right: 0px;
  top: 0px; 
  padding-left: 12px;
  display: flex; 
}
.watting-list .set-max-height div .student-box > div{
  padding: 15px; 
}

.watting-list .set-max-height div .student-box .student-name,
.watting-list .set-max-height div .student-box .class-name{
  width: 100%;
}
.watting-list .set-max-height div .student-box .student-name{
  font-weight: bold;
  color: #333;
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
          background: var(--grad1) !important;
          color: black;
     }
     .bttt{
          flex-wrap: wrap;
     }
     .bttt > *{
          margin-bottom: 5px;
     }
}
</style>
