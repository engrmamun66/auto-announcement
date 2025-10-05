<script setup>
import moment from 'moment/moment'
import { onMounted, inject, ref, watch, computed, onBeforeUnmount } from 'vue';
import Note from '../components/note.vue'
import myTable from '../components/myTable.vue'
import Modal from '../components/modal.vue' 
import Btn from '../components/Btn.vue'
import FileUpload from '../components/FileUpload.vue'
import Switch from '../components/Switch.vue'
import BtnLoader from '../components/BtnLoader.vue'
import BarcodeScannigAnimation from '../components/BarcodeScannigAnimation.vue'
import EmergencyMode from '../components/EmergencyMode.vue'
import PlayingAnimation from '../components/PlayingAnimation.vue'
import SwitchBoard from '../components/SwitchBoard.vue'
import Confirm from '../components/Confirm.vue'
import helper from '../utilities/helper';


 
const route = inject('route');
const router = inject('router');
const emitter = inject('emitter');
const storage = inject('storage');
const http = inject('http');
const is_started_schedule = inject('is_started_schedule');
const stop_clear_and_reload = inject('stop_clear_and_reload');
const speakText = inject('speakText');
const callbacks = inject('callbacks');
const getSchedules = inject('getSchedules');
const pushTheBarcode = inject('pushTheBarcode');
const makeCarcode = inject('makeCarcode');
const appUseForbiddened = inject('appUseForbiddened');
const showSwithBoardModal = inject('showSwithBoardModal');
const borad_image_url = inject('borad_image_url');
const CONFIG = inject('CONFIG');
const switches_PreviewInHomePage = inject('switches_PreviewInHomePage');
const isUsingSpeakerAutoControl = inject('isUsingSpeakerAutoControl');
const isSpeakersAutoMode = inject('isSpeakersAutoMode');

const log = console.log

const classes = inject('classes');
const wattingList = inject('wattingList');

let toggleSettings = inject('toggleSettings') 
let refreshDOM = inject('refreshDOM') 

 
  

let tab = ref(1) 

onMounted(()=>{
 
 
})
 
</script>

<template>


     <div class="sections mt-3">
          <h1>HEloo</h1>
          
           
     </div> 
     

</template>


<style>
 
.sections {
  display: flex;
  gap: 20px;
  /* justify-content: space-between; */
}
.sections > .single-section {
  height: calc(100vh - 163px);
  border-radius: 10px;
  padding: 15px;
  background-color: rgba(255, 255, 255, 0.382);
}
 
</style>
