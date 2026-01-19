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
let loading = ref(false);

async function getBackup(){
     loading.value = true;
     try {
          let response = await http.get('/students/export', {responseType: "blob"})
          const url = window.URL.createObjectURL(new Blob([response.data]));
          const link = document.createElement("a");
          link.href = url;

          // Set the downloaded file name
          link.setAttribute("download", "students_export.xlsx");

          // Append the link to the document, trigger download, and clean up
          document.body.appendChild(link);
          link.click();
          link.remove();
          window.URL.revokeObjectURL(url);
          setTimeout(() => {
               loading.value = false;
          }, 500);

     } catch (error) {
          loading.value = false;
     }
}


async function eraseAll() {
     try {
          let confi = confirm('Delete all students from DB. Are you sure?')
          if(!confi) return
          let passKey = prompt('Type passcode to confirm')
          if(!['DD', 'dd', 'delete'].includes(passKey)) {
               alert('Wrong passcode!')
               return
          }
          http.get('/students/erase-all').then(response => {
               if(response.status == 200){
                    emitter.emit('toaster-success', {message: 'সব ছাত্র মুছে ফেলা হয়েছে'})
               }
          })
     } catch (error) {
          
     }
}

let backupLinks = ref([])

function getBackupDetails() {
     try {
          http.get('/backup-list').then(response => {
               if(response.status == 200){
                    let dataObject = response.data.data
                    if(dataObject && typeof dataObject === 'object'){
                         let linkArray = Object.entries(dataObject).map(([key, value]) => {
                              return ({filename: key, ...value})
                         })
                         linkArray.forEach(item => {
                              if(item.filename.endsWith('-2.zip')){
                                   item['label'] = 'Latest'
                                   backupLinks.value[0] = item
                              }
                              else if(item.filename.endsWith('-1.zip')){
                                   item['label'] = 'Older'
                                   backupLinks.value[1] = item
                              }
                              else {
                                   item['label'] = 'Oldest'
                                   backupLinks.value[2] = item
                              }
                         }) 
                    }
               }
          })
     } catch (error) {
          
     }
}

onMounted(() => {
     getBackupDetails()
})
 

</script>

<template>
     <div class="d-flex justify-content-between align-items-center mb-4">
          <h1>Import Students</h1>  
          <div class="right-align" >
               <!-- <Btn v-if="useRoute().query.dev == 'true'" @click="eraseAll" class="red me-1" ><i class='bx bxs-eraser' ></i> Delete All Students <BtnLoader v-if="loading"></BtnLoader> </Btn> -->
               <Btn @click="eraseAll" v-if="useRoute().query.dev == 'true'" class="red me-1" ><i class='bx bxs-eraser' ></i> Delete All Students <BtnLoader v-if="loading"></BtnLoader> </Btn>
               <Btn @click="getBackup" ><i class='bx bxs-file-export' ></i> Export All <BtnLoader v-if="loading"></BtnLoader> </Btn>

          </div>
     </div>
     <FileUpload></FileUpload>  

     <template v-if="backupLinks?.length && false">

          <div class="d-flex flex-column align-items-center">
               <h1 class="text-start mt-3">Downlaod Backups Here</h1>  
           
               <ul class="backups">
                    <template v-for="backup in backupLinks">
                         <li> 
                              <strong class="me-2">{{ backup?.label }}</strong>
                              <a :href="backup.download_url || backup?.donwload_url || ''" :download="backup.filename" target="_top">{{ backup.filename }}  </a> 
                              <span class="ms-2">{{ moment(backup?.created).format('Y-MM-DD hh:mm:ss A - (dddd)') }}</span>
                         </li>
                    </template>
               </ul>
          </div>
     </template>
 



</template>

<style scoped>
ul.backups li{
     line-break: anywhere;
     margin-bottom: 5px;
}
</style>

