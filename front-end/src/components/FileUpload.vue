<template> 
    <div class="card bg1">
        <h3>Upload Files</h3>
        <div class="drop_box">
        <header>
            <h4>{{file ? file?.name : 'Select File here'}}</h4>
        </header>
        <p>Files Supported: excel</p>
        <input ref="uploader" @change="onChangeFile" type="file" hidden accept=".xlsx,.xls,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/vnd.ms-excel"   id="fileID" style="display:none;">
        <Btn v-if="!file"  @click="open" >Choose File</Btn>
        <Btn v-else  @click="uploadNow" >Upload Now</Btn>
        <a :href="`${VITE_BASE_URL}/sample.xlsx`" class="mt-2">Download Sample File</a>
        </div>  
    </div> 
</template>

<script setup>
import Btn from './Btn.vue'
import { ref } from "vue";

let { VITE_BASE_URL } = import.meta.env

let log = console.log
let uploader = ref(null)
let file = ref(null)

function open(){
    uploader.value.click()
}

function onChangeFile(event){
  const fileInput = event.target;
  if (fileInput.files && fileInput.files[0]) {
    file.value = fileInput.files[0]; 
  }
}

function uploadNow(){
  if(file.value){
    console.log('sdfdfdf');
  }
}


</script>

<style scoped> 
 
.card {
  border-radius: 10px; 
  width: 100%;
  padding: 10px 30px 40px;
}

.card h3 {
  font-size: 22px;
  font-weight: 600;
  
}

.drop_box {
    margin: 10px 0;
    padding: 30px;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-direction: column;
    border: 1px dashed var(--borderColor);
    border-radius: 5px;
}

.drop_box h4 {
  font-size: 16px;
  font-weight: 400;
  color: #2e2e2e;
}

.drop_box p {
  margin-top: 10px;
  margin-bottom: 20px;
  font-size: 12px;
  
}

.btn {
  text-decoration: none;
  background-color: #005af0;
  color: #ffffff;
  padding: 10px 20px;
  border: none;
  outline: none;
  transition: 0.3s;
}

.btn:hover{
  text-decoration: none;
  background-color: #518ffb;
  color: #ffffff;
  padding: 10px 20px;
  border: none;
  outline: 1px solid #010101;
}

.form input {
  margin: 10px 0;
  width: 100%;
  background-color: #e2e2e2;
  border: none;
  outline: none;
  padding: 12px 20px;
  border-radius: 4px;
}

</style>