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
        <div v-if="companyName" class="dev-popup__company">{{ companyName }}</div>
        <div class="dev-popup__actions">
        
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
        <!-- "App Download" icon: phone with a download arrow, "App" label below -->
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="29" viewBox="0 0 24 39" fill="none">
          <g stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round">
            <path d="M17.5 2H6.5C4.84315 2 3.5 3.34315 3.5 5V19C3.5 20.6569 4.84315 22 6.5 22H17.5C19.1569 22 20.5 20.6569 20.5 19V5C20.5 3.34315 19.1569 2 17.5 2Z"/>
            <path d="M12 6.75V13.75"/>
            <path d="M8.75 10.5L12 13.75L15.25 10.5"/>
            <path d="M10 18.25H14"/>
          </g>
          <path d="M3.65128 36H2.24503L4.8054 28.7273H6.43182L8.99574 36H7.58949L5.64702 30.2188H5.5902L3.65128 36ZM3.69744 33.1484H7.53267V34.2067H3.69744V33.1484ZM9.89684 38.0455V30.5455H11.161V31.4474H11.2356C11.3019 31.3149 11.3954 31.174 11.5162 31.0249C11.6369 30.8733 11.8002 30.7443 12.0062 30.6378C12.2122 30.5289 12.475 30.4744 12.7946 30.4744C13.216 30.4744 13.5959 30.5821 13.9345 30.7976C14.2754 31.0107 14.5453 31.3267 14.7441 31.7457C14.9454 32.1624 15.046 32.6738 15.046 33.2798C15.046 33.8788 14.9477 34.3878 14.7512 34.8068C14.5547 35.2259 14.2872 35.5455 13.9487 35.7656C13.6101 35.9858 13.2266 36.0959 12.7981 36.0959C12.4856 36.0959 12.2264 36.0438 12.0204 35.9396C11.8145 35.8355 11.6487 35.71 11.5233 35.5632C11.4002 35.4141 11.3043 35.2732 11.2356 35.1406H11.1824V38.0455H9.89684ZM11.1575 33.2727C11.1575 33.6255 11.2072 33.9344 11.3066 34.1996C11.4084 34.4647 11.554 34.6719 11.7434 34.821C11.9352 34.9678 12.1672 35.0412 12.4395 35.0412C12.7235 35.0412 12.9615 34.9654 13.1532 34.8139C13.345 34.66 13.4894 34.4505 13.5865 34.1854C13.6859 33.9179 13.7356 33.6136 13.7356 33.2727C13.7356 32.9342 13.6871 32.6335 13.59 32.3707C13.493 32.108 13.3485 31.902 13.1568 31.7528C12.965 31.6037 12.7259 31.5291 12.4395 31.5291C12.1648 31.5291 11.9316 31.6013 11.7399 31.7457C11.5481 31.8902 11.4025 32.0926 11.3031 32.353C11.206 32.6134 11.1575 32.92 11.1575 33.2727ZM16.1468 38.0455V30.5455H17.411V31.4474H17.4856C17.5519 31.3149 17.6454 31.174 17.7662 31.0249C17.8869 30.8733 18.0502 30.7443 18.2562 30.6378C18.4622 30.5289 18.725 30.4744 19.0446 30.4744C19.466 30.4744 19.8459 30.5821 20.1845 30.7976C20.5254 31.0107 20.7953 31.3267 20.9941 31.7457C21.1954 32.1624 21.296 32.6738 21.296 33.2798C21.296 33.8788 21.1977 34.3878 21.0012 34.8068C20.8047 35.2259 20.5372 35.5455 20.1987 35.7656C19.8601 35.9858 19.4766 36.0959 19.0481 36.0959C18.7356 36.0959 18.4764 36.0438 18.2704 35.9396C18.0645 35.8355 17.8987 35.71 17.7733 35.5632C17.6502 35.4141 17.5543 35.2732 17.4856 35.1406H17.4324V38.0455H16.1468ZM17.4075 33.2727C17.4075 33.6255 17.4572 33.9344 17.5566 34.1996C17.6584 34.4647 17.804 34.6719 17.9934 34.821C18.1852 34.9678 18.4172 35.0412 18.6895 35.0412C18.9735 35.0412 19.2115 34.9654 19.4032 34.8139C19.595 34.66 19.7394 34.4505 19.8365 34.1854C19.9359 33.9179 19.9856 33.6136 19.9856 33.2727C19.9856 32.9342 19.9371 32.6335 19.84 32.3707C19.743 32.108 19.5985 31.902 19.4068 31.7528C19.215 31.6037 18.9759 31.5291 18.6895 31.5291C18.4148 31.5291 18.1816 31.6013 17.9899 31.7457C17.7981 31.8902 17.6525 32.0926 17.5531 32.353C17.456 32.6134 17.4075 32.92 17.4075 33.2727Z" fill="currentColor"/>
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

  <modal v-if="showApkUploadModal" :title="helper.t('Upload Android App')" width="460px" @close="closeApkUploadModal()">
    <div class="apk-upload">
      <p class="apk-upload__note">
        {{ helper.t('The Android app is not uploaded yet. Upload the APK file; it will be saved as') }}
        <code>CallingBird.apk</code>.
      </p>
      <input type="file" accept=".apk,application/vnd.android.package-archive" class="form-control" :disabled="uploadingApk" @change="apkFile = $event.target.files[0] || null">
      <div v-if="uploadingApk" class="apk-upload__progress">
        <div class="apk-upload__bar" :style="{ width: apkUploadProgress + '%' }"></div>
        <span>{{ apkUploadProgress }}%</span>
      </div>
      <div class="text-end mt-3">
        <button class="btn btn-secondary me-2" :disabled="uploadingApk" @click="closeApkUploadModal()">{{ helper.t('Cancel') }}</button>
        <button class="btn btn-primary" :disabled="!apkFile || uploadingApk" @click="uploadMobileApp()">
          {{ uploadingApk ? helper.t('Uploading...') : helper.t('Upload APK') }}
        </button>
      </div>
    </div>
  </modal>

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
const companyName = globalThis.GLOBAL_DATA?.env?.COMPANY || ''

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
    // Not uploaded yet: let the user upload it to public/CallingBird.apk
    showApkUploadModal.value = true
  } finally {
    checkingApk.value = false
  }
}

let showApkUploadModal = ref(false)
let apkFile = ref(null)
let uploadingApk = ref(false)
let apkUploadProgress = ref(0)

function closeApkUploadModal(){
  if(uploadingApk.value) return
  showApkUploadModal.value = false
  apkFile.value = null
}

async function uploadMobileApp(){
  if(!apkFile.value) return
  if(!/\.apk$/i.test(apkFile.value.name)){
    emitter.emit('toaster-error', { message: helper.t('Only .apk files are allowed.') })
    return
  }
  const formData = new FormData()
  formData.append('apk', apkFile.value)
  uploadingApk.value = true
  apkUploadProgress.value = 0
  try {
    const res = await http.post('/mobile-app', formData, {
      formData: true,
      onUploadProgress: (e) => { if(e.total) apkUploadProgress.value = Math.round(e.loaded * 100 / e.total) },
    })
    emitter.emit('toaster-success', { message: res.data?.message || helper.t('Uploaded.') })
    uploadingApk.value = false
    closeApkUploadModal()
  } catch (error) {
    uploadingApk.value = false
    emitter.emit('toaster-error', { message: error?.response?.data?.message || helper.t('Upload failed.') })
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
  flex-direction: column;
  align-items: stretch;
  padding: 8px 10px;
  background: var(--grad3);
  border-radius: 8px;
  box-shadow: 0 6px 20px rgba(0,0,0,0.35);
  white-space: nowrap;
}

.dev-popup__company {
  /* width:0 + min-width:100% → wraps to the button row's width instead of stretching the popup */
  width: 0;
  min-width: 100%;
  white-space: normal;
  color: #fff;
  font-size: 14px;
  font-weight: 700;
  text-shadow: none;
  padding: 0 2px 6px;
  margin-bottom: 6px;
  border-bottom: 1px solid rgba(255,255,255,0.2);
}

.dev-popup__actions {
  display: flex;
  align-items: center;
  gap: 6px;
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
.apk-upload__note {
  font-size: 14px;
  margin-bottom: 12px;
}
.apk-upload__progress {
  position: relative;
  height: 20px;
  margin-top: 12px;
  background: #e5e7eb;
  border-radius: 6px;
  overflow: hidden;
}
.apk-upload__bar {
  height: 100%;
  background: #22c55e;
  transition: width 0.2s;
}
.apk-upload__progress span {
  position: absolute;
  inset: 0;
  text-align: center;
  font-size: 12px;
  line-height: 20px;
  font-weight: 600;
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
    white-space: normal;
    max-width: min(320px, 90vw);
  }
  .dev-popup__actions {
    flex-wrap: wrap;
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
