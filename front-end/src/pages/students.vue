<script setup>
import { onMounted, inject, ref } from 'vue';
import { useRouter } from 'vue-router';
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

let router = useRouter()
 
const emitter = inject('emitter');
let http = inject('http'); 
let students = ref([])
let params = ref({
    "page": 1,
    "total": 3,
    "totalPages": 1,
    "limit": 100,

    class: null,
    name: null,
    dakhela: null,
    sound1: null,
})
let addMode = ref(false)
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

function toggleLoopItem (data, index, key = "isPlaying") {
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
  params.value.class = null
  params.value.name = null
  params.value.dakhela = null
  params.value.sound1 = null
  getStudents()
}
 
onMounted(()=>{
  getStudents()
})

 

</script>

<template>
    <div class="d-flex justify-content-between">
      <h1>Students</h1> 
      
      <div class="d-flex justify-content-end">
        <!-- <Btn v-if="!addMode" class="me-1" @click="addMode = !addMode" ><i class='bx bx-plus'></i> Add Student</Btn>
        <Btn v-else class="me-1 red" @click="addMode = !addMode" >Cancel</Btn> -->
        <Btn @click="router.push({name: 'import'})"><i class='bx bxs-file-import' ></i> Import</Btn>
      </div>
    </div>
    
    <!-- Search -->
    <div class="form-area mt-5 p-4 border radius-10">
      <form @submit.prevent.stop="getStudents">
        <div class="row">
          <div class="col-md-3 col-12">
            <div class="form-group">
              <label for="email">Class</label>
              <select v-model="params.class" class="form-control" id="ClassId">
                <option value=""></option>
                <option value="Play">Play</option>
                <option value="Nursery">Nursery</option>
                <option value="KG">KG</option>
                <option value="One/Saffe Awal">One/Saffe Awal</option>
                <option value="Two/Saffe Sani">Two/Saffe Sani</option>
                <option value="Three/Saffe Sales">Three/Saffe Sales</option>
                <option value="Four/Saffe Rabe">Four/Saffe Rabe</option>
                <option value="Ibtedaiyah">Ibtedaiyah</option>
                <option value="Mutawassitah Awal / Mizan">Mutawassitah Awal / Mizan</option>
                <option value=">Mutawassitah Sani / Nahbemir">Mutawassitah Sani / Nahbemir</option>
                <option value=">Mutawassitah Sales">Mutawassitah Sales</option>
                <option value=">Sanabiya Awal/Shorhebekaya">Sanabiya Awal/Shorhebekaya</option>
                <option value=">Sanabiya Sani">Sanabiya Sani</option>
                <option value=">Hifz">Hifz</option>
                <option value=">Pre Hifz">Pre Hifz</option>
                <option value=">Fozilat">Fozilat</option>
              </select>
            </div>
          </div>
          <div class="col-md-3 col-12">
            <div class="form-group">
              <label for="email">Name</label>
              <input v-model="params.name" type="text" class="form-control" id="email">
            </div>
          </div>
          <div class="col-md-3 col-12">
            <div class="form-group">
              <label for="email">Dakhela</label>
              <input v-model="params.dakhela" type="number" class="form-control" id="email">
            </div>
          </div>
          <div class="col-md-3 col-12">
            <div class="form-group">
              <label for="email">Media</label>
              <select v-model="params.sound1" class="form-control">
                <option value="">All</option>
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
              <th>Name</th>
              <th>Class</th>
              <th>Dakhela</th>
              <th>Year</th>
              <th>Sound</th>
              <th>Status</th>
              <th>Action</th> 
            </tr>
          </thead>
        </template>
        <template #rows>
          <template v-if="students?.length">
            <template v-for="(std, i) in students">
              <tr>
                <td class="text-left">{{ std.name }}</td>
                <td> {{ std.class }} </td> 
                <td> {{ std.dakhela }} </td> 
                <td> {{ std.year }} </td> 
                <td> 
                  <template v-if="std.sound1">
                    <Btn v-if="!std.isPlaying" @click.stop="toggleLoopItem(students, i)" class="radius-10 sm sound" style="padding: 2px 96px;" >
                      <i class='bx bx-play size-1 transformY-3px'></i>&nbsp;Play
                      <span class="absolute" style="top:5px;right:10px" @click.stop="http.delete(`/students/delete-audio/${std.id}/${'sound1'}`).then(()=>{students.sound1 = null})" >
                        <i class='bx bxs-trash-alt text-danger' ></i>
                      </span> 
                    </Btn>
                    <Player v-else :src="std.sound1" @close="std.isPlaying = false"></Player>
                  </template>  
                  <template v-else>
                    <AudioUpload :student="std" column="sound1" @change="({audio_path, audio_url})=>{
                      std.sound1 = audio_url
                    }" ></AudioUpload>
                  </template>  
                </td> 
                <td> <Switch size="sm" v-model="std.status" @change="async (status) => {
                  await http.post('/students/update-status', {id: std.id, status} );
                
                }"></Switch> </td> 
                <td> 
                  <div class="d-flex">

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

<style>
  
</style>

