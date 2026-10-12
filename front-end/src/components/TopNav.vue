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
        <!-- "App Download" icon: phone with a download arrow and the "App" label inside -->
        <svg xmlns="http://www.w3.org/2000/svg" width="21" height="26" viewBox="0 0 24 29" fill="none">
          <g stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round">
            <path d="M17.5 2.41667H6.5C4.84315 2.41667 3.5 4.03963 3.5 6.04167V22.9583C3.5 24.9604 4.84315 26.5833 6.5 26.5833H17.5C19.1569 26.5833 20.5 24.9604 20.5 22.9583V6.04167C20.5 4.03963 19.1569 2.41667 17.5 2.41667Z"/>
            <path d="M12 7V15.4583"/>
            <path d="M8.75 12.6875L12 16.6146L15.25 12.6875"/>
          </g>
          <path d="M6.99077 23H6.14702L7.68324 18.6364H8.65909L10.1974 23H9.35369L8.18821 19.5312H8.15412L6.99077 23ZM7.01847 21.2891H9.3196V21.924H7.01847V21.2891ZM10.7381 24.2273V19.7273H11.4966V20.2685H11.5414C11.5811 20.1889 11.6373 20.1044 11.7097 20.0149C11.7821 19.924 11.8801 19.8466 12.0037 19.7827C12.1273 19.7173 12.285 19.6847 12.4767 19.6847C12.7296 19.6847 12.9576 19.7493 13.1607 19.8786C13.3652 20.0064 13.5272 20.196 13.6465 20.4474C13.7672 20.6974 13.8276 21.0043 13.8276 21.3679C13.8276 21.7273 13.7686 22.0327 13.6507 22.2841C13.5328 22.5355 13.3723 22.7273 13.1692 22.8594C12.9661 22.9915 12.736 23.0575 12.4789 23.0575C12.2914 23.0575 12.1358 23.0263 12.0123 22.9638C11.8887 22.9013 11.7892 22.826 11.714 22.7379C11.6401 22.6484 11.5826 22.5639 11.5414 22.4844H11.5094V24.2273H10.7381ZM11.4945 21.3636C11.4945 21.5753 11.5243 21.7607 11.584 21.9197C11.6451 22.0788 11.7324 22.2031 11.8461 22.2926C11.9611 22.3807 12.1003 22.4247 12.2637 22.4247C12.4341 22.4247 12.5769 22.3793 12.6919 22.2884C12.807 22.196 12.8936 22.0703 12.9519 21.9112C13.0115 21.7507 13.0414 21.5682 13.0414 21.3636C13.0414 21.1605 13.0123 20.9801 12.954 20.8224C12.8958 20.6648 12.8091 20.5412 12.6941 20.4517C12.579 20.3622 12.4355 20.3175 12.2637 20.3175C12.0989 20.3175 11.959 20.3608 11.8439 20.4474C11.7289 20.5341 11.6415 20.6555 11.5819 20.8118C11.5236 20.968 11.4945 21.152 11.4945 21.3636ZM14.4881 24.2273V19.7273H15.2466V20.2685H15.2914C15.3311 20.1889 15.3873 20.1044 15.4597 20.0149C15.5321 19.924 15.6301 19.8466 15.7537 19.7827C15.8773 19.7173 16.035 19.6847 16.2267 19.6847C16.4796 19.6847 16.7076 19.7493 16.9107 19.8786C17.1152 20.0064 17.2772 20.196 17.3965 20.4474C17.5172 20.6974 17.5776 21.0043 17.5776 21.3679C17.5776 21.7273 17.5186 22.0327 17.4007 22.2841C17.2828 22.5355 17.1223 22.7273 16.9192 22.8594C16.7161 22.9915 16.486 23.0575 16.2289 23.0575C16.0414 23.0575 15.8858 23.0263 15.7623 22.9638C15.6387 22.9013 15.5392 22.826 15.464 22.7379C15.3901 22.6484 15.3326 22.5639 15.2914 22.4844H15.2594V24.2273H14.4881ZM15.2445 21.3636C15.2445 21.5753 15.2743 21.7607 15.334 21.9197C15.3951 22.0788 15.4824 22.2031 15.5961 22.2926C15.7111 22.3807 15.8503 22.4247 16.0137 22.4247C16.1841 22.4247 16.3269 22.3793 16.4419 22.2884C16.557 22.196 16.6436 22.0703 16.7019 21.9112C16.7615 21.7507 16.7914 21.5682 16.7914 21.3636C16.7914 21.1605 16.7623 20.9801 16.704 20.8224C16.6458 20.6648 16.5591 20.5412 16.4441 20.4517C16.329 20.3622 16.1855 20.3175 16.0137 20.3175C15.8489 20.3175 15.709 20.3608 15.5939 20.4474C15.4789 20.5341 15.3915 20.6555 15.3319 20.8118C15.2736 20.968 15.2445 21.152 15.2445 21.3636Z" fill="currentColor"/>
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
let showSettingsPanel = inject('showSettingsPanel') // shared so App.vue can skip barcode auto-focus while open
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
