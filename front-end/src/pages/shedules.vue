<script setup>
import { onMounted, nextTick, watch, inject, ref, reactive } from 'vue';
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

const log = console.log
 
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


let startTimePicker = ref(null)
let endTimePicker = ref(null)
let startTimePicker2 = ref(null)
let endTimePicker2 = ref(null)

let payload = reactive({
    id: null,
    type: 1,
    title: null,
    start_time: '12:00 AM',
    end_time: '12:00 AM',
    order_index: 1,

    start_time2: '12:00 AM',
    end_time2: '12:00 AM',
    status: 1,
    classes: [],
    both: true,
})

const INC = 5

function decrementTime(key){
   if(key == 'start'){
      payload.start_time = moment(payload.start_time, 'hh:mm A').subtract(INC, 'minutes').format('hh:mm A')
      startTimePicker.value.setTime(payload.start_time)
   }
   else if(key == 'end'){
      payload.end_time = moment(payload.end_time, 'hh:mm A').subtract(INC, 'minutes').format('hh:mm A')
      endTimePicker.value.setTime(payload.end_time)
   }
   updateSecondPickers()
  
}
function incrementTime(key){
  if(key == 'start'){
      payload.start_time = moment(payload.start_time, 'hh:mm A').add(INC, 'minutes').format('hh:mm A')
      startTimePicker.value.setTime(payload.start_time)
   }
   else if(key == 'end'){
      payload.end_time = moment(payload.end_time, 'hh:mm A').add(INC, 'minutes').format('hh:mm A')
      endTimePicker.value.setTime(payload.end_time)
   }
   updateSecondPickers()
}



function decrementTime2(key){
   if(key == 'start'){
      payload.start_time2 = moment(payload.start_time2, 'hh:mm A').subtract(INC, 'minutes').format('hh:mm A')
      startTimePicker2.value.setTime(payload.start_time2)
   }
   else if(key == 'end'){
      payload.end_time = moment(payload.end_time, 'hh:mm A').subtract(INC, 'minutes').format('hh:mm A')
      endTimePicker2.value.setTime(payload.end_time)
   }
   updateSecondPickers()
}
function incrementTime2(key){
  if(key == 'start'){
      payload.start_time2 = moment(payload.start_time2, 'hh:mm A').add(INC, 'minutes').format('hh:mm A')
      startTimePicker2.value.setTime(payload.start_time2)
   }
   else if(key == 'end'){
      payload.end_time2 = moment(payload.end_time2, 'hh:mm A').add(INC, 'minutes').format('hh:mm A')
      endTimePicker2.value.setTime(payload.end_time2)
   }
}
function updateSecondPickers(){
  setTimeout(() => {

    // start_time2
    payload.start_time2 = moment(payload.start_time, 'hh:mm A').add(30, 'minutes').format('hh:mm A')
    startTimePicker2.value.setTime(payload.start_time2)

    // end_time2
    payload.end_time2 = moment(payload.end_time, 'hh:mm A').add(0, 'minutes').format('hh:mm A')
    endTimePicker2.value.setTime(payload.end_time2)
  }, 10);
}


function hide_modals(event){
  if (event.key === 'Escape') {  
    addUpdateMode.value = false
  }
}

watch(addUpdateMode, (bool)=>{

  if(bool === false){
    payload.id = null
  }
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


function updatePickersTime(delay=0, item = null){ 
  setTimeout(() => {
    startTimePicker.value.setTime((item || payload).start_time)
    endTimePicker.value.setTime((item || payload).end_time)

    if(item?.start_time && item?.end_time){
      payload.start_time = item.start_time
      payload.end_time = item.end_time
    }

  }, delay);
}

function updatePickersTime2(delay=0, item = null){ 
  setTimeout(() => {
    startTimePicker2.value.setTime((item || payload).start_time2)
    endTimePicker2.value.setTime((item || payload).end_time2)

    if(item?.start_time2 && item?.end_time2){
      payload.start_time2 = item.start_time2
      payload.end_time2 = item.end_time2
    }

  }, delay);
}


function clickOnDocumentBody(){
  document.body.click()
}

function clearPayload(){
  payload.id =  null
  payload.type =  1
  payload.status =  1
  payload.order_index =  1
  payload.title =  null
  payload.start_time = '12:00 AM'
  payload.end_time = '12:00 AM',
  payload.classes = []
  payload.both = true
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
  payload.status = item.status
  addUpdateMode.value = true; 
  updatePickersTime(300, item)
  updatePickersTime()
}


function isValidTimesInPayload(){
  let { start_time, end_time } = payload
  let t1 = moment(start_time, start_time.length === 5 ? 'HH:mm' : 'hh:mm A')
  let t2 = moment(end_time, end_time.length === 5 ? 'HH:mm' : 'hh:mm A')
  return t1.isBefore(t2) 
}


function addSchedule(){

  try {

    if(!payload.title || !payload.type || !payload.start_time || !payload.end_time || !payload.classes?.length){
      emitter.emit('toaster-warning', { message: 'সকল ফিল্ড পূরণ করা গুরুত্বপূর্ণ' })
      return  
    }

    let _payload = helper.clone(payload)
    _payload.classes = JSON.stringify(_payload.classes)

    _payload.start_time = makeDate(payload.start_time, 'HH:mm') // makeDate is comming from em-DateTimePicker.js
    _payload.end_time = makeDate(payload.end_time, 'HH:mm') // makeDate is comming from em-DateTimePicker.js

    if(!isValidTimesInPayload()){
      emitter.emit('toaster-error', { message: 'টাইম সঠিকভাবে সিলেক্ট করুন' })
      return
    }

    is___adding.value = true

    http.post('/schedules/add', _payload).then(response => {
      if(response.status == 200){
        getSchedules()
      }
    }).finally(()=>{

      if(payload.type === 1 && payload.both){
        let anotherPayload = _payload
        anotherPayload.type = 2
        anotherPayload['start_time'] = payload.start_time2
        anotherPayload['end_time'] = payload.end_time2
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

    if(!isValidTimesInPayload()){
      emitter.emit('toaster-error', { message: 'টাইম সঠিকভাবে সিলেক্ট করুন' })
      return
    }

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


function toggleExpandCollapseAll(){
  let targetSchedules = tab.value == 1 ? punch_schedules.value : call_schedules.value
  let allExpanded = targetSchedules.every(item => item.showClasses)
  targetSchedules.forEach(item => {
    item.showClasses = !allExpanded
  })
}

function toggleOnOffAll(){
  let targetSchedules = tab.value == 1 ? punch_schedules.value : call_schedules.value
  let status = targetSchedules.every(item => item.status == 1)
  if(!confirm(`Are you sure to turn ${status ? 'off' : 'on'} all?`)) return;
  for(const item of targetSchedules){
    item.status = status ? 0 : 1
    http.post('/schedules/update-status', {id: item.id, status: item.status} )
  }
}

let scheduleTrRef = ref([])

async function reOrderSchedules(schedule_list, i, action='up'){
  if(action == 'up'){
    [schedule_list[i], schedule_list[i - 1]] = [schedule_list[i - 1], schedule_list[i]]
    await nextTick()
    scheduleTrRef.value[i].classList.add('slideDownTr')
    scheduleTrRef.value[i - 1].classList.add('slideUpTr')
  }
  else if(action == 'down'){
    [schedule_list[i], schedule_list[i + 1]] = [schedule_list[i + 1], schedule_list[i]]
    await nextTick()
    scheduleTrRef.value[i].classList.add('slideUpTr')
    scheduleTrRef.value[i + 1].classList.add('slideDownTr')
  }
  setTimeout(() => {
    scheduleTrRef.value.forEach(el => {
      el.classList.remove('slideUpTr')
      el.classList.remove('slideDownTr')
    })
  }, 310);


  let data = schedule_list.map((item, i) => ({id: item.id, order_index: i + 1}))
  await http.post('/schedules/update-order-indexes', {data})
  await getSchedules()

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



      <Modal v-model="addUpdateMode" :title="payload?.id ? `Update Schedule` : `Add ${payload.type == 2 ? 'Call' : 'Punch'} Schedule`">
        <div class="w-100 d-flex justify-content-center">
  
          <form @submit.prevent="false" class="cb-form" @click="clickOnDocumentBody">
            <div class="row mt-4">

        
              <div v-if="false" class="col-12">
                <div class="form-group">
                  <div class="d-flex justify-content-between">
                    <label for="PNC">Type </label> 
                  </div>
                  <select id="PNC" v-model="payload.type" class="form-control cb-input">
                    <option value="1">Punch</option>
                    <option value="2">Call</option>
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

              <div class="col-12">
                <div class="row">

                  <div class="col-12">
                    <label class="group-header">{{ payload.type == 1 ? 'Set Punch time' : 'Set Call Time' }}</label>
                  </div>

                  <div class="col-6">
                    <div class="form-group group-header2">
                      <label for="">{{ payload.type == 1 ? 'Punch Start' : 'Call Start' }}</label>
                      <!-- <input v-model="payload.start_time" type="time" class="form-control cb-input"> -->
                       <div class="position-relative">
                         <TimePicker ref="startTimePicker"
                          v-model="payload.start_time"
                          modelValueType="string"
                          @change="(time) => {
                            if(!isValidTimesInPayload()){
                              $refs.endTimePicker.setTime(time);
                              payload.end_time = time
                            }
                          }"
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
                         <div class="position-absolute" style="right: 5px; top: 8px">
                          <Btn @click="decrementTime('start')" class="me-1 sm opacity-75">-</Btn>
                          <Btn @click="incrementTime('start')" class="sm opacity-75">+</Btn>
                        </div>
                       </div>
                    </div>
                  </div>
    
                  <div class="col-6">
                    <div class="form-group group-header2">
                      <div class="d-flex justify-content-between">
                        <label for="">{{ payload.type == 1 ? 'Punch End' : 'Call End' }}</label>
                      </div>
                      <div class="position-relative">
                        <TimePicker ref="endTimePicker"
                          v-model="payload.end_time"
                          modelValueType="string"
                          @change="false"
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
                         <div class="position-absolute" style="right: 5px; top: 8px">
                          <Btn @click="decrementTime('end')" class="me-1 sm opacity-75">-</Btn>
                          <Btn @click="incrementTime('end')" class="sm opacity-75">+</Btn>
                        </div>
                      </div>
                    </div>
                  </div> 
                </div>
              </div>



              <!--  -->
              <!--  -->
              <!--  -->
              <!--  -->
              <template v-if="!payload.id && payload.type == 1">
               

 
                <div class="col-12">
                  <div class="row">
                    <div class="col-12">
                      <div class="d-flex justify-content-between align-items-center">
                        <label class="group-header">Set Call Times</label>
                        <label for="">
                          <input v-model="payload.both" type="checkbox">
                          Both
                        </label>
                      </div>
                    </div>
                    <div class="col-6" :class="{'opacity-25 nc': !payload.both}">
                      <div class="form-group group-header2">
                        <label for="">Call Start</label>
                        <!-- <input v-model="payload.start_time" type="time" class="form-control cb-input"> -->
                          <div class="position-relative">
                            <TimePicker ref="startTimePicker2"
                            v-model="payload.start_time2"
                            modelValueType="string"
                            @change="(time) => {
                              if(!isValidTimesInPayload()){
                                $refs.endTimePicker2.setTime(time);
                                payload.end_time2 = time
                              }
                            }"
                            @close="false"
                            :displayFormat="'DD-MMM-Y'"
                            :rangePicker="false" 
                            :onlyTimePicker="true" 
                            :startTime="payload.start_time2"  
                            @click="updatePickersTime2()"
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
                            <div class="position-absolute" style="right: 5px; top: 8px">
                            <Btn @click="decrementTime2('start')" class="me-1 sm opacity-75">-</Btn>
                            <Btn @click="incrementTime2('start')" class="sm opacity-75">+</Btn>
                          </div>
                          </div>
                      </div>
                    </div>
      
                    <div class="col-6" :class="{'opacity-25 nc': !payload.both}">
                      <div class="form-group group-header2">
                        <div class="d-flex justify-content-between">
                          <label for="">Call End</label>
                        </div>
                        <div class="position-relative">
                          <TimePicker ref="endTimePicker2"
                            v-model="payload.end_time2"
                            modelValueType="string"
                            @change="false"
                            @close="false"
                            :displayFormat="'DD-MMM-Y'"
                            :rangePicker="false" 
                            :onlyTimePicker="true" 
                            :startTime="payload.end_time2"  
                            @click="updatePickersTime2()"
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
                            <div class="position-absolute" style="right: 5px; top: 8px">
                            <Btn @click="decrementTime2('end')" class="me-1 sm opacity-75">-</Btn>
                            <Btn @click="incrementTime2('end')" class="sm opacity-75">+</Btn>
                          </div>
                        </div>
                      </div>
                    </div> 
                  </div>
                </div>
 
              </template>
              <!--  -->
              <!--  -->
              <!--  -->
              <!--  -->



              


         


              <div class="col-12 d-flex justify-content-center mt-3">
                <Btn @click.stop="clearPayload()" class="red me-2" >Cancel</Btn>
                <Btn class="me-0" @click.stop="() => {
                  clickOnDocumentBody()
                  if(payload.id) updateSchedule()
                  else addSchedule()
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
                <th class="text-center" tooltip="Click to toggle expand/collapse all" flow="down" @click="toggleExpandCollapseAll()">Classes</th>
                <th tooltip="Click to on/off all" flow="down" @click.stop="toggleOnOffAll()">Status</th>
                <th>Action</th> 
                <th>Order</th> 
              </tr>
            </thead>
          </template>
          <template #rows>
            <template v-if="tab==1 ? punch_schedules?.length  : call_schedules?.length">
              <template v-for="(item, i) in tab==1 ? punch_schedules  : call_schedules">
                <tr ref="scheduleTrRef" @auxclick="helper.log(item)">
                    
                  <td :class="{'text-danger': item?.status == 0}"> {{ item.title }} </td> 
                  <td :class="{'text-danger': item?.status == 0}"> {{ helper.formatTime(item.start_time) }} </td>                   
                  <td :class="{'text-danger': item?.status == 0}"> {{ helper.formatTime(item.end_time) }}</td>                   
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
                  <td>
                    <Switch size="sm" v-model="item.status" @change="async (status) => {
                    await http.post('/schedules/update-status', {id: item.id, status} );
                    getSchedules()
                  
                    }"></Switch>
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
                  <td class="text-center" style="width: 20px;"> 
                    <div class="d-flex justify-content-start">
                    
  
                      <span :class="{'opacity-0 pointer-none': i == 0}" class="me-2 badge bg-white p-2 cp" @click.stop="reOrderSchedules(tab==1 ? punch_schedules  : call_schedules, i, 'up')">
                        <i class='bx bx-chevron-up text-black cm size-1' ></i>
                      </span>
                      <span :class="{'opacity-0 pointer-none': (tab==1 ? punch_schedules  : call_schedules)?.length - 1 === i}" class="badge bg-white p-2 cp" @click.stop="reOrderSchedules(tab==1 ? punch_schedules  : call_schedules, i, 'down')">
                        <i class='bx bx-chevron-down text-black cp size-1' ></i>
                      </span>
          
                    </div>
                  </td> 
              </tr> 
              <tr v-if="item.showClasses">
                <td :colspan="6" >
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