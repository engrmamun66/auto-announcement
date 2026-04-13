<template>
  <header class="topnav bg3" id="myTopnav">
    <a ref="logo_wrapper" class="madrasha-title logo-area" :href="CONFIG?.settings?.attendance?.only_attendance_feature === true ? '#/attendence' : '#'">
      <img alt="site-logo" ref="logoEl" id="LOGO" src="" class="topnav__logo">
    </a>

    <span v-if="isIPAccess" @click="sendRemoteAction()" class="topnav__wifi" :class="is_connected_with_main_app ? 'topnav__wifi--on' : 'topnav__wifi--off'"
      :tooltip="is_connected_with_main_app ? 'Connected to main app' : 'Not connected to main app'" flow="down">
      <i :class="is_connected_with_main_app ? 'bx bx-wifi' : 'bx bx-wifi-off'"></i>
    </span>
    <span v-if="isIPAccess && is_connected_with_main_app" class="topnav__wifi" :class="!main_app_user_is_active ? 'topnav__wifi--on' : 'topnav__wifi--off'"
      :tooltip="main_app_user_is_active ? 'Main app is busy' : 'You can control remotely'" flow="down">
      <i class="bx bx-mouse"></i>
    </span>
 

    <span v-if="!isIPAccess && !isUserActive" class="topnav__wifi topnav__wifi--on"
      tooltip="User is not active" flow="down">
      <i class='bx bx-loader-circle topnav__hypnotize'></i>
    </span>

    <button class="topnav__toggle" type="button" @click="isOpen = !isOpen" aria-label="Toggle navigation">
      <i class='bx bx-menu'></i>
    </button>

    <nav class="topnav__links" :class="{ 'is-open': isOpen }">
      <template v-if="!CONFIG?.settings?.attendance?.only_attendance_feature">
        <RouterLink id="nav-link-home" :to="{name: 'home', query: {[route?.query?.dev ? 'dev' : '']: route?.query?.dev}}" :class="{'active': route.name === 'home'}" @click="sendRemoteAction({from: 'ip', action: 'onClick', selector: '#nav-link-home'})">
          <i class='bx bxs-home pre-icon'></i> Dashboard
        </RouterLink>
      </template>
      <template v-if="CONFIG?.settings?.attendance?.status">
        <RouterLink id="nav-link-attendence" :to="{name: 'attendence', query: {[route?.query?.dev ? 'dev' : '']: route?.query?.dev}}" :class="{'active attendence-tab': route.name === 'attendence'}" @click="sendRemoteAction({from: 'ip', action: 'onClick', selector: '#nav-link-attendence'})">
          <i class='bx bx-user-pin pre-icon'></i> Attendence
        </RouterLink>
      </template>
      <RouterLink id="nav-link-students" :to="{name: 'students', query: {[route?.query?.dev ? 'dev' : '']: route?.query?.dev}}" :class="{'active students-tab': route.name === 'students'}" @click="sendRemoteAction({from: 'ip', action: 'onClick', selector: '#nav-link-students'})">
        <i class='bx bxs-user pre-icon'></i> Students
      </RouterLink>
      <RouterLink id="nav-link-shedules" :to="{name: 'shedules', query: {[route?.query?.dev ? 'dev' : '']: route?.query?.dev}}" :class="{'active': route.name === 'shedules'}" @click="sendRemoteAction({from: 'ip', action: 'onClick', selector: '#nav-link-shedules'})">
        <i class='bx bxs-calendar pre-icon' ></i> Shedules
      </RouterLink>
      <RouterLink id="nav-link-import" :to="{name: 'import', query: {[route?.query?.dev ? 'dev' : '']: route?.query?.dev}}" :class="{'active': route.name === 'import'}" @click="sendRemoteAction({from: 'ip', action: 'onClick', selector: '#nav-link-import'})">
        <i class='bx bxs-file-import pre-icon' ></i> Import
      </RouterLink>
      <RouterLink id="nav-link-contact" :to="{name: 'ContactUs', query: {[route?.query?.dev ? 'dev' : '']: route?.query?.dev}}" :class="{'active': route.name === 'ContactUs'}" @click="sendRemoteAction({from: 'ip', action: 'onClick', selector: '#nav-link-contact'})">
        Contact
      </RouterLink>

      <div v-if="useRoute().query.dev === 'true'" class="topnav__dev">
        <span class="border cp me-1 text-white px-1 size-08" @click.prevent.stop="$goto({name: 'env'})">
          <span tooltip="Show Config.js" flow="left">Config</span>
        </span>
        <span class="border cp me-1 text-white px-1 size-08" @click.prevent.stop="show_bulk_attedance_component = true">
          <span tooltip="Bulk Attendence" flow="left">Bulk</span>
        </span>
        <span class="border cp me-0 text-white px-1 size-08" @click.prevent.stop="show_cloner_component = true">
          <span tooltip="Clone Students" flow="left">Clone</span>
        </span>
      </div>
    </nav>
  </header>
  <cloneStudents v-if="show_cloner_component" @unmount="show_cloner_component = false"></cloneStudents>
</template>

<script setup>
import { ref, inject, onMounted, watch, onBeforeUnmount } from 'vue';
import { RouterLink, useRoute, useRouter } from 'vue-router';
import Btn from './Btn.vue'
import cloneStudents from './cloneStudents.vue'


let logoEl = ref(null)
let logo_wrapper = ref(null)
let route = useRoute()
let router = useRouter()
let isOpen = ref(false)

// Close menu on route change (after clicking a nav link on mobile)
watch(() => route.path, () => { isOpen.value = false })

// Close menu on outside click
function onOutsideClick(e) {
  const header = document.getElementById('myTopnav')
  if (isOpen.value && header && !header.contains(e.target)) {
    isOpen.value = false
  }
}
onMounted(() => document.addEventListener('click', onOutsideClick))
onBeforeUnmount(() => document.removeEventListener('click', onOutsideClick))

const emitter = inject('emitter'); 
const CONFIG = inject('CONFIG'); 
const isIPAccess = inject('isIPAccess'); 
const isUserActive = inject('isUserActive'); 
const main_app_user_is_active = inject('main_app_user_is_active'); 
const sendRemoteAction = inject('sendRemoteAction'); 
const is_connected_with_main_app = inject('is_connected_with_main_app'); 
const show_bulk_attedance_component = inject('show_bulk_attedance_component'); 
let show_cloner_component = ref(false)

 

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
  margin-right: 12px;
  border-top-left-radius: 0px;
  border-top-right-radius: 0px;
}

.topnav__wifi {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 34px;
  height: 34px;
  border-radius: 50%;
  font-size: 18px;
  flex-shrink: 0;
}
.topnav__wifi--on  { color: #4caf50; background: rgba(76,175,80,0.15); }
.topnav__wifi--off { color: #f44336; background: rgba(244,67,54,0.15); }

.topnav__hypnotize {
  animation: hypno-spin 1.2s linear infinite;
}
@keyframes hypno-spin {
  from { transform: rotate(0deg); }
  to   { transform: rotate(360deg); }
}

.topnav {
  padding: 8px 16px;
  display: flex;
  align-items: center;
  gap: 10px;
  background-color: #333;
  flex-wrap: wrap;
  position: sticky;
  top: 0;
  z-index: 100;
}

.topnav .pre-icon{
  transform: translateY(2px);
  font-size: 18px;
}

.topnav__logo{
  width: 200px;
}

.topnav__toggle{
  border: 1px solid #3f3f46;
  background: #1f2937;
  color: #ffffff;
  width: 42px;
  height: 42px;
  border-radius: 10px;
  display: none;
  align-items: center;
  justify-content: center;
  font-size: 22px;
}

.topnav__links{
  display: flex;
  align-items: center;
  gap: 6px;
  flex: 1 1 auto;
  flex-wrap: wrap;
}

.topnav__links a {
  color: white;
  text-align: center;
  padding: 10px 16px;
  text-decoration: none;
  font-size: 15px;
  font-weight: 700;
  position: relative;
  border-radius: 8px;
}

.topnav__dev{
  display: inline-flex;
  align-items: center;
  gap: 6px;
  margin-left: auto;
}

.topnav__links a:not(.madrasha-title):active {
  background-color: #ffffffa7 !important;
  color: rgb(240, 237, 84);
}

.topnav__links a:not(.madrasha-title):hover {
  background-color: #ffffff21;
  color: rgb(240, 237, 84);
}

.topnav__links a:not(.madrasha-title)::after {
  position: absolute;
  content: '';
  bottom: 4px;
  left: 50%;
  height: 2px;
  width: 0;
  transform: translateX(-50%);
  background-color: rgba(255, 255, 255, 0.684);
  transition: width 0.3s ease;
}

.topnav__links a.active:not(.madrasha-title)::after,
.topnav__links a:not(.madrasha-title):hover::after {
  width: calc(100% - 10px);
}

@media screen and (max-width: 960px) {
  .topnav{
    padding: 10px 12px;
  }
  .topnav__logo{
    width: 160px;
  }
  .topnav__toggle{
    display: inline-flex;
    margin-left: auto;
  }
  .topnav__links{
    width: 100%;
    display: none;
    flex-direction: column;
    align-items: flex-start;
    padding: 6px 0 0 0;
  }
  .topnav__links.is-open{
    display: flex;
  }
  .topnav__links a{
    width: 100%;
    text-align: left;
  }
  .topnav__dev{
    width: 100%;
    justify-content: flex-start;
    margin-left: 0;
    padding-left: 4px;
  }
}
</style>
