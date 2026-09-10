<template>
  <header class="topnav bg3" id="myTopnav">
    <a ref="logo_wrapper" class="madrasha-title logo-area" :href="CONFIG?.settings?.attendance?.only_attendance_feature === true ? '#/attendence' : '#'">
      <img alt="site-logo" ref="logoEl" id="LOGO" src="" class="topnav__logo">
    </a>

    <!-- <span v-if="isIPAccess" @click="sendRemoteAction()" class="topnav__wifi" :class="is_connected_with_main_app ? 'topnav__wifi--on' : 'topnav__wifi--off'"
      :tooltip="is_connected_with_main_app ? helper.t('Connected to main app') : helper.t('Not connected to main app')" flow="down">
      <i :class="is_connected_with_main_app ? 'bx bx-wifi' : 'bx bx-wifi-off'"></i>
    </span>
    <span v-if="isIPAccess && is_connected_with_main_app" class="topnav__wifi" :class="!main_app_user_is_active ? 'topnav__wifi--on' : 'topnav__wifi--off'"
      :tooltip="main_app_user_is_active ? helper.t('Main app is busy') : helper.t('You can control remotely')" flow="down">
      <i class="bx bx-mouse"></i>
    </span>
 

    <span v-if="!isIPAccess && !isUserActive" class="topnav__wifi topnav__wifi--on"
      :tooltip="helper.t('User is not active')" flow="down">
      <i class='bx bx-loader-circle topnav__hypnotize'></i>
    </span> -->

    <button class="topnav__toggle" type="button" @click="isOpen = !isOpen" aria-label="Toggle navigation">
      <i :class="isOpen ? 'bx bx-x' : 'bx bx-menu'"></i>
    </button>
    <Teleport to="body">
      <div v-if="isOpen" class="topnav-backdrop" @click="isOpen = false"></div>
    </Teleport>

    <nav class="topnav__links" :class="{ 'is-open': isOpen }">
      <template v-if="!CONFIG?.settings?.attendance?.only_attendance_feature">
        <RouterLink id="nav-link-home" :to="{name: 'home', query: {[route?.query?.dev ? 'dev' : '']: route?.query?.dev}}" :class="{'active': route.name === 'home'}" @click="sendRemoteAction({from: 'ip', action: 'onClick', selector: '#nav-link-home'})">
          <i class='bx bxs-home pre-icon'></i> {{ helper.t('Dashboard') }}
        </RouterLink>
      </template>
      <template v-if="CONFIG?.settings?.attendance?.status">
        <RouterLink id="nav-link-attendence" :to="{name: 'attendence', query: {[route?.query?.dev ? 'dev' : '']: route?.query?.dev}}" :class="{'active attendence-tab': route.name === 'attendence'}" 
        @click="sendRemoteAction({from: 'ip', action: 'onClick', selector: '#nav-link-attendence'})"
        @dblclick.prevent="show_bulk_attedance_component = true" >
          <i class='bx bx-user-pin pre-icon'></i> {{ helper.t('Attendence') }}
        </RouterLink>
      </template>
      <RouterLink id="nav-link-students" :to="{name: 'students', query: {[route?.query?.dev ? 'dev' : '']: route?.query?.dev}}" :class="{'active students-tab': route.name === 'students'}" 
        @click="sendRemoteAction({from: 'ip', action: 'onClick', selector: '#nav-link-students'})"
        @dblclick.prevent="show_cloner_component = true" >
        <i class='bx bxs-user pre-icon'></i> {{ helper.t('Students') }}
      </RouterLink>
      <template v-if="!CONFIG?.settings?.attendance?.only_attendance_feature">
        <RouterLink id="nav-link-shedules" :to="{name: 'shedules', query: {[route?.query?.dev ? 'dev' : '']: route?.query?.dev}}" :class="{'active': route.name === 'shedules'}" @click="sendRemoteAction({from: 'ip', action: 'onClick', selector: '#nav-link-shedules'})">
          <i class='bx bxs-calendar pre-icon' ></i> {{ helper.t('Shedules') }}
        </RouterLink>
      </template>
      <RouterLink id="nav-link-devices" :to="{name: 'devices', query: {[route?.query?.dev ? 'dev' : '']: route?.query?.dev}}" :class="{'active': route.name === 'devices'}" @click="sendRemoteAction({from: 'ip', action: 'onClick', selector: '#nav-link-devices'})">
        <i class='bx bxs-server pre-icon' ></i> {{ helper.t('Devices') }}
      </RouterLink>
      <RouterLink id="nav-link-import" :to="{name: 'import', query: {[route?.query?.dev ? 'dev' : '']: route?.query?.dev}}" :class="{'active': route.name === 'import'}" @click="sendRemoteAction({from: 'ip', action: 'onClick', selector: '#nav-link-import'})">
        <i class='bx bxs-file-import pre-icon' ></i> {{ helper.t('Import') }}
      </RouterLink>
      <RouterLink id="nav-link-contact" :to="{name: 'ContactUs', query: {[route?.query?.dev ? 'dev' : '']: route?.query?.dev}}" :class="{'active': route.name === 'ContactUs'}"
        @click="sendRemoteAction({from: 'ip', action: 'onClick', selector: '#nav-link-contact'})"
         >
        {{ helper.t('Contact') }}
      </RouterLink>

      <div class="topnav__version">
        <button v-if="CONFIG?.settings?.sms?.enabled" class="topnav__update-btn topnav__sms-btn" tooltip="Send SMS" flow="down" @click="showSmsModal = true">
          <svg class="sms-bubble-icon" viewBox="0 0 56 56" xmlns="http://www.w3.org/2000/svg">
            <rect x="2" y="2" width="52" height="40" rx="10" ry="10" fill="white" stroke="currentColor" stroke-width="3"/>
            <polygon points="34,41 22,41 29,54" fill="white" stroke="currentColor" stroke-width="3" stroke-linejoin="round" paint-order="stroke"/>
            <text x="28" y="25" text-anchor="middle" dominant-baseline="middle" font-family="Arial,sans-serif" font-size="17" font-weight="700" fill="currentColor">sms</text>
          </svg>
        </button>
        <button class="topnav__update-btn" :tooltip="helper.t('Settings')" flow="down" @click="showSettingsPanel = true">
          <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="12" cy="12" r="3"/>
            <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/>
          </svg>
        </button>
        <button class="topnav__update-btn" :tooltip="helper.t('Logout')" flow="down" @click="logout()">
          <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
            <polyline points="16 17 21 12 16 7"/>
            <line x1="21" y1="12" x2="9" y2="12"/>
          </svg>
        </button>

      </div>

      <div v-if="useRoute().query.dev === 'true'" class="topnav__dev">
        <span class="border cp me-1 text-white px-1 size-08" @click.prevent.stop="show_bulk_attedance_component = true">
          <span :tooltip="helper.t('Bulk Attendence')" flow="left">{{ helper.t('Bulk') }}</span>
        </span>
        <span class="border cp me-1 text-white px-1 size-08" @click.prevent.stop="$goto({name: 'env'})">
          <span :tooltip="helper.t('Show Config.js')" flow="left">{{ helper.t('Config') }}</span>
        </span>
        <span class="border cp me-0 text-white px-1 size-08" @click.prevent.stop="show_cloner_component = true">
          <span :tooltip="helper.t('Clone Students')" flow="left">{{ helper.t('Clone') }}</span>
        </span>
      </div>
    </nav>
  </header>
  <cloneStudents v-if="show_cloner_component" @unmount="show_cloner_component = false"></cloneStudents>
  <ConfigSettings v-if="showSettingsPanel" @unmount="showSettingsPanel = false" />
  <SmsModal v-if="showSmsModal" @close="showSmsModal = false" />
</template>

<script setup>
import { ref, inject, onMounted, watch, onBeforeUnmount } from 'vue';
import { RouterLink, useRoute, useRouter } from 'vue-router';
import Btn from './Btn.vue'
import cloneStudents from './cloneStudents.vue'
import ConfigSettings from './settings/ConfigSettings.vue'
import SmsModal from './SmsModal.vue'

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
const http = inject('http');
const helper = inject('helper');
let showSmsModal = inject('showSmsModal')
let show_cloner_component = inject('show_cloner_component')
let showSettingsPanel = ref(false)

onMounted(()=>{
  if(typeof GLOBAL_DATA !== 'undefined'){
    if(GLOBAL_DATA?.logo){
      logoEl.value.src = GLOBAL_DATA.logo
      logoEl.value.style.width = GLOBAL_DATA.logo_width
      logo_wrapper.value.style.padding = GLOBAL_DATA.logo_area_padding || '14px 33px'
    }
  }
})

async function logout(){
  try {
    await http.post('/logout')
  } catch (err) {}
  emitter.emit('auth-required')
}


</script>

<style scoped>
.madrasha-title {
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
  position: absolute;
  top: 20px;
  left: 232px;
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
  z-index: 10;
}

.topnav .pre-icon{
  transform: translateY(2px);
  font-size: 18px;
}

.topnav__logo{
  width: 200px;
  border: 6px;
  border-radius: 10px;
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

.topnav__version {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  margin-left: auto;
  color: rgba(255,255,255,0.7);
  font-size: 12px;
}
.topnav__update-btn {
  background: none;
  border: none;
  color: rgba(255,255,255,0.6);
  cursor: pointer;
  padding: 3px;
  display: inline-flex;
  align-items: center;
  border-radius: 4px;
  transition: color 0.2s;
}
.topnav__update-btn:hover {
  color: #4caf50;
}
.topnav__sms-btn .sms-bubble-icon {
  width: 22px;
  height: 22px;
  color: #e0455a;
  transition: color 0.2s, transform 0.15s;
  display: block;
}
.topnav__sms-btn:hover .sms-bubble-icon {
  color: #c42d40;
  transform: scale(1.1);
}

.topnav__dev{
  display: inline-flex;
  align-items: center;
  gap: 6px;
  margin-left: 0;
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
  /* Backdrop overlay */
  .topnav-backdrop {
    position: fixed;
    inset: 0;
    background: rgba(0,0,0,0.5);
    z-index: 9;
    animation: bdIn 0.2s ease;
  }

  .topnav__wifi { 
    top: 13px;
    left: 160px;
  }

  @keyframes bdIn { from { opacity: 0; } to { opacity: 1; } }

  .topnav {
    padding: 8px 12px;
    flex-wrap: wrap;
    position: sticky;
    top: 0;
    z-index: 10;
  }
  .topnav__logo { width: 130px !important; }

  /* Hamburger ↔ X toggle */
  .topnav__toggle {
    display: inline-flex;
    margin-left: auto;
    width: 44px;
    height: 44px;
    font-size: 24px;
    transition: background 0.15s, transform 0.2s;
    z-index: 11;
    position: relative;
  }
  .topnav__toggle:active { transform: scale(0.92); }

  /* Slide-down menu (no display:none flash) */
  .topnav__links {
    width: 100%;
    display: flex;
    flex-direction: column;
    align-items: stretch;
    gap: 2px;
    padding: 0;
    overflow: hidden;
    max-height: 0;
    opacity: 0;
    pointer-events: none;
    transition: max-height 0.32s cubic-bezier(0.4,0,0.2,1),
                opacity 0.22s ease,
                padding 0.28s ease;
  }
  .topnav__links.is-open {
    max-height: 700px;
    opacity: 1;
    pointer-events: auto;
    padding: 8px 0 12px;
  }

  /* Full-width pill links with active indicator bar */
  .topnav__links a {
    width: 100%;
    text-align: left;
    padding: 13px 16px;
    font-size: 15px;
    font-weight: 600;
    border-radius: 10px;
    display: flex;
    align-items: center;
    gap: 10px;
    min-height: 48px;
  }
  /* Remove desktop underline indicator on mobile */
  .topnav__links a:not(.madrasha-title)::after {
    display: none;
  }
  /* Active: filled pill + left accent bar */
  .topnav__links a.active:not(.madrasha-title) {
    background: rgba(255,255,255,0.13);
    color: #fff;
    font-weight: 700;
  }
  .topnav__links a.active:not(.madrasha-title)::before {
    content: '';
    display: inline-block;
    width: 4px;
    min-width: 4px;
    height: 22px;
    background: var(--primaryColor, #f59928);
    border-radius: 2px;
  }

  /* Version/icon row — full width, separated */
  .topnav__version {
    width: 100%;
    justify-content: flex-end;
    border-top: 1px solid rgba(255,255,255,0.1);
    padding-top: 10px;
    margin-top: 4px;
  }
  .topnav__update-btn {
    width: 38px;
    height: 38px;
    justify-content: center;
    border-radius: 8px;
    background: rgba(255,255,255,0.08);
    padding: 0;
  }
  .topnav__update-btn:hover { background: rgba(255,255,255,0.15); color: #fff; }

  .topnav__dev {
    width: 100%;
    justify-content: flex-start;
    margin-left: 0;
    padding-left: 4px;
  }
}

</style>
