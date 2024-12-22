<script setup>
import { onMounted, inject, ref } from 'vue';
import Note from '../components/note.vue'
import myTable from '../components/myTable.vue'
import Modal from '../components/modal.vue'
import Barcode from '../components/createBarcode.vue'
import Btn from '../components/Btn.vue'
import FileUpload from '../components/FileUpload.vue'

 
const emitter = inject('emitter');
let showModal = ref(false)


function printDiv(divId) {
  const content = document.getElementById(divId).innerHTML;
  const printWindow = window.open('', '_blank');
  printWindow.document.open();
  printWindow.document.write(`
    <html>
      <head>
        <title>Print</title>
        <style>
          /* Add styles here for the printed content */
          body { font-family: Arial, sans-serif; margin: 20px; }
        </style>
      </head>
      <body>
        ${content}
      </body>
    </html>
  `);
  printWindow.document.close();
  printWindow.focus();
  printWindow.print();
  printWindow.close();
}


</script>

<template>
     <h1>Import Students (excel file)</h1>    

 
    <FileUpload></FileUpload>
<!-- 
     <hr v-for="x in 100" >

     <h3 id="TEST">asdf</h3> -->

</template>

<style>
  
</style>

