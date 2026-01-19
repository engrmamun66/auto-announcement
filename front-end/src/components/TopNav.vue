<template>
    <div class="topnav bg3" id="myTopnav">
        <a ref="logo_wrapper" class="madrasha-title logo-area" :href="CONFIG?.settings?.attendance?.only_attendance_feature === true ? '#/attendence' : '#'">
            <img alt="site-logo" ref="logoEl" id="LOGO" src="" style="width: 200px;">
          </a>
        <template v-if="!CONFIG?.settings?.attendance?.only_attendance_feature">
          <RouterLink :to="{name: 'home', query: {[route?.query?.dev ? 'dev' : '']: route?.query?.dev}}" :class="{'active': route.name === 'home'}"><i class='bx bxs-home pre-icon'></i> Dashboard</RouterLink>
        </template>
        <template v-if="CONFIG?.settings?.attendance?.status">
          <RouterLink :to="{name: 'attendence', query: {[route?.query?.dev ? 'dev' : '']: route?.query?.dev}}" :class="{'active attendence-tab': route.name === 'attendence'}"><i class='bx bx-user-pin pre-icon'></i> Attendence</RouterLink>
        </template>
        <RouterLink :to="{name: 'students', query: {[route?.query?.dev ? 'dev' : '']: route?.query?.dev}}" :class="{'active students-tab': route.name === 'students'}"><i class='bx bxs-user pre-icon'></i> Students</RouterLink>
        <RouterLink :to="{name: 'shedules', query: {[route?.query?.dev ? 'dev' : '']: route?.query?.dev}}" :class="{'active': route.name === 'shedules'}"><i class='bx bxs-calendar pre-icon' ></i> Shedules</RouterLink>
        <RouterLink :to="{name: 'import', query: {[route?.query?.dev ? 'dev' : '']: route?.query?.dev}}" :class="{'active': route.name === 'import'}"><i class='bx bxs-file-import pre-icon' ></i> Import</RouterLink>
        <RouterLink :to="{name: 'ContactUs', query: {[route?.query?.dev ? 'dev' : '']: route?.query?.dev}}" :class="{'active': route.name === 'ContactUs'}">Contact</RouterLink>
        <a v-if="useRoute().query.dev === 'true'">
          <Btn class="border" @click.prevent.stop="show_bulk_attedance_component = true"> Bulk Attendance </Btn>
        </a>
        
        
    </div>
</template>

<script setup>
import { ref, inject, onMounted } from 'vue';
import { RouterLink, useRoute } from 'vue-router';
import Btn from './Btn.vue'


let logoEl = ref(null)
let logo_wrapper = ref(null)
let route = useRoute()

const emitter = inject('emitter'); 
const CONFIG = inject('CONFIG'); 
const show_bulk_attedance_component = inject('show_bulk_attedance_component'); 

onMounted(()=>{
  if(typeof GLOBAL_DATA !== 'undefined'){
    if(GLOBAL_DATA?.logo){
      logoEl.value.src = GLOBAL_DATA.logo
      logoEl.value.style.width = GLOBAL_DATA.logo_width
      logo_wrapper.value.style.padding = GLOBAL_DATA.logo_area_padding || '14px 33px' 
    }
  }
})


</script>

<style scoped>
.madrasha-title {
  background: #f8f9fa;
  color: #ff0;
  font-size: 17px;
  text-shadow: 1px 2px 2px rgb(0,0,0);
  margin-right: 10px;
  border-top-left-radius: 0px;
  border-top-right-radius: 0px;
}

.topnav {
  padding-left: 20px;
  overflow: hidden;
  background-color: #333; /* Add background color */
}

.topnav .pre-icon{
  transform: translateY(2px);
  font-size: 18px;
}

.topnav a {
  float: left;
  display: block;
  color: white;
  text-align: center;
  padding: 14px 33px;
  text-decoration: none;
  font-size: 17px;
  font-weight: bold;
  position: relative;
}

.topnav a:not(.madrasha-title):active {
  background-color: #ffffffa7 !important;
  color: rgb(240, 237, 84);
}

.topnav a:not(.madrasha-title):hover {
  background-color: #ffffff21;
  color: rgb(240, 237, 84);
}

.topnav a.active:not(.madrasha-title)::after,
.topnav a:not(.madrasha-title):hover::after {
  position: absolute;
  content: '';
  bottom: 0px;
  left: 0px;
  height: 2px;
  width: 100%;
  background-color: rgb(255, 255, 255);
}

.topnav .icon {
  display: none;
}

.topnav.responsive {
  position: relative;
}

.topnav.responsive .icon {
  display: block;
  float: right;
  position: absolute;
  top: 0;
  right: 0;
}

.topnav.responsive a {
  float: none;
  display: block;
  text-align: left;
}

.right-lnk {
  float: right;
}

@media screen and (max-width: 600px) {  

  .topnav.responsive a {
    display: block;
    text-align: left;
  }

  .topnav.responsive .icon {
    display: block;
  }

  .topnav.responsive a.active {
    display: block;
  }
}
</style>
