<template>
  <header class="topnav bg3" id="myTopnav">
    <a ref="logo_wrapper" class="madrasha-title logo-area" :href="CONFIG?.settings?.attendance?.only_attendance_feature === true ? '#/attendence' : '#'"
      @contextmenu.prevent="showDevPopup = !showDevPopup"
      @touchstart="handleLogoTouchStart"
      @touchend="handleLogoTouchEnd"
      @touchmove="cancelLogoLongPress"
      @touchcancel="cancelLogoLongPress"
      >
      <img alt="site-logo" ref="logoEl" id="LOGO" src="" class="topnav__logo">

      <div v-if="showDevPopup" class="dev-popup-backdrop" @click.prevent="showDevPopup = false" @contextmenu.prevent="showDevPopup = false"></div>
      <div v-if="showDevPopup" class="dev-popup" @click.stop>
        
        <!-- <span class="border cp me-1 dev-popup-btn px-1 size-08" @click.prevent.stop="$goto({name: 'env'}); showDevPopup = false">
          <span :tooltip="helper.t('Show Config.js')" flow="left">{{ helper.t('Config') }}</span>
        </span> -->
        <span class="border cp me-1 dev-popup-btn px-1 size-08" @click.prevent.stop="show_cloner_component = true; showDevPopup = false">
          <span :tooltip="helper.t('Clone Students')" flow="left">{{ helper.t('Clone') }}</span>
        </span>
        <span class="border cp me-1 dev-popup-btn px-1 size-08" @click.prevent.stop="reloadAllClients(); showDevPopup = false">
          <span :tooltip="helper.t('Reload every connected browser')" flow="left">{{ helper.t('Reload All') }}</span>
        </span>
        <span class="border cp me-1 dev-popup-btn dev-popup-btn-danger px-1 size-08"
        @click.prevent.stop="clearTimeAndBarcodeAllClients(); showDevPopup = false"
        @contextmenu="log('Clear all `clear_time_and_barcode` from session storage')"
        >
          <span :tooltip="helper.t('Clear punch clear_time_and_barcode key on every connected browser')" flow="left">{{ helper.t('Clear Last Punch') }}</span>
        </span>
        <span class="border cp me-1 dev-popup-btn dev-popup-btn-danger px-1 size-08" @click.prevent.stop="clearAllStorageAllClients(); showDevPopup = false">
          <span :tooltip="helper.t('Clear all localStorage and sessionStorage keys on every connected browser')" flow="left">{{ helper.t('Clear All Storage') }}</span>
        </span>
        <span class="border cp me-1 dev-popup-btn dev-popup-btn-danger px-1 size-08" @click.prevent.stop="show_bulk_attedance_component = true; showDevPopup = false">
          <span :tooltip="helper.t('Bulk Attendence')" flow="left">{{ helper.t('Bulk') }}</span>
        </span>
        <span class="border cp me-0 dev-popup-btn px-1 size-08" @click.prevent.stop="openConnectedDevicesModal(); showDevPopup = false">
          <span :tooltip="helper.t('Show all connected devices')" flow="left">{{ helper.t('Connected Devices') }}</span>
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
      <button v-if="!isInsideMobileApp" class="topnav__update-btn topnav__app-btn" :tooltip="helper.t('Download Android App')" flow="down" :disabled="checkingApk" @click="downloadMobileApp()">
        <!-- "App Download" icon: "App" label above a phone with a download arrow -->
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="28" viewBox="0 0 24 38" fill="none">
          <path d="M3.65128 10H2.24503L4.8054 2.72727H6.43182L8.99574 10H7.58949L5.64702 4.21875H5.5902L3.65128 10ZM3.69744 7.14844H7.53267V8.20668H3.69744V7.14844ZM9.89684 12.0455V4.54545H11.161V5.44744H11.2356C11.3019 5.31487 11.3954 5.17401 11.5162 5.02486C11.6369 4.87334 11.8002 4.74432 12.0062 4.63778C12.2122 4.52888 12.475 4.47443 12.7946 4.47443C13.216 4.47443 13.5959 4.58215 13.9345 4.79759C14.2754 5.01065 14.5453 5.3267 14.7441 5.74574C14.9454 6.16241 15.046 6.67377 15.046 7.27983C15.046 7.87879 14.9477 8.38778 14.7512 8.80682C14.5547 9.22585 14.2872 9.54545 13.9487 9.76562C13.6101 9.9858 13.2266 10.0959 12.7981 10.0959C12.4856 10.0959 12.2264 10.0438 12.0204 9.93963C11.8145 9.83546 11.6487 9.70999 11.5233 9.56321C11.4002 9.41406 11.3043 9.2732 11.2356 9.14062H11.1824V12.0455H9.89684ZM11.1575 7.27273C11.1575 7.62547 11.2072 7.93442 11.3066 8.19957C11.4084 8.46473 11.554 8.67187 11.7434 8.82102C11.9352 8.9678 12.1672 9.04119 12.4395 9.04119C12.7235 9.04119 12.9615 8.96544 13.1532 8.81392C13.345 8.66004 13.4894 8.45052 13.5865 8.18537C13.6859 7.91785 13.7356 7.61364 13.7356 7.27273C13.7356 6.93419 13.6871 6.63352 13.59 6.37074C13.493 6.10795 13.3485 5.90199 13.1568 5.75284C12.965 5.60369 12.7259 5.52912 12.4395 5.52912C12.1648 5.52912 11.9316 5.60133 11.7399 5.74574C11.5481 5.89015 11.4025 6.09257 11.3031 6.35298C11.206 6.6134 11.1575 6.91998 11.1575 7.27273ZM16.1468 12.0455V4.54545H17.411V5.44744H17.4856C17.5519 5.31487 17.6454 5.17401 17.7662 5.02486C17.8869 4.87334 18.0502 4.74432 18.2562 4.63778C18.4622 4.52888 18.725 4.47443 19.0446 4.47443C19.466 4.47443 19.8459 4.58215 20.1845 4.79759C20.5254 5.01065 20.7953 5.3267 20.9941 5.74574C21.1954 6.16241 21.296 6.67377 21.296 7.27983C21.296 7.87879 21.1977 8.38778 21.0012 8.80682C20.8047 9.22585 20.5372 9.54545 20.1987 9.76562C19.8601 9.9858 19.4766 10.0959 19.0481 10.0959C18.7356 10.0959 18.4764 10.0438 18.2704 9.93963C18.0645 9.83546 17.8987 9.70999 17.7733 9.56321C17.6502 9.41406 17.5543 9.2732 17.4856 9.14062H17.4324V12.0455H16.1468ZM17.4075 7.27273C17.4075 7.62547 17.4572 7.93442 17.5566 8.19957C17.6584 8.46473 17.804 8.67187 17.9934 8.82102C18.1852 8.9678 18.4172 9.04119 18.6895 9.04119C18.9735 9.04119 19.2115 8.96544 19.4032 8.81392C19.595 8.66004 19.7394 8.45052 19.8365 8.18537C19.9359 7.91785 19.9856 7.61364 19.9856 7.27273C19.9856 6.93419 19.9371 6.63352 19.84 6.37074C19.743 6.10795 19.5985 5.90199 19.4068 5.75284C19.215 5.60369 18.9759 5.52912 18.6895 5.52912C18.4148 5.52912 18.1816 5.60133 17.9899 5.74574C17.7981 5.89015 17.6525 6.09257 17.5531 6.35298C17.456 6.6134 17.4075 6.91998 17.4075 7.27273Z" fill="currentColor"/>
          <g stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round">
            <path d="M17.5 16H6.5C4.84315 16 3.5 17.3431 3.5 19V33C3.5 34.6569 4.84315 36 6.5 36H17.5C19.1569 36 20.5 34.6569 20.5 33V19C20.5 17.3431 19.1569 16 17.5 16Z"/>
            <path d="M12 20.75V27.75"/>
            <path d="M8.75 24.5L12 27.75L15.25 24.5"/>
            <path d="M10 32.25H14"/>
          </g>
        </svg>
      </button>
      <button v-if="CONFIG?.settings?.sms?.enabled" class="topnav__update-btn topnav__sms-btn" tooltip="Send SMS" flow="down" @click="showSmsModal = true">
        <svg class="sms-bubble-icon" viewBox="0 0 56 56" xmlns="http://www.w3.org/2000/svg">
          <rect x="2" y="2" width="52" height="40" rx="10" ry="10" fill="white" stroke="currentColor" stroke-width="3"/>
          <polygon points="34,41 22,41 29,54" fill="white" stroke="currentColor" stroke-width="3" stroke-linejoin="round" paint-order="stroke"/>
          <text x="28" y="25" text-anchor="middle" dominant-baseline="middle" font-family="Arial,sans-serif" font-size="17" font-weight="700" fill="currentColor">sms</text>
        </svg>
      </button>
      <button class="topnav__update-btn" :tooltip="helper.t('Settings')" flow="down" @click="showSettingsPanel = true">
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
          <circle cx="12" cy="12" r="3"/>
          <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/>
        </svg>
      </button>
      <button class="topnav__update-btn" :tooltip="helper.t('Logout')" flow="down" @click="logout()">
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
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

  <!-- Auto-update modals disabled -->
  <!--
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
  -->

  <cloneStudents v-if="show_cloner_component" @unmount="show_cloner_component = false"></cloneStudents>
  <ConfigSettings v-if="showSettingsPanel" @unmount="showSettingsPanel = false" />
  <Transition name="sms-modal-anim">
    <SmsModal v-if="showSmsModal" @close="showSmsModal = false" />
  </Transition>

  <modal v-if="showConnectedDevicesModal" :title="helper.t('Connected Devices')" width="800px" @close="showConnectedDevicesModal = false">
    <div class="connected-devices-modal">
      <div v-if="loadingConnectedDevices" class="text-center p-3">{{ helper.t('Loading...') }}</div>
      <div v-else-if="!connectedDevicesList.length" class="text-center p-3">{{ helper.t('No devices connected') }}</div>
      <div v-else class="connected-devices-table-wrapper">
        <table class="connected-devices-table">
          <thead>
            <tr>
              <th>#</th>
              <th>{{ helper.t('IP Address') }}</th>
              <th>{{ helper.t('Device Type') }}</th>
              <th>{{ helper.t('OS') }}</th>
              <th>{{ helper.t('Browser') }}</th>
              <th>{{ helper.t('Connected At') }}</th>
              <th>{{ helper.t('User Agent') }}</th>
              <th>{{ helper.t('Action') }}</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="device in connectedDevicesList" :key="device.id">
              <td>{{ device.id }}</td>
              <td>{{ device.ip }}</td>
              <td>
                <span class="device-type-badge" :class="'device-type-' + device.deviceType.toLowerCase()">
                  <i :class="device.deviceType === 'Mobile' ? 'bx bx-mobile-alt' : device.deviceType === 'Tablet' ? 'bx bx-tab' : 'bx bx-desktop'"></i>
                  {{ device.deviceType }}
                </span>
              </td>
              <td>{{ device.os }}</td>
              <td>{{ device.browser }}</td>
              <td>{{ new Date(device.connectedAt).toLocaleString() }}</td>
              <td class="connected-devices-ua" :tooltip="device.userAgent" flow="up">{{ device.userAgent }}</td>
              <td>
                <button class="device-logout-btn" :disabled="loggingOutDeviceId === device.id" @click="logoutDevice(device.id)">
                  <i class='bx bx-log-out'></i> {{ loggingOutDeviceId === device.id ? helper.t('Logging out...') : helper.t('Logout') }}
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <div class="text-end mt-2">
        <button class="topnav__update-btn" @click="openConnectedDevicesModal()"><i class='bx bx-refresh'></i> {{ helper.t('Refresh') }}</button>
      </div>
    </div>
  </modal>
</template>

<script setup>
import { ref, inject, onMounted, watch } from 'vue';
import { RouterLink, useRoute, useRouter } from 'vue-router';
import Btn from './Btn.vue'
import cloneStudents from './cloneStudents.vue'
import ConfigSettings from './settings/ConfigSettings.vue'
import SmsModal from './SmsModal.vue'
import Modal from './modal.vue'

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
const log = console.log

let logoLongPressTimer = null
let logoLongPressTriggered = false

function handleLogoTouchStart(){
  logoLongPressTriggered = false
  logoLongPressTimer = setTimeout(() => {
    logoLongPressTriggered = true
    showDevPopup.value = true
  }, 600)
}

function cancelLogoLongPress(){
  clearTimeout(logoLongPressTimer)
}

function handleLogoTouchEnd(event){
  clearTimeout(logoLongPressTimer)
  if(logoLongPressTriggered){
    event.preventDefault()
  }
}

function reloadAllClients(){
  if(!Socket.value) return
  Socket.value.send(JSON.stringify({ type: 'force_reload' }))
}

function clearTimeAndBarcodeAllClients(){
  if(!Socket.value) return
  Socket.value.send(JSON.stringify({ type: 'clear_time_and_barcode' }))
  console.log(`Cleared all 'clear_time_and_barcode' from session storage`);
}

function clearAllStorageAllClients(){
  if(!Socket.value) return
  Socket.value.send(JSON.stringify({ type: 'clear_all_storage' }))
}

let showConnectedDevicesModal = ref(false)
let loadingConnectedDevices = ref(false)
let connectedDevicesList = ref([])
let loggingOutDeviceId = ref(null)

async function openConnectedDevicesModal(){
  showConnectedDevicesModal.value = true
  loadingConnectedDevices.value = true
  try {
    const res = await http.get('/connected-devices')
    connectedDevicesList.value = res.data?.data || []
  } catch (error) {
    connectedDevicesList.value = []
  } finally {
    loadingConnectedDevices.value = false
  }
}

async function logoutDevice(id){
  if(!confirm(helper.t('Log this device out now?'))) return
  loggingOutDeviceId.value = id
  try {
    await http.post(`/connected-devices/${id}/logout`)
    connectedDevicesList.value = connectedDevicesList.value.filter(d => d.id !== id)
  } catch (error) {
    emitter.emit('toaster-error', { message: helper.t('Failed to logout this device.') })
  } finally {
    loggingOutDeviceId.value = null
  }
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

// Android app built from /mobile-app, copied manually to public/CallingBird.apk
const MOBILE_APP_URL = '/CallingBird.apk'
// No need to offer the APK inside the app itself (window.CallingBirdApp is injected by the Android WebView)
const isInsideMobileApp = typeof window.CallingBirdApp !== 'undefined'
let checkingApk = ref(false)

async function downloadMobileApp(){
  checkingApk.value = true
  try {
    const res = await fetch(MOBILE_APP_URL, { method: 'HEAD', cache: 'no-store' })
    if(!res.ok) throw new Error(res.status)
    const link = document.createElement('a')
    link.href = MOBILE_APP_URL
    link.setAttribute('download', 'CallingBird.apk')
    document.body.appendChild(link)
    link.click()
    link.remove()
  } catch (error) {
    emitter.emit('toaster-error', { message: helper.t('Mobile app (CallingBird.apk) is not available yet.') })
  } finally {
    checkingApk.value = false
  }
}

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

.dev-popup-btn {
  background: #fff !important;
  color: #222 !important;
  text-shadow: none !important;
  border-radius: 5px;
}

.dev-popup-btn.dev-popup-btn-danger {
  background: #dc3545 !important;
  color: #fff !important;
}

.connected-devices-table-wrapper {
  overflow-x: auto;
  max-height: 60vh;
  overflow-y: auto;
}

.connected-devices-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 13px;
}

.connected-devices-table th,
.connected-devices-table td {
  padding: 8px 10px;
  border-bottom: 1px solid #e5e7eb;
  text-align: left;
  white-space: nowrap;
}

.connected-devices-table th {
  background: #f8fafc;
  position: sticky;
  top: 0;
  font-weight: 700;
  font-size: 11px;
  text-transform: uppercase;
  color: #374151;
}

.connected-devices-table td.connected-devices-ua {
  min-width: 260px;
  max-width: 420px;
  white-space: normal;
  word-break: break-word;
}

.device-type-badge {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 2px 8px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 600;
}

.device-type-desktop {
  background: rgba(59,130,246,0.12);
  color: #2563eb;
}

.device-type-mobile {
  background: rgba(34,197,94,0.12);
  color: #16a34a;
}

.device-type-tablet {
  background: rgba(234,179,8,0.15);
  color: #b45309;
}

.device-logout-btn {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 4px 10px;
  border: none;
  border-radius: 6px;
  background: #dc3545;
  color: #fff;
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  white-space: nowrap;
}

.device-logout-btn:hover:not(:disabled) {
  background: #b02a37;
}

.device-logout-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
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
  gap: 10px;
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
.topnav__app-btn:disabled {
  opacity: 0.6;
  cursor: wait;
}
.topnav__sms-btn .sms-bubble-icon {
  width: 26px;
  height: 26px;
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

  .dev-popup {
    flex-wrap: wrap;
    white-space: normal;
    max-width: min(320px, 90vw);
  }

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
  #footer-link-attendence { order: 4; }
  #footer-link-students { order: 2; }
  #footer-link-home { order: 3; }
  #footer-link-contact { order: 1; }
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
