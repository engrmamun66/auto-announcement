<script setup>
import { onMounted, inject, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import Note from '../components/note.vue'
import myTable from '../components/myTable.vue'
import Modal from '../components/modal.vue'
import Barcode from '../components/createBarcode.vue'
import Btn from '../components/Btn.vue'
import FileUpload from '../components/FileUpload.vue'
import BtnLoader from '../components/BtnLoader.vue'


const emitter = inject('emitter');
let http = inject('http'); 
let moment = inject('moment'); 
const helper = inject('helper');
const getAllStudents = inject('getAllStudents');
let loading = ref(false);

 


async function eraseAll() {
     try {
          let confi = confirm(helper.t('Do you want to delete all students?'))
          if(!confi) return
          let passKey = prompt(helper.t('Type passcode to confirm'))
          if(!['DD', 'dd', 'delete'].includes(passKey)) {
               alert(helper.t('Wrong passcode!'))
               return
          }
          http.get('/students/erase-all').then(response => {
               if(response.status == 200){
                    emitter.emit('toaster-success', {message: helper.t('All students have been deleted')})
               }
               getAllStudents()
          })
     } catch (error) {
          
     }
}
 
</script>

<template>
     <div class="d-flex justify-content-between align-items-center mb-4">
          <h1>{{ helper.t('Import Students') }}</h1>
          <div class="right-align" >
               <!-- <Btn v-if="useRoute().query.dev == 'true'" @click="eraseAll" class="red me-1" ><i class='bx bxs-eraser' ></i> {{ helper.t('Delete All Students') }} <BtnLoader v-if="loading"></BtnLoader> </Btn> -->
               <Btn @click="eraseAll" v-if="true" class="red me-1" ><i class='bx bxs-eraser' ></i> {{ helper.t('Delete All Students') }} <BtnLoader v-if="loading"></BtnLoader> </Btn>
               <Btn @click="getBackup" ><i class='bx bxs-file-export' ></i> {{ helper.t('Export All') }} <BtnLoader v-if="loading"></BtnLoader> </Btn>

          </div>
     </div>
     <FileUpload></FileUpload>  


</template>

 
