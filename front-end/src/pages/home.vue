<script setup>
import { onMounted, inject, ref, watch } from 'vue';
import Note from '../components/note.vue'
import myTable from '../components/myTable.vue'
import Modal from '../components/modal.vue'
import Barcode from '../components/createBarcode.vue'
import Btn from '../components/Btn.vue'
import FileUpload from '../components/FileUpload.vue'
import Switch from '../components/Switch.vue'
import BarcodeScannigAnimation from '../components/BarcodeScannigAnimation.vue'

 
const emitter = inject('emitter');
const storage = inject('storage');
const http = inject('http');
const schedule_start_time = inject('schedule_start_time');
const is_started_schedule = inject('is_started_schedule');

const classes = inject('classes');
const wattingList = inject('wattingList');

let log = console.log

function input(event){
     let barcode = event.target.value;
     if(barcode){
          checkAndList(barcode)
          setTimeout(() => {
               event.target.value = ''
          }, 800);
     }
}

/**
 * 
 * student['is_called']
 */

function checkAndList(barcode='play-417-2024'){
     try {
          http.get('/single-student', { params: { barcode } }).then(response => {
               if(response.status == 200){
                    let student = response.data.data;
                    student.barcode = barcode;
                    let founds = wattingList.value.filter(s => s.id === student.id)
                    let is_called = founds.at(-1)?.is_called
                    
                    if(!founds.length){
                         wattingList.value.push(student) 
                    }
                    else if(founds.length && is_called){
                         wattingList.value.push(student) 
                    } else {
                         emitter.emit('toaster-warning', { message: 'Already added in here'})
                    }

                    storage('wattingList').value = wattingList.value;
               }
          })
     } catch (error) {
          console.warn('checkAndList_error::', error);
     }
}

function checkSchedule(){
     setTimeout(() => {
          if(is_started_schedule.value){          
       
               if(!schedule_start_time.value){
                    is_started_schedule.value = false
                    emitter.emit('toaster-warning', { message: 'Set time first' }) 
               } 
    
          } else {
               if(schedule_start_time.value){
                    if(confirm('You want to stop?')){
                         if(confirm('Delete collected data ?')){
                              let t = prompt('To delete type "yes"')
                              if(t == 'yes'){
                                   wattingList.value = []
                                   storage('wattingList').value = []
                                   is_started_schedule.value = false
                              }
                         }
                    } else {               
                         is_started_schedule.value = true                         
                    }
               } 
               storage('schedule_start_time').value = ''
               iAmInWathFunction.value = false
                    
          }
     }, 10);
}



</script>

<template>
     <div class="d-flex align-items-center">
          <btn class="px-3 shadow me-2"><i class='bx bx-list-ul'></i></btn>
          <input id="BARCODE_INPUT" type="text" @change="input" class="form-control px-4 py-2 text-center py-1 shadow me-2" placeholder="Barcode receiver field">
          
          <BarcodeScannigAnimation v-if="is_started_schedule" :scannig="is_started_schedule" class="me-1"  ></BarcodeScannigAnimation> 
        
          <Switch v-model="is_started_schedule" @click="checkSchedule" size="lg" yes="Started" no="Stopped" :bothVisible="false" :yesNoValue="[1, 0]" class="me-2" ></Switch> 
          <input type="time" :disabled="schedule_start_time && is_started_schedule" v-model="schedule_start_time" class="form-control py-2 px-4 text-center py-1" style="width: 180px">
     </div>


     <div class="sections mt-3">
          <div class="class-list">
               <div class="inner-list">
                    <ul>
                         <template v-for="(clas, i) in classes">
                              <li class="mb-2" >                    
                                   <label>
                                        <input :checked="clas.isActive" type="checkbox" class="p-1 me-2" @change="({target}) => {
                                             clas.isActive=target.checked;
                                             storage('classes').value = classes;
                                             }">
                                        {{ clas.class_name }} 
                                   </label> 
                              </li>

                         </template>
                    </ul>
               </div>
          </div>
          <div class="watting-list">
               <div class="set-max-height">
                    <div>
                         <template v-for="(student, i) in wattingList" :key="i"> 
                              <div class="student-box" :barcode="student?.barcode" >
                                   <div :class="{ 'bg_animation': student?.isPlaying }">
                                        <div class="student-name">{{ student.name }}</div>
                                        <div class="class-name">
                                             {{ student.class }} 
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
  height: calc(100vh - 160px);
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
</style>
