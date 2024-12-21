<script setup>
import { onMounted, inject, ref } from 'vue';
import Note from '../components/note.vue'
import myTable from '../components/myTable.vue'
import Modal from '../components/modal.vue'
import Barcode from '../components/createBarcode.vue'

let script_js = `<link rel="stylesheet" href="http://localhost:3200/assets/em-datetimepicker-documentaion.min.css">`
let script_file = `<script src="http://localhost:3200/assets/em-datetimepicker-documentaion.min.js">` + '<' + '/' + 'script' + '>'
 
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
     <h1>Introduction</h1> 

     <div class="btn btn-success" @click="showModal=true">SHOW MODAL</div>


     <myTable></myTable>
     <Modal v-model="showModal"></Modal>
     
     <div id="contentToPrint">
          <Barcode data="play-1-2025/05/15" ></Barcode>
     </div>

          

     <button @click="printDiv('contentToPrint')">Print</button>



      

<!-- 
     <hr v-for="x in 100" >

     <h3 id="TEST">asdf</h3> -->

</template>

<style>
  
</style>

