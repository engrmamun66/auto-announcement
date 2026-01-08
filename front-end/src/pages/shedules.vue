<script setup>
import { onMounted, watch, inject, ref, reactive } from 'vue';
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
import BaseSelectMultiple from '../components/BaseSelectMultiple.vue'
import TimePicker from '../components/EmDateTimePicker.vue'
import { template } from 'lodash';

let route = useRoute()
let router = useRouter()
 
const emitter = inject('emitter');
const makeCarcode = inject('makeCarcode');
const helper = inject('helper');
const getSchedules = inject('getSchedules');
const CONFIG = inject('CONFIG');

const punch_schedules = inject('punch_schedules');
const call_schedules = inject('call_schedules'); 



const classes = inject('classes');
let http = inject('http'); 

let addUpdateMode = ref(false)
let is___adding = ref(false)
let tab = ref(1)
let forBoth = ref(false)



let payload = reactive({
    id: null,
    type: 1,
    title: null,
    start_time: '12:00 AM',
    end_time: '12:00 AM',
    classes: [],
})

watch(addUpdateMode, (bool) => {
  forBoth.value = false
  if(bool === false){
    payload.id = null
  }
})


let startTimePicker = ref(null)
let endTimePicker = ref(null)

function hide_modals(event){
  if (event.key === 'Escape') {  
    addUpdateMode.value = false
  }
}

watch(addUpdateMode, (bool)=>{
  payload.type = tab.value
  if(bool === true){
    updatePickersTime(10)
  }

  if(bool){ 
    document.addEventListener('keyup', hide_modals)
    setTimeout(() => {
      updatePickersTime()
    }, 100);

  }else {
    document.removeEventListener('keyup', hide_modals)
  }
})


function updatePickersTime(delay=0){ 
  setTimeout(() => {
    startTimePicker.value.setTime(payload.start_time)
    endTimePicker.value.setTime(payload.end_time)
  }, delay);
}


function clickOnDocumentBody(){
  document.body.click()
}

function clearPayload(){
  payload.id =  null
  payload.type =  1
  payload.title =  null
  payload.start_time = '08:00 AM'
  payload.end_time = '12:00 AM',
  payload.classes =  []
  addUpdateMode.value = false;
  is___adding.value = false
  clickOnDocumentBody()
}

function prepareEdit(item){
  payload.id = item.id
  payload.type = item.type
  payload.title = item.title
  payload.start_time = item.start_time
  payload.end_time = item.end_time
  payload.classes = item.classes
  addUpdateMode.value = true; 
  updatePickersTime()
}


function addSchedule(for__both=false){

  try {

    if(!payload.title || !payload.type || !payload.start_time || !payload.end_time || !payload.classes?.length){
      emitter.emit('toaster-warning', { message: 'সকল ফিল্ড পূরণ করা গুরুত্বপূর্ণ' })
      return  
    }

    
    let _payload = helper.clone(payload)
    _payload.classes = JSON.stringify(_payload.classes)

    _payload.start_time = makeDate(payload.start_time, 'HH:mm') // makeDate is comming from em-DateTimePicker.js
    _payload.end_time = makeDate(payload.end_time, 'HH:mm') // makeDate is comming from em-DateTimePicker.js
    
    is___adding.value = true
    http.post('/schedules/add', _payload).then(response => {
      if(response.status == 200){
        getSchedules()
      }
    }).finally(()=>{

      if(for__both){
        let anotherPayload = _payload
        anotherPayload.type = anotherPayload.type === 1 ? 2 : 1
        http.post('/schedules/add', anotherPayload).then(response => {
          if(response.status == 200){
            getSchedules()
          }
        }).finally(()=>{
          clearPayload()
          is___adding.value = false
        })
      } else {
        clearPayload()
        is___adding.value = false

      }
      
    })
    
  } catch (error) {
    console.warn('addSchedule__error::', error);

    
  }

}


function updateSchedule(){

  try {

    if(!payload.id){
      emitter.emit('toaster-warning', { message: 'আইডি পাওয়া যায়নি' })
      return  
    }
    if(!payload.title || !payload.type || !payload.start_time || !payload.end_time || !payload.classes?.length){
      emitter.emit('toaster-warning', { message: 'সকল ফিল্ড পূরণ করা গুরুত্বপূর্ণ' })
      return  
    }
    let _payload = helper.clone(payload)
    _payload.classes = JSON.stringify(_payload.classes)

    is___adding.value = true
    http.post('/schedules/update', _payload).then(response => {
      if(response.status == 200){ 
        getSchedules()
      }
    }).finally(()=>{
      clearPayload()
      is___adding.value = false
      getSchedules()
    })
    
  } catch (error) {
    console.warn('addSchedule__error::', error);
  }

}

function deleteSchedule(id, i, type=1){

  try {

    if(!confirm('Are you sure?')) return;

    http.delete(`/schedules/delete/${id}`).then(response => {
      if(response.status == 200){
        if(type === 1){
          punch_schedules.value.splice(i, 1)
        } else {
          call_schedules.value.splice(i, 1)
        }
      }
    }) 
    
  } catch (error) {
    console.warn('addSchedule__error::', error);
  }

}


</script>

<template>
    <div>
        <div class="d-flex justify-content-between align-items-center flex-wrap">
           <h1>{{ !addUpdateMode ? `${tab == 1 ? 'Punch Schedules' : 'Call Schedules'}` : (payload.id ? 'Update Schedule' : 'Add Schedule')}}</h1> 
       
           <div class="d-flex justify-content-end">
               <Btn v-if="!addUpdateMode" class="me-2" @click="addUpdateMode = true" ><i class='bx bx-plus'></i> Add Schedule</Btn>
               <Btn v-else class="me-2 red" @click="clearPayload()" >Cancel</Btn>
               <!-- <Btn @click="router.push({name: 'import'})"><i class='bx bxs-file-import' ></i> Import</Btn> -->
             </div>
        </div>

    </div>



      <Modal v-model="addUpdateMode" :title="payload?.id ? `Update Schedule` : `Add Schedule`">
        <div class="w-100 d-flex justify-content-center">
  
          <form @submit.prevent="false" class="cb-form" @click="clickOnDocumentBody">
            <div class="row mt-4">

        
              <div class="col-12">
                <div class="form-group">
                  <div class="d-flex justify-content-between">
                    <label for="PNC">Type </label>
                    <label v-if="!payload?.id" for="both">  <input v-model="forBoth" type="checkbox" id="both"> For punch also</label>
                  </div>
                  <select id="PNC" v-model="payload.type" class="form-control cb-input">
                    <option value="1">{{forBoth ? 'Call & Punch' : 'Punch'}}</option>
                    <option value="2">{{forBoth ? 'Call & Punch' : 'Call'}}</option>
                  </select>
                </div>
              </div>
        
              <div class="col-12">
                <div class="form-group">
                  <label for="">Title</label>
                  <input v-model="payload.title" type="text" class="form-control cb-input">
                </div>
              </div>
              
              <div class="col-12">
                <div class="form-group">
                  <label for="">Classes </label>
                  <BaseSelectMultiple placeholder="Select Class" v-model="payload.classes" :label="false" :data="classes" displayKey="class_name" valueKey="class_name" maxHeight="200px" ></BaseSelectMultiple>
                </div>
              </div>


              <div class="col-6">
                <div class="form-group">
                  <label for="">Start</label>
                  <!-- <input v-model="payload.start_time" type="time" class="form-control cb-input"> -->
                   <TimePicker ref="startTimePicker"
                    v-model="payload.start_time"
                    modelValueType="string"
                    @change="log"
                    @close="false"
                    :displayFormat="'DD-MMM-Y'"
                    :rangePicker="false" 
                    :onlyTimePicker="true" 
                    :startTime="payload.start_time"  
                    @click="updatePickersTime()"
                    :timePickerButtons="true"
                    :use24FormatTimeForEvents="true"
                    :invisible="false"
                    :minuteStep="5"
                    displayIn="top_left"
                    :adjustY="-208" 
                    :openigAimationClass="'none-'"
                    style="width: 232px"
                    >
                   </TimePicker>
                </div>
              </div>

              <div class="col-6">
                <div class="form-group">
                  <label for="">End</label>
                  <TimePicker ref="endTimePicker"
                    v-model="payload.end_time"
                    modelValueType="string"
                    @change="log"
                    @close="false"
                    :displayFormat="'DD-MMM-Y'"
                    :rangePicker="false" 
                    :onlyTimePicker="true" 
                    :startTime="payload.end_time"  
                    @click="updatePickersTime()"
                    :timePickerButtons="true"
                    :use24FormatTimeForEvents="true"
                    :invisible="false"
                    :minuteStep="5"
                    displayIn="top_left"
                    :adjustY="-208" 
                    :openigAimationClass="'none-'"
                    style="width: 232px"
                    >
                   </TimePicker>
                </div>
              </div> 


         


              <div class="col-12 d-flex justify-content-center mt-3">
                <Btn @click.stop="clearPayload()" class="red me-2" >Cancel</Btn>
                <Btn class="me-0" @click.stop="() => {
                  clickOnDocumentBody()
                  if(payload.id) updateSchedule()
                  else addSchedule(forBoth)
                }" > {{ payload.id ? 'Update' : 'Submit' }} <BtnLoader v-if="is___adding"></BtnLoader> </Btn>
              </div> 

            </div>
          </form> 
  
        </div>
      </Modal> 


 
    <template v-if="true">

      <ul class="nav nav-tabs mt-4 bottom-borderless">
        <li class="nav-item">
          <a @click.stop="tab = 1" class="nav-link cp text-black" :class="{'active': tab==1}" >Puch Times</a>
        </li>
        <li class="nav-item">
          <a @click.stop="tab = 2" class="nav-link cp text-black" :class="{'active': tab==2}" >Call Times</a>
        </li>
        <!-- <li v-if="CONFIG?.settings?.with_speaker_controls?.status" class="nav-item">
          <a @click.stop="tab = 3" class="nav-link cp text-black" :class="{'active': tab==3}" >Speaker Ports</a>
        </li> -->
         
      </ul>

      <template v-if="[1,2].includes(tab)">
        <myTable >
          <template #thead>
            <thead>
              <tr> 
                <th>Title</th>
                <th>Stat Time</th>
                <th>End Time</th>
                <th class="text-center">Classes</th>
                <th>Action</th> 
              </tr>
            </thead>
          </template>
          <template #rows>
            <template v-if="tab==1 ? punch_schedules?.length  : call_schedules?.length">
              <template v-for="(item, i) in tab==1 ? punch_schedules  : call_schedules">
                <tr @click="helper.log(item)">
                    
                  <td> {{ item.title }} </td> 
                  <td> {{ helper.formatTime(item.start_time) }} </td>                   
                  <td> {{ helper.formatTime(item.end_time) }}</td>                   
                  <td style="max-width: 500px;">
                    <div class="d-flex justify-content-center">
                      <ul v-if="item.classes">
                        <template v-if="item.showClasses">
                          <li> <a @click.stop.prevent="item.showClasses = false" href="#" class="badge bg-secondary size-08"><i class='bx bxs-hand-down' ></i> Less...</a> </li>
                        </template>
                        <template v-else>
                         <li> 
                            <a @click.stop.prevent="item.showClasses = true" href="" class="badge bg-secondary size-08 ms-1"><i class='bx bxs-hand-up' ></i> More...</a>   
                          </li>
                         <li>  
                            <a > {{ item.classes.length == 16 ? 'All' :  item.classes.length }} Classes</a>  
                          </li>
                        </template>
                      </ul>
                    </div>
                  </td>                   
            
                  <td class="text-center"> 
                    <div class="d-flex justify-content-start">
                    
  
                      <span tooltip="Update Schedule" class="me-2 badge bg-white p-2 cp" @click.stop="prepareEdit(item)">
                        <i class='bx bxs-edit text-danger cp size-1' ></i>
                      </span>
                      <span tooltip="Delete Schedule" class="badge bg-white p-2 cp" @click.stop="deleteSchedule(item.id, i, item.type)">
                        <i class='bx bx-trash text-danger cp size-1' ></i>
                      </span>
          
                    </div>
                  </td> 
              </tr> 
              <tr v-if="item.showClasses">
                <td :colspan="3"></td>
                <td :colspan="1" style="max-width: 500px;">
                  <div class="p-2 border bg-white shadow radius-10">
                    <div class="d-flex justify-content-center align-content-center gap-2 flex-wrap" :class="[item?.classes?.length <=3 ? 'justify-content-start' : 'justify-content-center']">
                      <template v-for="cls in item.classes">
                        <div class="badge bg-secondary text-white size-08 p-1 px-2 shadow" style="color: var(--primaryColor)">
                          {{ cls.class_name }}
                        </div>
                      </template>
                  </div>
                  </div>
                </td>  
                <td></td>
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

      </template>
      <template v-else-if="tab==3">
        <myTable class="class-wise-speaker-settings">
          <template #thead>
            <thead>
              <tr> 
                <th>Class</th>
                <th>Speaker Ports</th>
              </tr>
            </thead>
          </template>
          <template #rows>
            <template v-for="(eachClass, i) in CONFIG?.classes">
              <tr>
                  
                <td> {{ eachClass.class_name }} </td> 
                <td> 
                    <div class="d-flex gap-2">
                      <template v-for="(relay, i) in eachClass?.speaker_ports || []">
                        <div class="speaker-port">{{ relay }}</div>
                      </template> 
                    </div>
                </td>    
           
              </tr> 

            
            
            </template> 
             
          </template>
        </myTable> 

      </template>

    </template>
      




</template>