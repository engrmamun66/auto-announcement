<script setup>
import moment from 'moment/moment'
import { onMounted, inject, ref, watch, computed, onBeforeUnmount } from 'vue';
import AttendencesAll from './attendence-childs/AttendencesAll.vue'
import RealtimeAttendences from './attendence-childs/RealtimeAttendences.vue'
 
const route = inject('route');
const router = inject('router');
const emitter = inject('emitter');
const storage = inject('storage');
const http = inject('http'); 

const log = console.log

const CONFIG = inject('CONFIG');
const classes = inject('classes');
const attendenceList = inject('attendenceList');

let tab = ref(1) 

 
  


onMounted(()=>{
 
 
})
 
</script>

<template>

  <div class="page-contents">

    <ul class="nav nav-tabs mt-0 mb-3">
       <li class="nav-item">
         <a @click.stop="tab = 1" class="nav-link cp text-black" :class="{'active': tab==1}" >Realtime&nbsp;Attendence</a>
       </li>
       <li class="nav-item">
         <a @click.stop="tab = 2" class="nav-link cp text-black" :class="{'active': tab==2}" >Attendence&nbsp;History</a>
       </li> 
     </ul>
  
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


<styles scoped>
 
 
 
</styles>
