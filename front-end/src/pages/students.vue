<script setup>
import { onMounted, inject, ref, reactive } from 'vue';
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


const route = inject('route');
const router = inject('router');
const emitter = inject('emitter');
const printDiv = inject('printDiv');
const makeCarcode = inject('makeCarcode');
const helper = inject('helper');
const classes = inject('classes');
let http = inject('http'); 
let students = ref([])
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
// let filterForm

async function getStudents({id=null}={}){
  try {
    http.get('/students', { params: {...params.value, id} }).then(response => {
      if(response.status == 200){
        students.value = response.data.data;
        params.value = {...params.value, ...response.data.pagination};
      }
    })
  } catch (error) {
    console.warn('getStudents_error::', error);
  }
}

function toggleLoopItem (data, index, key = "isPlaying_sound1") {
  if (!data) return;
  data?.forEach((item, i) => {
    if (i == index) {
      item[key] = !(item[key] ?? false);
    } else {
      item[key] = false;
    }
  });
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
  if(get) getStudents({id}) 
}
 
async function deleteAudio(std, colName){
  let text = prompt('Type secret pass code')
  if(text === 'delete' || text === String(new Date().getDate()) || text === 'D'){
    http.delete(`/students/delete-audio/${std.id}/${colName}`).then(()=>{
      std[colName] = null
    })
  } else if(text) {
    emitter.emit('toaster-error', { message: 'Pass code not matched' })
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
  addMode.value = false 
  is___adding.value = false 
}

function prepareToEdit(std){
  Object.keys(payload).forEach(key => {
    payload[key] = std[key]
  });
  addMode.value = true
}
 
async function addStudent(){
  try {

    if(!payload.name) return emitter.emit('toaster-warning', {message: 'Name is required'})
    if(!payload.class) return emitter.emit('toaster-warning', {message: 'Class is required'})
    if(!payload.dakhela) return emitter.emit('toaster-warning', {message: 'Dhakhela is required'})
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

    if(!payload.name) return emitter.emit('toaster-warning', {message: 'Name is required'})
    if(!payload.class) return emitter.emit('toaster-warning', {message: 'Class is required'})
    if(!payload.dakhela) return emitter.emit('toaster-warning', {message: 'Dhakhela is required'})
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
      emitter.emit('toaster-error', {message: 'Passcode not matched!'})
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
 
onMounted(()=>{
  getStudents()
})

 

</script>

<template>
    <div class="d-flex justify-content-between flex-wrap">
      <h1>{{ !addMode ? 'Students' : 'Add Student'}}</h1> 
      
      <div class="d-flex justify-content-end">
        <Btn @click="showSearchForm = !showSearchForm" class="me-2"><i class='bx bx-search transformY-2px size-1' ></i> {{ showSearchForm ? "Hide" : 'Show' }} search</Btn>
        <Btn v-if="!addMode" class="me-2" @click="addMode = !addMode" ><i class='bx bx-plus'></i> Add Student</Btn>
        <Btn v-else class="me-2 red" @click="addMode = !addMode" >Cancel</Btn>
        <!-- <Btn @click="router.push({name: 'import'})"><i class='bx bxs-file-import' ></i> Import</Btn> -->
      </div>
    </div>

    <template v-if="addMode">
      <div class="w-100 d-flex justify-content-center">

        <div class="add-form-wrapper">
          <form @submit.prevent="false">
            <div class="row mt-4">

              <div class="col-12">
                <div class="form-group">
                  <label for="email">Class</label>
                  <select v-model="payload.class" class="form-control" id="ClassId">
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
                  <input v-model="payload.name" type="text" class="form-control">
                </div>
              </div>

              <div class="col-12">
                <div class="form-group">
                  <label for="name">Dakhela</label>
                  <input v-model="payload.dakhela" type="number" class="form-control">
                </div>
              </div>

              <div class="col-12">
                <div class="form-group">
                  <label for="year">Year</label> 
                  <select v-model="payload.year" id="" class="form-control">
                    <option :value="new Date().getFullYear()">{{ new Date().getFullYear() }}</option>
                    <option :value="new Date().getFullYear() - 1">{{ new Date().getFullYear() - 1 }}</option>
                    <option :value="new Date().getFullYear() - 2">{{ new Date().getFullYear() - 2 }}</option>
                    <option :value="new Date().getFullYear() - 3">{{ new Date().getFullYear() - 3 }}</option>
                  </select>
                </div>
              </div>
              <!--   <div class="col-12">
                <div class="form-group">
                  <label for="card">Card Number</label>
                  <input v-model="payload.card_no" type="text" class="form-control" id="CARD_FIELD_IN_CARD_FORM">
                </div>
              </div> -->

              <div class="col-12 d-flex justify-content-center">
                <Btn @click.stop="clearPayload" class="red me-2" >Cancel</Btn>
                <Btn v-if="!payload.id" @click="addStudent" class="me-0" >Submit <BtnLoader v-if="is___adding"></BtnLoader> </Btn>
                <Btn v-else @click="updateStudent" class="me-0" >Update <BtnLoader v-if="is___adding"></BtnLoader> </Btn>
              </div> 

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
                <label for="email">Dakhela</label>
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
                    <Btn @click.stop="clearParams();getStudents()" class="me-1 red">Clear</Btn> 

                  </div>
                </div>
              </div>
            </div>

            <div class="col-12 mt-4">
              <template v-for="cls in classes">
                <button class="class-short-btn" :class="{'active': params.class_name === cls.class_name}" 
                @click="params.class_name = cls.class_name;getStudents()" >{{ helper.ucfirst(cls.class_short) }}</button>
              </template>

            </div>
            
           
       
          
        </form>
      </div>
  
      
  
       <myTable>
          <template #thead>
            <thead>
              <tr>
                <th>Class</th>
                <th>Name</th>
                <!-- <th>Card</th> -->
                <th>Dakhela</th>
                <th>Year</th>
                <th>Sound</th>
                <!-- <th>Sound-2</th> -->
                <th>Status</th>
                <th>Action</th> 
              </tr>
            </thead>
          </template>
          <template #rows>
            <template v-if="students?.length">
              <template v-for="(std, i) in students">
                <tr>
                  <td class="text-left"> {{ std.class }} </td> 
                  <td class="text-left cp" @click="prepareToEdit(std)" >{{ std.name }}</td>
                  <!-- <td :class="{'bg-danger-subtle': !std.card_no}"> {{ std.card_no }} </td>  -->
                  <td> {{ std.dakhela }} </td> 
                  <td> {{ std.year }} </td> 
                  <template v-for="column in ['sound1']">
                    <td> 
                      <!-- Sound -->
                      <template v-if="std[column]">            
                        <template v-if="!std[`isPlaying_${column}`]">            
                          <div class="d-flex align-items-center">
                            <Btn  @click.stop="toggleLoopItem(students, i, `isPlaying_${column}`)" class="radius-10 sm sound w-100" style="padding: 2px auto;" >
                              <i class='bx bx-play size-1 transformY-3px'></i>&nbsp;Play
                            </Btn>
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
                    <div class="d-flex justify-content-center">
                      <i @click.stop="targetStdForBarcode=std" class='bx bx-barcode cp size-1p5' ></i>
                      
                      <span tooltip="Copy barcode">
                        <i @click="({target}) => helper.copyToClipboard(makeCarcode(std), {el: target.parentElement})" class='bx bxs-copy-alt cp px-1' style="font-size: 18px" ></i>
                      </span>
                     

                      <span tooltip="Delete student">
                       <i @click="deleteStudent(std.id, i)" class='bx bx-trash text-danger cp' ></i>
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

     <template v-if="targetStdForBarcode">
      <modal @close="targetStdForBarcode=null" :title="false">
        <div style="height:220px" class="d-flex justify-content-center align-items-center">
          <div class="d-flex justify-content-center align-items-center flex-column w-100">
              <div id="PRINTABLE_AREA">
                <Barcode :data="makeCarcode(targetStdForBarcode)"  @load="printDiv('PRINTABLE_AREA')"></Barcode>
              </div>
              <span class="print-buton cp px-5 mt-3" @click="printDiv('PRINTABLE_AREA')">
                <i class='bx bx-printer px-1' style="font-size: 18px" ></i> Print
              </span>              
            </div>
        </div>
      </modal>
     </template>

 

</template>

<style>
.print-buton{
  padding: 5px 5px;
  border-radius: 5px;
  background: var(--grad1);
  /* margin-left: 0px 20px; */
}
.add-form-wrapper{
  width: 500px;
  padding: 20px;
  border: 1px solid rgba(255, 255, 255, 0.545);
  margin-top: 100px;
  border-radius: 10px;
  background: var(--grad2);
  box-shadow: 0px 43px 50px #00000061;
}
.add-form-wrapper .form-group{
  padding-bottom: 20px;
}
.class-short-btn{
  border: 1px solid var(--primaryColor);
  padding: 5px 5px;
  text-align: center;
  background-color: #c2840a;
  margin-right: 3px;
  border-radius: 5px;
  color: white;
  margin-bottom: 5px;
}
.class-short-btn.active{
  background-color: #614203;
  border-bottom-color: black;
}
</style>

