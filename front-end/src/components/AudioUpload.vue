<template> 
    <div class="card bg1">
        <div class="drop_box">        
        <input v-if="fileInputField" ref="uploader" @change="onChangeFile" type="file" hidden accept="audio/*" id="fileID" style="display:none;" >
        <Btn v-if="!file?.name" class="xsm" style="padding: 2px 88px;" @click="open" >Choose&nbsp;File 
          <BtnLoader v-if="loading"></BtnLoader>
        </Btn>
        
        </div>  
    </div> 
</template>

<script setup>
import Btn from './Btn.vue'
import { ref, inject } from "vue";
import { useRouter } from "vue-router";
let http = inject('http'); 
let emitter = inject('emitter'); 
import BtnLoader from './BtnLoader.vue'

let props = defineProps(['student', 'column'])
let emits = defineEmits(['change']) 

let uploader = ref(null)
let file = ref(null)
let loading = ref(false)
let fileInputField = ref(true)

function open(){
    uploader.value.click()
}

function onChangeFile(event){
  const fileInput = event.target;
  if (fileInput.files && fileInput.files[0]) {
    file.value = fileInput.files[0];
    uploadNow()
  }
}

async function uploadNow(){
  let { id } = props.student
  if(file.value){    
    loading.value = true
    http.post('/students/upload-audio', {id, file: file.value, column: props.column}, {formData: true}).then(response => {
      emitter.emit('toaster-success', {message: 'Audio uploaded'})
      file.value = null;
      emits('change', response.data)

    }).finally(()=>{
      fileInputField.value = false
      setTimeout(() => {
        loading.value = false       
        fileInputField.value = true       
      }, 500); 
    })
  }
}


</script>

<style scoped> 
 
.card {
  border-radius: 10px; 
  width: 100%;
  padding: 5px 3px;
}

.card h3 {
  font-size: 16px;
  font-weight: 600;
  
}

.drop_box {
  margin: 0;
  padding: 0px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
  border-radius: 5px;
}

.drop_box h4 {
  font-size: 16px;
  font-weight: 400;
  color: #2e2e2e;
}

.drop_box p {
  margin-top: 0px;
  margin-bottom: 0px;
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