<template>
  <header class="topnav bg3" id="myTopnav">
    <a ref="logo_wrapper" class="madrasha-title logo-area" :href="CONFIG?.settings?.attendance?.only_attendance_feature === true ? '#/attendence' : '#'">
      <img alt="site-logo" ref="logoEl" id="LOGO" src="" class="topnav__logo">
    </a>

    <span v-if="isIPAccess" @click="sendRemoteAction()" class="topnav__wifi" :class="is_connected_with_main_app ? 'topnav__wifi--on' : 'topnav__wifi--off'"
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
    </span>

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
      <RouterLink id="nav-link-import" :to="{name: 'import', query: {[route?.query?.dev ? 'dev' : '']: route?.query?.dev}}" :class="{'active': route.name === 'import'}" @click="sendRemoteAction({from: 'ip', action: 'onClick', selector: '#nav-link-import'})">
        <i class='bx bxs-file-import pre-icon' ></i> {{ helper.t('Import') }}
      </RouterLink>
      <RouterLink id="nav-link-contact" :to="{name: 'ContactUs', query: {[route?.query?.dev ? 'dev' : '']: route?.query?.dev}}" :class="{'active': route.name === 'ContactUs'}" 
        @click="sendRemoteAction({from: 'ip', action: 'onClick', selector: '#nav-link-contact'})"
         >
        {{ helper.t('Contact') }}
      </RouterLink>

      <div class="topnav__version">
        <span v-if="isNewVersion" class="topnav__new-version" @click="showVersionUpdateModal">
          {{ helper.t('New:') }} v{{ appAccessData?.incoming_version }}
        </span>
        <span class="topnav__version-text" v-else-if="appAccessData?.app_version">v{{ appAccessData?.app_version }}</span>
        <button class="topnav__update-btn" :tooltip="helper.t('Update App')" flow="down" @click="showVersionUpdateModal">
          <svg v-if="!isNewVersion" xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="23 4 23 10 17 10"/>
            <polyline points="1 20 1 14 7 14"/>
            <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/>
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
          <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="12" cy="12" r="3"/>
            <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/>
          </svg>
        </button>
       
      </div>

      <div v-if="useRoute().query.dev === 'true'" class="topnav__dev">
        <span class="border cp me-1 text-white px-1 size-08" @click.prevent.stop="$goto({name: 'env'})">
          <span :tooltip="helper.t('Show Config.js')" flow="left">{{ helper.t('Config') }}</span>
        </span>
        <span class="border cp me-1 text-white px-1 size-08" @click.prevent.stop="show_bulk_attedance_component = true">
          <span :tooltip="helper.t('Bulk Attendence')" flow="left">{{ helper.t('Bulk') }}</span>
        </span>
        <span class="border cp me-0 text-white px-1 size-08" @click.prevent.stop="show_cloner_component = true">
          <span :tooltip="helper.t('Clone Students')" flow="left">{{ helper.t('Clone') }}</span>
        </span>
        <span class="border cp me-0 text-white px-1 size-08" @click.prevent.stop="getTemporaryZip">
          <span :tooltip="helper.t('Temporary update')" flow="left">
            <template v-if="temp_updating">
                {{ helper.t('Temp') }}<BtnLoader></BtnLoader>
            </template>
            <template v-else>
              {{ helper.t('Temp') }}
            </template>
          </span>
        </span>
      </div>
    </nav>
  </header>
  <cloneStudents v-if="show_cloner_component" @unmount="show_cloner_component = false"></cloneStudents>
  <ConfigSettings v-if="showSettingsPanel" @unmount="showSettingsPanel = false" />
  <SmsModal v-if="showSmsModal" @close="showSmsModal = false" />

  <Teleport to="body">
    <div v-if="showConfirmModal" class="update-modal-overlay">
      <div class="update-modal update-modal--confirm">
        <p class="update-modal__title">{{ helper.t('Update App?') }}</p>
        <p class="update-modal__sub" v-if="appAccessData?.incoming_version">
          v{{ appAccessData.app_version }} → v{{ appAccessData.incoming_version }}
        </p>
        <p class="update-modal__changelog" v-if="appAccessData?.change_log">
          {{ appAccessData?.change_log }}
        </p>
        <label class="update-modal__checkbox">
          <input type="checkbox" v-model="autoUpdateEnabled" @change="maybeAutoUpdate" />
          {{ helper.t('Allow automatic update') }}
        </label>
        <div class="update-modal__actions">
          <button class="update-modal__btn update-modal__btn--cancel" @click="showConfirmModal = false">{{ helper.t('Cancel') }}</button>
          <button class="update-modal__btn update-modal__btn--ok" @click="confirmAndUpdate">{{ helper.t('Update') }}</button>
        </div>
      </div>
    </div>

    <div v-if="showUpdateModal" class="update-modal-overlay">
      <div class="update-modal">
        <template v-if="!updateDone">
          <div class="update-modal__spinner"></div>
          <p class="update-modal__text">{{ helper.t('Updating app...') }}</p>
        </template>
        <template v-else>
          <div class="update-modal__check">✓</div>
          <p class="update-modal__text">{{ helper.t('Update successful! Reloading...') }}</p>
        </template>
      </div>
    </div>
  </Teleport>
</template>

<script setup>
import { ref, inject, computed, onMounted, watch, onBeforeUnmount } from 'vue';
import { RouterLink, useRoute, useRouter } from 'vue-router';
import Btn from './Btn.vue'
import cloneStudents from './cloneStudents.vue'
import BtnLoader from './BtnLoader.vue';
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
const appAccessData = inject('appAccessData');
const http = inject('http');
const allow_to_reaload = inject('allow_to_reaload');
const storage = inject('storage');
const helper = inject('helper');
let showSmsModal = inject('showSmsModal')
let show_cloner_component = inject('show_cloner_component')
let showSettingsPanel = ref(false)
let showConfirmModal = ref(false)
let showUpdateModal = ref(false)
let updateDone = ref(false)
let temp_updating = ref(false)
const autoUpdateEnabled = ref(storage('cb_auto_update', true).value)
watch(autoUpdateEnabled, (val) => { storage('cb_auto_update').value = val })

const isNewVersion = computed(() => {
    const installed = appAccessData?.value?.app_version;
    const incoming  = appAccessData?.value?.incoming_version;
    if (route.query.dev === 'true') console.log({installed, incoming});
    if (!installed || !incoming) return false;
    return incoming !== installed;
})
const realod_after = 4000
const checking_accessibility = inject('checking_accessibility')
watch(checking_accessibility, (bool) => {
  if (route.query.dev === 'true'){
    console.log('===checking_accessibility', bool);
  }
  if(bool === false){
    maybeAutoUpdate()
  }
})



function maybeAutoUpdate() {
    if (isNewVersion.value && autoUpdateEnabled.value) { 
      confirmAndUpdate(); 
    }
}

function showVersionUpdateModal() {
    showConfirmModal.value = true;
}



async function confirmAndUpdate() {
    if (showUpdateModal.value) return;
    showConfirmModal.value = false;
    showUpdateModal.value = true;
    updateDone.value = false;
    try {
        await http.get('/update-app', { params: { new_version: appAccessData?.value?.incoming_version, change_log: appAccessData?.value?.change_log } });
        updateDone.value = true;
        allow_to_reaload.value = true;
        setTimeout(() => { window.location.reload(); }, realod_after);
    } catch (err) {
        showUpdateModal.value = false;
        emitter.emit('toaster-error', { message: helper.t('Update failed.') });
    }
}

async function getTemporaryZip() {
    temp_updating.value = true;
    updateDone.value = false;
    try {
        await http.get('/update-app', { params: { debug_mode: true } });
        updateDone.value = true;
        allow_to_reaload.value = true;
        emitter.emit('toaster-success', { message: helper.t('Updated'), duration: 0 });
        setTimeout(() => { window.location.reload(); }, realod_after);
    } catch (err) {
        emitter.emit('toaster-error', { message: helper.t('Update failed.') });
    } finally {
        temp_updating.value = false;
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

.topnav__new-version {
  background: #4caf50;
  color: #fff;
  font-size: 11px;
  font-weight: 700;
  padding: 3px 8px;
  border-radius: 12px;
  cursor: pointer;
  letter-spacing: 0.3px;
  animation: new-ver-pulse 1.5s ease-in-out infinite;
}
@keyframes new-ver-pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.7; }
}

.topnav__version {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  margin-left: auto;
  color: rgba(255,255,255,0.7);
  font-size: 12px;
}
.topnav__version-text {
  font-weight: 600;
  letter-spacing: 0.5px;
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

.update-modal--confirm {
  padding: 28px 32px;
  gap: 14px;
  min-width: 300px;
  width: 300px;
}
.update-modal__title {
  color: #fff;
  font-size: 17px;
  font-weight: 700;
  margin: 0;
}
.update-modal__sub {
  color: rgba(255,255,255,0.5);
  font-size: 13px;
  margin: 0;
}
.update-modal__changelog {
  color: rgba(255,255,255,0.75);
  font-size: 12px;
  margin: 0;
  padding: 8px 12px;
  border: 1px solid rgba(255,255,255,0.12);
  border-radius: 8px;
  background: rgba(255,255,255,0.05);
  width: 100%;
  box-sizing: border-box;
  line-height: 1.5;
}
.update-modal__checkbox {
  display: flex;
  align-items: center;
  gap: 8px;
  color: rgba(255,255,255,0.75);
  font-size: 13px;
  cursor: pointer;
  user-select: none;
  width: 100%;
}
.update-modal__checkbox input { cursor: pointer; }
.update-modal__actions {
  display: flex;
  gap: 10px;
  width: 100%;
  margin-top: 4px;
}
.update-modal__btn {
  flex: 1;
  padding: 8px 0;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
}
.update-modal__btn--cancel {
  background: rgba(255,255,255,0.1);
  color: rgba(255,255,255,0.8);
}
.update-modal__btn--cancel:hover { background: rgba(255,255,255,0.15); }
.update-modal__btn--ok {
  background: #4caf50;
  color: #fff;
}
.update-modal__btn--ok:hover { background: #43a047; }

.update-modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
}
.update-modal {
  background: #1f2937;
  border-radius: 14px;
  padding: 40px 52px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
  min-width: 220px;
}
.update-modal__spinner {
  width: 48px;
  height: 48px;
  border: 4px solid rgba(255,255,255,0.15);
  border-top-color: #4caf50;
  border-radius: 50%;
  animation: update-spin 0.8s linear infinite;
}
@keyframes update-spin {
  to { transform: rotate(360deg); }
}
.update-modal__check {
  width: 48px;
  height: 48px;
  background: rgba(76,175,80,0.2);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #4caf50;
  font-size: 24px;
  font-weight: bold;
}
.update-modal__text {
  color: rgba(255,255,255,0.85);
  font-size: 15px;
  margin: 0;
  white-space: nowrap;
}
</style>
