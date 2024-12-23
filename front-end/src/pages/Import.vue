<script setup>
import { onMounted, inject, ref } from 'vue';
import Note from '../components/note.vue'
import myTable from '../components/myTable.vue'
import Modal from '../components/modal.vue'
import Barcode from '../components/createBarcode.vue'
import Btn from '../components/Btn.vue'
import FileUpload from '../components/FileUpload.vue'
import BtnLoader from '../components/BtnLoader.vue'



 
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

 


</script>

<template>
     <div class="d-flex justify-content-between mb-4">
          <h1>Import Students</h1>  
          <Btn @click="getBackup" ><i class='bx bxs-file-export' ></i> Export All <BtnLoader v-if="loading"></BtnLoader> </Btn>
     </div>
     <FileUpload></FileUpload>   

</template>

<style>
  
</style>

