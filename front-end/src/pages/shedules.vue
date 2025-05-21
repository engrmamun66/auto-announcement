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

let route = useRoute()
let router = useRouter()
 
const emitter = inject('emitter');
const makeCarcode = inject('makeCarcode');
const helper = inject('helper');
const getSchedules = inject('getSchedules');

const punch_schedules = inject('punch_schedules');
const call_schedules = inject('call_schedules'); 



const classes = inject('classes');
let http = inject('http'); 

let addUpdateMode = ref(false)
let is___adding = ref(false)
let tab = ref(1)


let payload = reactive({
    id: null,
    type: 1,
    title: null,
    start_time: null,
    end_time: null,
    classes: [],
})

watch(addUpdateMode, (a, b)=>{
  payload.type = tab.value
   
})


function clearPayload(){
  payload.id =  null
  payload.type =  1
  payload.title =  null
  payload.start_time =  null
  payload.end_time =  null
  payload.classes =  []
  addUpdateMode.value = false;
  is___adding.value = false
}

function prepareEdit(item){
  payload.id = item.id
  payload.type = item.type
  payload.title = item.title
  payload.start_time = item.start_time
  payload.end_time = item.end_time
  payload.classes = item.classes
  addUpdateMode.value = true; 
}


function addSchedule(){

  try {

    if(!payload.title || !payload.type || !payload.start_time || !payload.end_time || !payload.classes?.length){
      emitter.emit('toaster-warning', { message: 'All field are required' })
      return  
    }
    let _payload = helper.clone(payload)
    _payload.classes = JSON.stringify(_payload.classes)

    is___adding.value = true
    http.post('/schedules/add', _payload).then(response => {
      if(response.status == 200){
        students.value = response.data.data;
        params.value = {...params.value, ...response.data.pagination};
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


function updateSchedule(id){

  try {

    if(!payload.title || !payload.type || !payload.start_time || !payload.end_time || !payload.classes?.length){
      emitter.emit('toaster-warning', { message: 'All field are required' })
      return  
    }
    if(!payload.title || !payload.type || !payload.start_time || !payload.end_time || !payload.classes?.length){
      emitter.emit('toaster-warning', { message: 'All field are required' })
      return  
    }
    let _payload = helper.clone(payload)
    _payload.classes = JSON.stringify(_payload.classes)

    is___adding.value = true
    http.post('/schedules/update', _payload).then(response => {
      if(response.status == 200){
        students.value = response.data.data;
        params.value = {...params.value, ...response.data.pagination};
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
        <div class="d-flex justify-content-between flex-wrap">
           <h1>{{ !addUpdateMode ? `${tab == 1 ? 'Punch' : 'Call'} Schedules` : (payload.id ? 'Update Schedule' : 'Add Schedule')}}</h1> 
       
           <div class="d-flex justify-content-end">
               <Btn v-if="!addUpdateMode" class="me-2" @click="addUpdateMode = true" ><i class='bx bx-plus'></i> Add Schedule</Btn>
               <Btn v-else class="me-2 red" @click="clearPayload()" >Cancel</Btn>
               <!-- <Btn @click="router.push({name: 'import'})"><i class='bx bxs-file-import' ></i> Import</Btn> -->
             </div>
        </div>

    </div>



 <template v-if="addUpdateMode">
      <div class="w-100 d-flex justify-content-center">

        <div class="add-form-wrapper">
          <form @submit.prevent="false">
            <div class="row mt-4">

        
              <div class="col-12">
                <div class="form-group">
                  <label for="name">Type</label>
                  <select v-model="payload.type" class="form-control">
                    <option value="1">Punch</option>
                    <option value="2">Call</option>
                  </select>
                </div>
              </div>
        
              <div class="col-12">
                <div class="form-group">
                  <label for="name">Title</label>
                  <input v-model="payload.title" type="text" class="form-control">
                </div>
              </div>
              
              <div class="col-12">
                <div class="form-group">
                  <label for="">Classes 
                    <button class="btn btn-sm bg-success text-white p-0 px-2 mb-1 me-1" @click.stop="payload.classes = helper.clone(classes)" >All</button>  
                    <button class="btn btn-sm bg-danger text-white p-0 px-2 mb-1" @click.stop="payload.classes = []" >Clear</button>  
                  </label>
                  <BaseSelectMultiple v-model="payload.classes" :label="false" :data="classes" displayKey="class_name" valueKey="class_name" ></BaseSelectMultiple>
                </div>
              </div>


              <div class="col-6">
                <div class="form-group">
                  <label for="name">Start</label>
                  <input v-model="payload.start_time" type="time" class="form-control">
                </div>
              </div>

              <div class="col-6">
                <div class="form-group">
                  <label for="name">End</label>
                  <input v-model="payload.end_time" type="time" class="form-control">
                </div>
              </div>


         


              <div class="col-12 d-flex justify-content-center">
                <Btn @click.stop="clearPayload()" class="red me-2" >Cancel</Btn>
                <Btn class="me-0" @click.stop="payload.id ? addSchedule() : updateSchedule()" >Submit <BtnLoader v-if="is___adding"></BtnLoader> </Btn>
              </div> 

            </div>
          </form>
        </div>

      </div>
    </template>




    <template v-else>

      <ul class="nav nav-tabs mt-4">
        <li class="nav-item">
          <a @click.stop="tab = 1" class="nav-link cp text-black" :class="{'active': tab==1}" >Puch Times</a>
        </li>
        <li class="nav-item">
          <a @click.stop="tab = 2" class="nav-link cp text-black" :class="{'active': tab==2}" >Call Times</a>
        </li>
         
      </ul>

      <myTable >
        <template #thead>
          <thead>
            <tr> 
              <th>Title</th>
              <th>Stat Time</th>
              <th>End Time</th>
              <th>Classes</th>
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
                <td> {{ helper.formatTime(item.end_time) }} </td>                   
                <td>
                  <ul v-if="item.classes">
                    <template v-if="item.showClasses">
                      <li> <a @click.stop.prevent="item.showClasses = false" href="#">Less...</a> </li>
                      <li v-for="cls in item.classes">
                        {{ cls.class_name }}
                      </li>
                    </template>
                    <template v-else>
                     <li> 
                        <a @click.stop.prevent="item.showClasses = true" class="ms-1" href=""> More...</a>   
                      </li>
                     <li>  
                        <a > {{ item.classes.length == 16 ? 'All' :  item.classes.length }} Classes</a>  
                      </li>
                    </template>
                  </ul>
                </td>                   
          
                <td> 
                  <div class="d-flex justify-content-center">
                  

                    <span tooltip="Delete Schedule">
                      <i @click.stop="prepareEdit(item)" class='bx bx-pencil text-danger cp me-2' ></i>
                      <i @click.stop="deleteSchedule(item.id, i, item.type)" class='bx bx-trash text-danger cp' ></i>
                    </span>
        
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

    </template>
      




</template>