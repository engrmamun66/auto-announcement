<script setup>
import { onMounted, inject, ref } from 'vue';
import Note from '../components/note.vue'
import myTable from '../components/myTable.vue'
import Modal from '../components/modal.vue'
import Barcode from '../components/createBarcode.vue'
import Btn from '../components/Btn.vue'
import FileUpload from '../components/FileUpload.vue'

 
const emitter = inject('emitter');
let http = inject('http'); 



 

</script>

<template>
     <h1>Import Students (excel file)</h1>  
     <FileUpload></FileUpload>   

</template>

<style>
  
</style>

