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

let router = useRouter()
 
const emitter = inject('emitter');
let http = inject('http'); 
let students = ref([])
let params = ref({
    "page": 1,
    "total": 3,
    "totalPages": 1,
    "limit": 100
})
let addMode = ref(false)
// let filterForm

async function getStudents(){
  try {
    http.get('/students', { params: params.value }).then(response => {
      if(response.status == 200){
        students.value = response.data.data;
        params.value = response.data.pagination;
      }
    })
  } catch (error) {
    console.warn('getStudents_error::', error);
  }
}


async function onSubmit(){
  try {
    http.get('/students/add', { params: {}}).then(response => {
      if(response.status == 200){
        students.value = response.data;
      }
    })
  } catch (error) {
    console.warn('onSubmit_error::', error);
  }
}
getStudents()

 

</script>

<template>
    <div class="d-flex justify-content-between">
      <h1>Students</h1> 
      
      <div class="d-flex justify-content-end">
        <Btn v-if="!addMode" class="me-1" @click="addMode = !addMode" ><i class='bx bx-plus'></i> Add Student</Btn>
        <Btn v-else class="me-1 red" @click="addMode = !addMode" >Cancel</Btn>
        <Btn><i class='bx bxs-file-import' ></i> Import</Btn>
      </div>
    </div>
    
    <!-- Search -->
    <div class="form-area mt-5 p-4 border">
      <form @submit.prevent="onSubmit">
        <div class="row">
          <div class="col-md-3 col-12">
            <div class="form-group">
              <label for="email">Class</label>
              <select class="form-control" id="ClassId" required="required">
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
              <input type="text" class="form-control" id="email">
            </div>
          </div>
          <div class="col-md-3 col-6">
            <div class="form-group">
              <label for="email">Dakhela</label>
              <input type="number" class="form-control" id="email">
            </div>
          </div>
          <div class="col-md-3 col-6">
            <div class="form-group mt-md-3"> 
                <Btn></Btn> 
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
                <td> {{ std.sound1 }} </td> 
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
        <Pagination v-model="params" @jumpToPage="(page) => {
          params.page = page
          getStudents()
        }" ></Pagination>
     </div>
 

</template>

<style>
  
</style>

