<script setup>
import moment from 'moment/moment'
import { onMounted, inject, ref, watch, computed, onBeforeUnmount, reactive } from 'vue';
import AttendencesAll from './attendence-childs/AttendencesAll.vue'
import RealtimeAttendences from './attendence-childs/RealtimeAttendences.vue'
import BaseSelectMultiple from './../components/BaseSelectMultiple.vue'
import EmDateTimePicker from './../components/EmDateTimePicker.vue'
import Btn from './../components/Btn.vue'
import Ahelper from './attendence-childs/attendacnceHelper';
 
const route = inject('route');
const router = inject('router');
const emitter = inject('emitter');
const storage = inject('storage');
const http = inject('http'); 

const log = console.log

const CONFIG = inject('CONFIG');
const classes = inject('classes');
const attendenceList = inject('attendenceList');
const liveAttendenceList = inject('liveAttendenceList');

let tab = ref(Number(storage('attendance_tab').value || '1'))  
watch(tab, (index) => {
  storage('attendance_tab').value = index
})
  


onMounted(()=>{
 
 
})
 
</script>

<template>

  <div class="page-contents">
    <div class="d-flex justify-content-between align-items-center">
      <ul class="nav nav-tabs mt-0 mb-3 bottom-borderless">
         <li class="nav-item">
           <a @click.stop="tab = 1" @auxclick.stop="clearAllAndRelaod()" class="nav-link cp text-black" :class="{'active': tab==1}" >Realtime&nbsp;Attendence</a>
         </li>
         <li class="nav-item">
           <a @click.stop="tab = 2" class="nav-link cp text-black" :class="{'active': tab==2}" >Attendence&nbsp;History</a>
         </li>   
      </ul>
      <div v-if="tab==1">
        <div class="d-flex justify-content-center align-items-center gap-2">
            <Btn class="white">In: <span class="badge text-white bg-secondary">{{ Ahelper.count.in(liveAttendenceList) }}</span></Btn>
            <Btn class="white">Out: <span class="badge text-white bg-warning">{{ Ahelper.count.out(liveAttendenceList) }}</span></Btn>
            <Btn class="white">Late: <span class="badge text-white bg-danger">{{ Ahelper.count.late(liveAttendenceList) }}</span></Btn>
            <Btn class="white">Total: <span class="badge text-white bg-success">{{ liveAttendenceList?.length }}</span></Btn>
        </div>
      </div>   

    </div>
  
     <transition>
       <template v-if="tab == 1">
           <RealtimeAttendences ></RealtimeAttendences>
       </template>
       <template v-else-if="tab == 2">
           <AttendencesAll ></AttendencesAll>
       </template>
     </transition>
  </div>



      
     

</template>


<style scoped>
 

 
</style>
