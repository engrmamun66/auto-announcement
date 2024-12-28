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

let route = useRoute()
let router = useRouter()
 
const emitter = inject('emitter');
const printDiv = inject('printDiv');
const makeCarcode = inject('makeCarcode');
const helper = inject('helper');
const classes = inject('classes');
let http = inject('http'); 
let students = ref([])
let params = ref({
    "page": 1,
    "total": 3,
    "totalPages": 1,
    "limit": 100,

    class: null,
    name: null,
    dakhela: route.query?.dakhela || null,
    sound1: null,
})
let addMode = ref(false)
let showSearchForm = ref(true)
let targetStd = ref(null)
let columnName = ref('sound1')
let targetStdForBarcode = ref(null)
// let filterForm

async function getStudents(){
  try {
    http.get('/students', { params: params.value }).then(response => {
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
 
async function clearParams(){

  params.page = 1
  params.total = 3
  params.totalPages = 1
  params.limit = 100

    
  params.value.class = null
  params.value.name = null
  params.value.dakhela = null
  params.value.sound1 = null
  getStudents()
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
 
onMounted(()=>{
  getStudents()
})

 

</script>

<template>
    <div class="d-flex justify-content-between">
      <h1>{{ !addMode ? 'Students' : 'Add Student'}}</h1> 
      
      <div class="d-flex justify-content-end">
        <Btn @click="showSearchForm = !showSearchForm" class="me-2"><i class='bx bx-search transformY-2px size-1' ></i> {{ showSearchForm ? "Hide" : 'Show' }} search</Btn>
        <Btn v-if="!addMode" class="me-2" @click="addMode = !addMode" ><i class='bx bx-plus'></i> Add Student</Btn>
        <Btn v-else class="me-2 red" @click="addMode = !addMode" >Cancel</Btn>
        <!-- <Btn @click="router.push({name: 'import'})"><i class='bx bxs-file-import' ></i> Import</Btn> -->
      </div>
    </div>

    <template v-if="addMode">
      <form @submit.prevent="addStudent()">
        <div class="row">

        </div>
      </form>
    </template>
    <template v-else>
      
      <!-- Search -->
      <div v-if="showSearchForm" class="form-area mt-3 p-4 border radius-10">
        <form @submit.prevent.stop="getStudents">
          <div class="row">
            <div class="col-md-3 col-12">
              <div class="form-group">
                <label for="email">Class</label>
                <select v-model="params.class" class="form-control" id="ClassId">
                  <option :value="null">-class-</option>
                  <template v-for="(cls, index) in classes" :key="index">
                    <option :value="cls.class_name">{{cls.class_name}}</option>
                  </template>
                  
                </select>
              </div>
            </div>
            <div class="col-md-3 col-12">
              <div class="form-group">
                <label for="email">Name</label>
                <input v-model="params.name" type="text" class="form-control">
              </div>
            </div>
            <div class="col-md-3 col-12">
              <div class="form-group">
                <label for="email">Dakhela</label>
                <input v-model="params.dakhela" type="number" class="form-control">
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
                    <Btn    class="me-1"></Btn> 
                    <Btn @click.stop="clearParams" class="me-1 red">Clear</Btn> 
                  </div>
              </div>
            </div>
          </div>
          
           
       
          
        </form>
      </div>
  
      
  
       <myTable>
          <template #thead>
            <thead>
              <tr>
                <th>Class</th>
                <th>Name</th>
                <th>Dakhela</th>
                <th>Year</th>
                <th>Sound</th>
                <th>Sound-2</th>
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
                  <td class="text-left">{{ std.name }}</td>
                  <td> {{ std.dakhela }} </td> 
                  <td> {{ std.year }} </td> 
                  <template v-for="column in ['sound1', 'sound2']">
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
          
                    </div>
                  </td> 
              </tr> 
  
              
               
              </template>
            </template>
            <template v-else>
              <tr>
                  <td colspan="88">No student found</td>                 
              </tr>
            </template>
          </template>
       </myTable>
  
       <div class="d-flex justify-content-center">
          <Pagination v-if="params?.totalPages > 1" v-model="params" @jumpToPage="(page) => {
            params.page = page
            getStudents()
          }" ></Pagination>
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
</style>

