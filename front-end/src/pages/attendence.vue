<script setup>
import moment from 'moment/moment'
import { onMounted, inject, ref, watch, computed, onBeforeUnmount } from 'vue';
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

     <ul class="nav nav-tabs mt-4 mb-3">
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
      </transition>


      
     

</template>


<style>

/* we will explain what these classes do next! */
.v-enter-active,
.v-leave-active {
  transition: opacity 0.5s ease;
}

.v-enter-from,
.v-leave-to {
  opacity: 0;
}
 
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
