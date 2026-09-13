<template>
  <header class="topnav bg3" id="myTopnav">
    <a ref="logo_wrapper" class="madrasha-title logo-area" :href="CONFIG?.settings?.attendance?.only_attendance_feature === true ? '#/attendence' : '#'" @contextmenu.prevent="showDevPopup = !showDevPopup">
      <img alt="site-logo" ref="logoEl" id="LOGO" src="" class="topnav__logo">

      <div v-if="showDevPopup" class="dev-popup-backdrop" @click.prevent="showDevPopup = false" @contextmenu.prevent="showDevPopup = false"></div>
      <div v-if="showDevPopup" class="dev-popup" @click.stop>
        <span class="border cp me-1 text-white px-1 size-08" @click.prevent.stop="show_bulk_attedance_component = true; showDevPopup = false">
          <span :tooltip="helper.t('Bulk Attendence')" flow="left">{{ helper.t('Bulk') }}</span>
        </span>
        <!-- <span class="border cp me-1 text-white px-1 size-08" @click.prevent.stop="$goto({name: 'env'}); showDevPopup = false">
          <span :tooltip="helper.t('Show Config.js')" flow="left">{{ helper.t('Config') }}</span>
        </span> -->
        <span class="border cp me-1 text-white px-1 size-08" @click.prevent.stop="show_cloner_component = true; showDevPopup = false">
          <span :tooltip="helper.t('Clone Students')" flow="left">{{ helper.t('Clone') }}</span>
        </span>
        <span class="border cp me-0 text-white px-1 size-08" @click.prevent.stop="reloadAllClients(); showDevPopup = false">
          <span :tooltip="helper.t('Reload every connected browser')" flow="left">{{ helper.t('Reload All') }}</span>
        </span>
      </div>
    </a>

    <nav class="topnav__links">
      <template v-if="!CONFIG?.settings?.attendance?.only_attendance_feature">
        <RouterLink id="nav-link-home" :to="{name: 'home', query: {[route?.query?.dev ? 'dev' : '']: route?.query?.dev}}" :class="{'active': route.name === 'home'}">
          <i class='bx bxs-home pre-icon'></i> {{ helper.t('Dashboard') }}
        </RouterLink>
      </template>
      <template v-if="CONFIG?.settings?.attendance?.status">
        <RouterLink id="nav-link-attendence" :to="{name: 'attendence', query: {[route?.query?.dev ? 'dev' : '']: route?.query?.dev}}" :class="{'active attendence-tab': route.name === 'attendence'}"
        @dblclick.prevent="show_bulk_attedance_component = true" >
          <i class='bx bx-user-pin pre-icon'></i> {{ helper.t('Attendence') }}
        </RouterLink>
      </template>
      <RouterLink id="nav-link-students" :to="{name: 'students', query: {[route?.query?.dev ? 'dev' : '']: route?.query?.dev}}" :class="{'active students-tab': route.name === 'students'}"
        @dblclick.prevent="show_cloner_component = true" >
        <i class='bx bxs-user pre-icon'></i> {{ helper.t('Students') }}
      </RouterLink>
      <template v-if="!CONFIG?.settings?.attendance?.only_attendance_feature">
        <RouterLink id="nav-link-shedules" :to="{name: 'shedules', query: {[route?.query?.dev ? 'dev' : '']: route?.query?.dev}}" :class="{'active': route.name === 'shedules'}">
          <i class='bx bxs-calendar pre-icon' ></i> {{ helper.t('Shedules') }}
        </RouterLink>
      </template>
      <RouterLink id="nav-link-devices" :to="{name: 'devices', query: {[route?.query?.dev ? 'dev' : '']: route?.query?.dev}}" :class="{'active': route.name === 'devices'}">
        <i class='bx bxs-server pre-icon' ></i> {{ helper.t('Devices') }}
      </RouterLink>
      <RouterLink id="nav-link-import" :to="{name: 'import', query: {[route?.query?.dev ? 'dev' : '']: route?.query?.dev}}" :class="{'active': route.name === 'import'}">
        <i class='bx bxs-file-import pre-icon' ></i> {{ helper.t('Import') }}
      </RouterLink>
      <RouterLink id="nav-link-contact" :to="{name: 'ContactUs', query: {[route?.query?.dev ? 'dev' : '']: route?.query?.dev}}" :class="{'active': route.name === 'ContactUs'}"
         >
        {{ helper.t('Contact') }}
      </RouterLink>

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
  </header>

  <!-- Mobile-only bottom tab bar — replaces the hamburger menu for quick nav access -->
  <nav class="mobile-footer-nav">
    <template v-if="!CONFIG?.settings?.attendance?.only_attendance_feature">
      <RouterLink id="footer-link-home" :to="{name: 'home', query: {[route?.query?.dev ? 'dev' : '']: route?.query?.dev}}" :class="{'active': route.name === 'home'}">
        <i class='bx bxs-home'></i>
        <span>{{ helper.t('Dashboard') }}</span>
      </RouterLink>
    </template>
    <template v-if="CONFIG?.settings?.attendance?.status">
      <RouterLink id="footer-link-attendence" :to="{name: 'attendence', query: {[route?.query?.dev ? 'dev' : '']: route?.query?.dev}}" :class="{'active': route.name === 'attendence'}"
        @dblclick.prevent="show_bulk_attedance_component = true">
        <i class='bx bx-user-pin'></i>
        <span>{{ helper.t('Attendence') }}</span>
      </RouterLink>
    </template>
    <RouterLink id="footer-link-students" :to="{name: 'students', query: {[route?.query?.dev ? 'dev' : '']: route?.query?.dev}}" :class="{'active': route.name === 'students'}"
      @dblclick.prevent="show_cloner_component = true">
      <i class='bx bxs-user'></i>
      <span>{{ helper.t('Students') }}</span>
    </RouterLink>
    <RouterLink id="footer-link-contact" :to="{name: 'ContactUs', query: {[route?.query?.dev ? 'dev' : '']: route?.query?.dev}}" :class="{'active': route.name === 'ContactUs'}">
      <i class='bx bx-phone'></i>
      <span>{{ helper.t('Contact') }}</span>
    </RouterLink>
    <a href="#" id="footer-link-more" :class="{'active': ['shedules','devices','import'].includes(route.name)}" @click.prevent="showMoreMenu = true">
      <i class='bx bx-dots-horizontal-rounded'></i>
      <span>{{ helper.t('More') }}</span>
    </a>
  </nav>

  <Teleport to="body">
    <div v-if="showMoreMenu" class="mobile-more-backdrop" @click="showMoreMenu = false"></div>
    <div class="mobile-more-sheet" :class="{ 'is-open': showMoreMenu }">
      <div class="mobile-more-sheet__handle"></div>
      <template v-if="!CONFIG?.settings?.attendance?.only_attendance_feature">
        <RouterLink id="more-link-shedules" :to="{name: 'shedules', query: {[route?.query?.dev ? 'dev' : '']: route?.query?.dev}}" @click="showMoreMenu = false">
          <i class='bx bxs-calendar'></i>
          <span>{{ helper.t('Shedules') }}</span>
        </RouterLink>
      </template>
      <RouterLink id="more-link-devices" :to="{name: 'devices', query: {[route?.query?.dev ? 'dev' : '']: route?.query?.dev}}" @click="showMoreMenu = false">
        <i class='bx bxs-server'></i>
        <span>{{ helper.t('Devices') }}</span>
      </RouterLink>
      <RouterLink id="more-link-import" :to="{name: 'import', query: {[route?.query?.dev ? 'dev' : '']: route?.query?.dev}}" @click="showMoreMenu = false">
        <i class='bx bxs-file-import'></i>
        <span>{{ helper.t('Import') }}</span>
      </RouterLink>
    </div>
  </Teleport>

  <cloneStudents v-if="show_cloner_component" @unmount="show_cloner_component = false"></cloneStudents>
  <ConfigSettings v-if="showSettingsPanel" @unmount="showSettingsPanel = false" />
  <Transition name="sms-modal-anim">
    <SmsModal v-if="showSmsModal" @close="showSmsModal = false" />
  </Transition>
</template>

<script setup>
import { ref, inject, onMounted, watch } from 'vue';
import { RouterLink, useRoute, useRouter } from 'vue-router';
import Btn from './Btn.vue'
import cloneStudents from './cloneStudents.vue'
import ConfigSettings from './settings/ConfigSettings.vue'
import SmsModal from './SmsModal.vue'

let logoEl = ref(null)
let logo_wrapper = ref(null)
let route = useRoute()
let router = useRouter()
let showMoreMenu = ref(false)

// Close the "More" sheet after navigating to one of its links
watch(() => route.path, () => { showMoreMenu.value = false })

const emitter = inject('emitter');
const CONFIG = inject('CONFIG');
const show_bulk_attedance_component = inject('show_bulk_attedance_component');
const http = inject('http');
const helper = inject('helper');
let showSmsModal = inject('showSmsModal')
let show_cloner_component = inject('show_cloner_component')
let showSettingsPanel = ref(false)
let showDevPopup = ref(false)
const Socket = inject('Socket')

function reloadAllClients(){
  if(!Socket.value) return
  Socket.value.send(JSON.stringify({ type: 'force_reload' }))
}

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
  position: relative;
  color: #ff0;
  font-size: 17px;
  text-shadow: 1px 2px 2px rgb(0,0,0);
  margin-right: 12px;
  border-top-left-radius: 0px;
  border-top-right-radius: 0px;
}

.dev-popup-backdrop {
  position: fixed;
  inset: 0;
  z-index: 998;
}

.dev-popup {
  position: absolute;
  top: calc(100% + 6px);
  left: 0;
  z-index: 999;
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 10px;
  background: var(--grad3);
  border-radius: 8px;
  box-shadow: 0 6px 20px rgba(0,0,0,0.35);
  white-space: nowrap;
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

/* Mobile bottom tab bar — hidden on desktop, shown in the mobile media query below */
.mobile-footer-nav {
  display: none;
}

/* "More" overflow sheet — hidden on desktop (it's Teleported to <body>, outside the media query's DOM scope, so it needs its own default-hidden rule) */
.mobile-more-backdrop,
.mobile-more-sheet {
  display: none;
}

@media screen and (max-width: 960px) {
  .topnav {
    padding: 8px 12px;
    flex-wrap: wrap;
    position: sticky;
    top: 0;
    z-index: 10;
  }
  .topnav__logo { width: 130px !important; }

  /* Page navigation now lives in the bottom tab bar on mobile */
  .topnav__links {
    display: none;
  }

  .topnav__version {
    position: fixed;
    top: 10px;
    right: 10px;
    margin-left: 0;
    z-index: 11;
  }

  .topnav__dev {
    width: 100%;
    justify-content: flex-start;
    margin-left: 0;
    padding-left: 4px;
  }

  /* Bottom tab bar */
  .mobile-footer-nav {
    display: flex;
    align-items: stretch;
    gap: 2px;
    position: fixed;
    left: 0;
    right: 0;
    bottom: 0;
    z-index: 12;
    background: var(--grad3);
    border-top: 1px solid rgba(255,255,255,0.12);
    box-shadow: 0 -2px 10px rgba(0,0,0,0.25);
    overflow-x: auto;
    padding: 4px 4px calc(4px + env(safe-area-inset-bottom));
    -webkit-overflow-scrolling: touch;
    -webkit-transform: translateZ(0);
    transform: translateZ(0);

  }
  /* Dashboard sits visually centered among the footer tabs */
  #footer-link-attendence { order: 1; }
  #footer-link-students { order: 2; }
  #footer-link-home { order: 3; }
  #footer-link-contact { order: 4; }
  #footer-link-more { order: 5; }
  .mobile-footer-nav a {
    position: relative;
    flex: 1 0 64px;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 3px;
    padding: 6px 8px;
    min-height: 48px;
    color: rgba(255,255,255,0.65);
    text-decoration: none;
    font-size: 11px;
    font-weight: 600;
    border-radius: 10px;
    white-space: nowrap;
    outline: none;
    -webkit-tap-highlight-color: transparent;
  }
  .mobile-footer-nav a i {
    font-size: 20px;
  }
  .mobile-footer-nav a:active {
    background-color: rgba(255,255,255,0.1);
  }
  .mobile-footer-nav a.active {
    color: #fff;
    background-color: #ffffff33;
    font-weight: 700;
  }
  .mobile-footer-nav a.active i {
    color: #fff;
  }
  .mobile-footer-nav a.active::before {
    content: '';
    position: absolute;
    top: 0;
    left: 50%;
    transform: translateX(-50%);
    width: 26px;
    height: 3px;
    border-radius: 0 0 3px 3px;
    background: rgba(209, 209, 209, 0.659);
  }

  /* "More" overflow sheet (Shedules / Devices / Import) */
  .mobile-more-backdrop {
    display: block;
    position: fixed;
    inset: 0;
    background: rgba(0,0,0,0.5);
    z-index: 14;
    animation: moreBdIn 0.2s ease;
  }
  @keyframes moreBdIn { from { opacity: 0; } to { opacity: 1; } }

  .mobile-more-sheet {
    display: block;
    position: fixed;
    left: 0;
    right: 0;
    bottom: 0;
    z-index: 15;
    background: var(--grad3);
    border-top: 1px solid rgba(255,255,255,0.12);
    border-radius: 16px 16px 0 0;
    box-shadow: 0 -4px 20px rgba(0,0,0,0.35);
    padding: 8px 12px calc(12px + env(safe-area-inset-bottom));
    transform: translateY(100%);
    transition: transform 0.28s cubic-bezier(0.4,0,0.2,1);
  }
  .mobile-more-sheet.is-open {
    transform: translateY(0);
  }
  .mobile-more-sheet__handle {
    width: 36px;
    height: 4px;
    background: rgba(255,255,255,0.3);
    border-radius: 2px;
    margin: 4px auto 10px;
  }
  .mobile-more-sheet a {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 13px 10px;
    color: rgba(255,255,255,0.85);
    text-decoration: none;
    font-size: 15px;
    font-weight: 600;
    border-radius: 10px;
  }
  .mobile-more-sheet a i {
    font-size: 20px;
    width: 24px;
    text-align: center;
  }
  .mobile-more-sheet a:active {
    background-color: rgba(255,255,255,0.1);
  }
  .mobile-more-sheet a.router-link-active {
    color: #fff;
    background-color: rgba(255,255,255,0.13);
  }
}

</style>

<style>
/* Reserve room for the fixed mobile footer nav so it doesn't cover page content */
@media screen and (max-width: 960px) {
  .page-contents {
    margin-bottom: 64px;
  }
}
</style>
