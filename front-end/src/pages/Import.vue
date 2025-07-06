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


let router = useRouter()
 
const emitter = inject('emitter');
let http = inject('http'); 
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
          let confi = confirm('Deelete all data')
          if(!confi) return
          http.get('/students/erase-all').then(response => {
               if(response.status == 200){
                    emitter.emit('toaster-success', {message: 'সব ছাত্র মুছে ফেলা হয়েছে'})
               }
          })
     } catch (error) {
          
     }
}
 

console.log(useRoute());
</script>

<template>
     <div class="d-flex justify-content-between mb-4">
          <h1>Import Students</h1>  
          <div class="right-align" >
               <Btn v-if="useRoute().query.dev == 'true'" @click="eraseAll" class="red me-1" ><i class='bx bxs-eraser' ></i> Erase All <BtnLoader v-if="loading"></BtnLoader> </Btn>
               <Btn @click="getBackup" ><i class='bx bxs-file-export' ></i> Export All <BtnLoader v-if="loading"></BtnLoader> </Btn>

          </div>
     </div>
     <FileUpload></FileUpload>   

</template>

<style>
  
</style>

