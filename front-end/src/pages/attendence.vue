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
       <li class="nav-item">
        <input ref="SearchBox" type="text" placeholder="Search by Name/ID" class="cb-text-input py-1 px-2 radius-5">
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


<style scoped>
 
.cb-text-input{
  border: 1px solid #ffffff61;
  height: 38px;
  border-radius: 30px;
  margin-left: 20px;
  padding: 2px 20px !important;
  background: #f0f0f0;
  box-shadow: 1px 1px 2px #0000006e, inset 1px 1px 2px #0000006e;
}
 
</style>
