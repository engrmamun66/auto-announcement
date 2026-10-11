<template>
  <!-- Attendance Cards -->
   
  <div class="mt-3 live-attendace-area">
    <div class="live-attendace-header">
      <div class="live-attendace-title">{{ helper.t('Realtime Attendance') }}</div>
      <div class="live-attendace-legend">
        <span class="legend-item">
          <span class="legend-dot legend-present"></span> {{ helper.t('Present') }}
        </span>
        <span class="legend-item">
          <span class="legend-dot legend-late"></span> {{ helper.t('Late') }}
        </span>
        <span class="legend-item">
          <span class="legend-dot legend-out"></span> {{ helper.t('Just-Out') }}
        </span>
      </div>
    </div>
    <div class="max-heigt-for-live-attendace">

      <template v-if="liveAttendenceList?.length">
          <div class="row row-cols-1 row-cols-sm-2 row-cols-md-3 row-cols-lg-4 g-3">
              <template v-for="(item, i) in liveAttendenceList" :key="getLiveKey(item, i)">
                <div class="col position-relative" :style="`order:${-(i + 1)}`" @auxclick="log(item)">

                  <!-- ===== Design 2: Face Focus — photo fills the card, details slide up on hover (tap on touch screens) ===== -->
                  <div v-if="cardDesign === 2" class="ff-card" :class="['is-' + statusKey(item), { live_data: item?.live_data, 'ff-open': openDetailsKey === getLiveKey(item, i) }]"
                    @click="toggleDetails(item, i)">
                    <img class="ff-photo" :src="getProfileImage(getStudent(item))" alt="profile" />
                    <div class="ff-chips">
                      <span class="ff-chip">ID: {{ item?.student_id }}</span>
                      <span class="ff-chip">{{ item?.in_time ? 'IN' : 'OUT' }}</span>
                    </div>
                    <div class="ff-panel">
                      <div class="ff-head">
                        <h4 class="ff-name">{{ getStudent(item)?.name || 'Unknown' }}</h4>
                        <span class="ff-status-pill" :tooltip="lateTooltip(item)">{{ statusText(item) }}</span>
                      </div>
                      <div class="ff-details">
                        <ul class="list-unstyled mb-0">
                          <li><strong>{{ helper.t('Class :') }}</strong> {{ getStudent(item)?.class || 'Unknown' }}</li>
                          <li v-if="lateText(item)"><strong>{{ helper.t('Status :') }}</strong> {{ lateText(item) }}</li>
                          <li><strong>{{ item?.in_time ? helper.t('In Time :') : helper.t('Out Time :') }}</strong> {{ timeValue(item) }}</li>
                          <li><strong>{{ helper.t('Shift :') }}</strong> {{ Ahelper.printShift(item?.shift_duration) }}</li>
                        </ul>
                        <div v-if="item?.remarks" class="ff-remarks">
                          <span>“{{ item.remarks }}”</span>
                          <span class="d-flex column-gap-1">
                            <span class="ff-mini">{{ Ahelper.printDate(item) }}</span>
                            <span class="ff-mini cp" @click.stop="deleteAttedence(item)"><i class='bx bxs-trash'></i></span>
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <!-- ===== Design 3: Standard — white card; status shown by top bar, photo ring and chip; time is the headline ===== -->
                  <div v-else-if="cardDesign === 3" class="std-card" :class="['is-' + statusKey(item), { live_data: item?.live_data }]">
                    <div class="std-head">
                      <div class="std-avatar">
                        <img class="std-photo" :src="getProfileImage(getStudent(item))" alt="profile" />
                        <span class="std-dir" :title="item?.in_time ? 'IN' : 'OUT'">
                          <i :class="item?.in_time ? 'bx bx-log-in' : 'bx bx-log-out'"></i>
                        </span>
                      </div>
                      <div class="std-title">
                        <h4 class="std-name" :title="getStudent(item)?.name">{{ getStudent(item)?.name || 'Unknown' }}</h4>
                        <div class="std-sub">
                          <span class="std-id">#{{ item?.student_id }}</span>
                          <span class="std-class">{{ getStudent(item)?.class || 'Unknown' }}</span>
                        </div>
                      </div>
                    </div>

                    <div class="std-time-block" :tooltip="lateTooltip(item)">
                      <div class="std-time-label">{{ item?.in_time ? helper.t('In Time :') : helper.t('Out Time :') }}</div>
                      <div class="std-time">{{ timeValue(item) }}</div>
                      <div class="std-status-row">
                        <span class="std-chip">{{ statusText(item) }}</span>
                        <span v-if="lateText(item)" class="std-late">{{ lateText(item) }}</span>
                      </div>
                    </div>

                    <div class="std-foot">
                      <span class="std-shift"><i class='bx bx-time-five'></i> {{ Ahelper.printShift(item?.shift_duration) }}</span>
                      <span class="d-flex column-gap-1">
                        <span class="std-mini">{{ Ahelper.printDate(item) }}</span>
                        <button class="std-del" type="button" :title="helper.t('Delete this attendance?')" @click.stop="deleteAttedence(item)"><i class='bx bxs-trash'></i></button>
                      </span>
                    </div>
                    <div v-if="item?.remarks" class="std-remarks">“{{ item.remarks }}”</div>
                  </div>

                  <!-- ===== Design 1: Default ===== -->
                  <template v-else>
                    <div class="popup in-out d-flex">
                        <span class="badge text-dark">
                          ID: {{ item?.student_id }}
                        </span>
                        <span class="badge text-dark bg-body-secondary">
                            {{ item?.in_time ? 'IN' : 'OUT' }}
                        </span>
                    </div>
                    <div @auxclick="deleteAttedence(item)" class="position-absolute cp text-white opacity-0" style="left:10px;top:-2px;z-index: 1;">
                        
                    </div>
                    
                
                    <div class="attendance-card shadow-sm" :class="{
                        'status-present': item?.status?.toLowerCase() === 'present',
                        'status-absent': item?.status?.toLowerCase() === 'late',
                        'status-outtime': !item.in_time,
                        'live_data': item?.live_data,
                    }"
                    >
                    <div class="d-flex justify-content-center mb-2 profile-wrap mt-4">
                        <img class="profile-thumb" :src="getProfileImage(getStudent(item))" alt="profile" />
                    </div>
                    <div class="d-flex justify-content-between align-items-center mb-2" >
                        <h4 class="student-name"> {{ getStudent(item)?.name || "Unknown" }} </h4>
                    </div>

                    <ul class="list-unstyled mb-2">
                        <li><strong>{{ helper.t('Class :') }}</strong> <span class="ms-1">{{ getStudent(item)?.class || "Unknown" }}</span></li>
                        <li :tooltip="(late_consideration_minute && item?.in_time) ? `${late_consideration_minute} ${helper.t('minutes_consideration_given')}` : ''">
                            <strong>{{ helper.t('Status :') }}</strong>
                            <span status class="ms-1">{{ item?.in_time ? item?.status : helper.t('Just-Out') }}</span>
                            <span v-if="item?.in_time && item?.late_in_minute" class="ms-1">{{ item?.late_in_minute > 0 ? `${item?.late_in_minute} ${helper.t('min_late')}` : `${Math.abs(item?.late_in_minute)} ${helper.t('min_early')}` }}</span>
                        </li>
                        <li>
                          <template v-if="item?.in_time">
                              <strong>{{ helper.t('In Time :') }}</strong> <span class="ms-1">{{ Ahelper.timeFromTime(item?.in_time) }}</span>
                          </template>
                          <template v-else>
                              <strong>{{ helper.t('Out Time :') }}</strong> <span class="ms-1">{{ Ahelper.timeFromTime(item?.out_time) }}</span>
                          </template>
                        </li>
                        <li><strong>{{ helper.t('Shift :') }}</strong> <span class="ms-1">{{ Ahelper.printShift(item?.shift_duration) }}</span> </li>
                    </ul>

                    <div v-if="item?.remarks" class="remarks small d-flex justify-content-between align-items-center"> 
                        <span>“{{ item.remarks }}”</span>
                        <div class="d-flex justify-content-end column-gap-1">
                          <span class="badge text-dark bg-body-secondary">
                            {{ Ahelper.printDate(item) }}
                          </span>
                          <span class="badge cp" @click.stop="deleteAttedence(item)">
                              <i class='bx bxs-trash' ></i>
                          </span>
                        </div>
                      </div>
                    </div>
                  </template>

                  <!-- Card menu, shared by all designs -->
                  <button class="card-menu-toggle" :class="{ 'card-menu-toggle--light': cardDesign === 3 }" type="button" @click.stop="toggleCardMenu(item, i)" :aria-label="helper.t('Card menu')">
                    <i class="bx bx-menu"></i>
                  </button>
                  <div v-if="isCardMenuOpen(item, i)" class="card-menu">
                    <button @click="$goto({name: 'students', query: { dakhela: getStudent(item)?.dakhela } })" class="btn smallerbtn btn-outline-secondary card-menu-btn" >
                      Find
                    </button>
                    <button class="btn smallerbtn btn-outline-secondary card-menu-btn" @click="() => {
                      parent_tab = 4;
                      helper.delay(()=> emitter.emit('student_id_for_report', getStudent(item)?.dakhela), 100)
                    }">
                      Report
                    </button>
                  </div>
                </div>
              </template>
          </div>
      </template>
      <template v-else>
      <!-- No Attendance Found Message -->
      <div class="col-12">
          <div
          class="text-center no-data-card d-flex flex-column justify-content-center align-items-center"
          >
          <h5 class="text-muted mb-2 fs-4">{{ helper.t('No Attendance Records Found') }}</h5>
          <p class="text-secondary mb-0">
              <span class="badge bg-white text-danger fs-5">{{ helper.t('Live attendance list is currently empty.') }}</span>
          </p>
          </div>
      </div>
      </template>
    </div>
  </div>
</template>

<script setup>
import { inject, ref, onMounted, watch, nextTick, onBeforeUnmount } from "vue";
import Ahelper from "./attendacnceHelper";
import { getSelectedRealtimeCard } from "./realtimeCardDesigns";

const http = inject('http');
const CONFIG = inject("CONFIG");
const emitter = inject('emitter');
const helper = inject("helper");
const classes = inject("classes");
const parent_tab = inject("parent_tab");
const attendenceList = inject("attendenceList");
const all_students_non_copied = inject("all_students_non_copied");
const liveAttendenceList = inject("liveAttendenceList");

let log = console.log

const late_consideration_minute = CONFIG.value?.settings?.attendance?.late_consideration_minute || 0
// 1 = Default, 2 = Face Focus, 3 = Standard (Settings → Settings tab)
const cardDesign = getSelectedRealtimeCard(CONFIG.value?.settings?.attendance)
// Face Focus: on touch screens (no hover) a tap opens the details panel
const openDetailsKey = ref(null)
const toggleDetails = (item, i) => {
  const key = getLiveKey(item, i)
  openDetailsKey.value = openDetailsKey.value === key ? null : key
}

const statusKey = (item) => !item?.in_time ? 'out' : (item?.status?.toLowerCase() === 'late' ? 'late' : 'present')
const statusText = (item) => item?.in_time ? item?.status : helper.t('Just-Out')
const lateText = (item) => {
  if (!item?.in_time || !item?.late_in_minute) return ''
  return item.late_in_minute > 0
    ? `${item.late_in_minute} ${helper.t('min_late')}`
    : `${Math.abs(item.late_in_minute)} ${helper.t('min_early')}`
}
const lateTooltip = (item) => (late_consideration_minute && item?.in_time) ? `${late_consideration_minute} ${helper.t('minutes_consideration_given')}` : ''
const timeValue = (item) => Ahelper.timeFromTime(item?.in_time || item?.out_time)
let isMounted = ref(false)
const LIVE_ANIM_MS = 900
const openMenuId = ref(null)

const getStudent = ({ student_id }) =>
  all_students_non_copied.value.find((std) => std.dakhela == student_id);

const getProfileImage = (student) => {
  const img = student?.profile_image
  if (!img) return '/default-profile-image.png'
  if (/^https?:\/\//i.test(img) || /^data:/i.test(img)) return img
  const base = globalThis.GLOBAL_DATA?.env?.API_BASE_URL || ''
  if (!base) return img.startsWith('/') ? img : `/${img}`
  return img.startsWith('/') ? `${base}${img}` : `${base}/${img}`
}

const getLiveKey = (item, i) =>
  item?.id || item?.identity_string || `${item?.student_id || 'std'}-${item?.in_time || item?.out_time || i}`;

const getMenuKey = (item, i) => getLiveKey(item, i)

function toggleCardMenu(item, i){
  const key = getMenuKey(item, i)
  openMenuId.value = openMenuId.value === key ? null : key
}

function isCardMenuOpen(item, i){
  return openMenuId.value === getMenuKey(item, i)
}

onMounted(()=>{
  setTimeout(() => {
    isMounted.value = true
  }, 500);

  const closeMenus = () => {
    openMenuId.value = null
  }
  document.addEventListener('click', closeMenus)
  // store ref for cleanup
  __closeMenusHandler.value = closeMenus
})

const __closeMenusHandler = ref(null)
onBeforeUnmount(() => {
  if (__closeMenusHandler.value) {
    document.removeEventListener('click', __closeMenusHandler.value)
  }
})

async function triggerLiveAnimation(item){
  if (!item) return;
  item.live_data = true;
  await nextTick();
  if (item.__live_timeout) clearTimeout(item.__live_timeout);
  item.__live_timeout = setTimeout(() => {
    item.live_data = false;
    item.__live_timeout = null;
  }, LIVE_ANIM_MS);
}

watch(
  () => liveAttendenceList.value.length,
  (len, prev) => {
    if (len > prev) {
      const newest = liveAttendenceList.value[len - 1];
      triggerLiveAnimation(newest);
    }
  }
);

function deleteAttedence(item){
  if(!confirm(helper.t('Delete this attendance?'))) return
  http.delete(`/attendence-delete/${item.id}`).then(response => {
    if(response.status === 200){
      liveAttendenceList.value = liveAttendenceList.value.filter(_item => _item.id != item.id)
      emitter.emit('toaster-success', {message: helper.t('Attendance deleted!')})
    }
  })
}

</script>

<style scoped>
.live-attendace-header{
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  margin-bottom: 12px;
}

.live-attendace-title{
  font-weight: 700;
  font-size: 16px;
  color: #111827;
}

.live-attendace-legend{
  display: inline-flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
}

.legend-item{
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  color: #374151;
  font-weight: 600;
}

.legend-dot{
  width: 10px;
  height: 10px;
  border-radius: 50%;
  display: inline-block;
}

.legend-present{
  background-color: #2ab361;
}

.legend-late{
  background-color: #f0893a;
}

.legend-out{
  background-color: #0e94b1;
}

.card-menu-toggle{
  position: absolute;
  top: 10px;
  right: calc(var(--bs-gutter-x, 1rem) * 0.5 + 10px);
  z-index: 2;
  width: 34px;
  height: 34px;
  border-radius: 10px;
  border: 1px solid rgba(255, 255, 255, 0.35);
  background: rgba(255, 255, 255, 0.12);
  color: #ffffff;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
  cursor: pointer;
  backdrop-filter: blur(6px);
}

.card-menu-toggle:hover{
  background: rgba(255, 255, 255, 0.2);
}

.card-menu{
  position: absolute;
  top: 50px;
  right: calc(var(--bs-gutter-x, 1rem) * 0.5 + 10px);
  background: #ffffff;
  border: 1px solid #e5e7eb;
  border-radius: 10px;
  padding: 8px;
  display: grid;
  gap: 6px;
  z-index: 2;
  box-shadow: 0 10px 20px rgba(15, 23, 42, 0.15);
}

.card-menu-btn{
  font-size: 11px;
  padding: 2px 6px;
  line-height: 1.1;
  display: inline-flex;
  align-items: center;
  gap: 4px;
}

.card-menu-label{
  font-weight: 700;
  color: #6b7280;
}

.live-attendace-area{
  background: #f8fafc;
  border: 1px solid #e5e7eb;
  padding: 16px;
  border-radius: 12px;
}

.max-heigt-for-live-attendace{
  max-height: calc(100vh - 200px);
  overflow-y: auto;
  padding-bottom: 20px;
}

.attendance-card{
  background: #ffffff;
  border-radius: 12px;
  padding: 16px 16px 12px;
  border: 1px solid #e5e7eb;
  transition: box-shadow 0.2s ease, transform 0.2s ease;
  color: #111827;
  position: relative;
  min-height: 100%;
}

.attendance-card:hover{
  box-shadow: 0 8px 18px rgba(15, 23, 42, 0.12);
  transform: translateY(-2px);
}

.attendance-card.live_data{
  animation: livePulse 0.9s ease;
  box-shadow: 0 10px 22px rgba(25, 135, 84, 0.2);
  border-color: rgba(25, 135, 84, 0.35);
}

.profile-thumb{
  width: 48px;
  height: 48px;
  border-radius: 50%;
  object-fit: cover;
  border: 1px solid #e2e8f0;
  background: #fff;
}
.profile-wrap{
  margin-top: 10px;
}

.student-name{
  margin: 0;
  font-weight: 700;
  font-size: 15px;
  color: #0f172a;
  width: 100%;
  text-align: center;
}

.attendance-card ul{
  margin: 0;
  padding: 0;
}

.attendance-card li{
  margin-bottom: 6px;
  font-size: 13px;
  color: #1f2937;
}

.status-present{
  background-color: #2ab361;
  color: #fff !important;
}

.status-absent{
  background-color: #f0893a;
  color: #fff !important;
}

.status-outtime{
  background-color: #0e94b1;
  color: #fff !important;
}

.status-present .badge,
.status-absent .badge{
  background: rgba(255, 255, 255, 0.2) !important;
  color: #fff !important;
}

.remarks{
  border-top: 1px dashed rgba(255, 255, 255, 0.4);
  padding-top: 6px;
  font-style: italic;
  font-size: 12px;
}

.no-data-card{
  min-height: 220px;
  background-color: #ffffff;
  border: 1px dashed #cbd5e1;
  border-radius: 12px;
}

span[status]{
  background-color: rgba(255, 255, 255, 0.18);
  padding: 2px 8px;
  border-radius: 6px;
  color: #ffffff;
  transform: translateY(-1px);
  border: 1px solid #ffffff54;
  display: inline-block;
}

.popup{
  position: absolute;
  padding: 4px 10px;
  text-align: center;
  background: #3e4453f2;
  color: #ffffff;
  border-radius: 999px;
  top: 8px;
  box-shadow: 0px 6px 18px rgba(15, 23, 42, 0.25);
  z-index: 1;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-size: 11px;
  letter-spacing: 0.2px;
}

.popup .badge{
  color: #ffffff !important;
  background: rgba(255, 255, 255, 0.12) !important;
  font-weight: 600;
  border: 1px solid rgba(255, 255, 255, 0.18);
}

.popup.in-out{
  left: 50%;
  transform: translateX(-50%);
}

.card-menu-toggle--light{
  border-color: #e5e7eb;
  background: #f8fafc;
  color: #475569;
}
.card-menu-toggle--light:hover{
  background: #eef2f7;
}

/* ===== Design 2: Face Focus ===== */
.ff-card{
  --ff-accent: #2ab361;
  position: relative;
  height: 100%;
  min-height: 340px;
  border-radius: 14px;
  overflow: hidden;
  background: #1f2937;
  cursor: pointer;
  box-shadow: 0 6px 16px rgba(15, 23, 42, 0.18);
  border-bottom: 5px solid var(--ff-accent);
}
.ff-card.is-late{ --ff-accent: #f0893a; }
.ff-card.is-out{ --ff-accent: #0e94b1; }
.ff-card.live_data{ animation: livePulse 0.9s ease; }

.ff-photo{
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.4s ease;
}
.ff-card:hover .ff-photo,
.ff-card.ff-open .ff-photo{
  transform: scale(1.06);
}

.ff-chips{
  position: absolute;
  top: 12px;
  left: 12px;
  display: flex;
  gap: 6px;
  z-index: 1;
}
.ff-chip{
  background: rgba(15, 23, 42, 0.65);
  color: #fff;
  font-size: 11px;
  font-weight: 600;
  padding: 3px 9px;
  border-radius: 999px;
  backdrop-filter: blur(4px);
}

/* Panel: name + status always visible; details are hidden until hover/tap */
.ff-panel{
  position: absolute;
  left: 0;
  right: 0;
  bottom: 0;
  padding: 14px 14px 12px;
  color: #fff;
  background: linear-gradient(to top, rgba(15, 23, 42, 0.95) 55%, rgba(15, 23, 42, 0));
}
.ff-head{
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
}
.ff-name{
  margin: 0;
  font-size: 16px;
  font-weight: 700;
  color: #fff;
}
.ff-status-pill{
  flex-shrink: 0;
  background: var(--ff-accent);
  color: #fff;
  font-size: 11px;
  font-weight: 700;
  padding: 3px 10px;
  border-radius: 999px;
}
.ff-details{
  max-height: 0;
  opacity: 0;
  overflow: hidden;
  transform: translateY(12px);
  transition: max-height 0.35s ease, opacity 0.25s ease, transform 0.35s ease;
  font-size: 13px;
}
.ff-card:hover .ff-details,
.ff-card.ff-open .ff-details{
  max-height: 220px;
  opacity: 1;
  transform: translateY(0);
  margin-top: 10px;
}
.ff-details li{
  margin-bottom: 4px;
  color: rgba(255, 255, 255, 0.9);
}
.ff-details strong{
  color: #fff;
  margin-right: 4px;
}
.ff-remarks{
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 6px;
  margin-top: 8px;
  padding-top: 6px;
  border-top: 1px dashed rgba(255, 255, 255, 0.35);
  font-style: italic;
  font-size: 12px;
}
.ff-mini{
  background: rgba(255, 255, 255, 0.18);
  border-radius: 6px;
  padding: 1px 6px;
  font-style: normal;
  font-size: 11px;
}

/* ===== Design 3: Standard ===== */
.std-card{
  --std-accent: #16a34a;
  --std-soft: #dcfce7;
  --std-bg: #f1f3f5; /* light grey card */
  position: relative;
  height: 100%;
  display: flex;
  flex-direction: column;
  background: var(--std-bg);
  border: 1px solid #e2e5e9;
  border-radius: 14px;
  padding: 18px 16px 12px;
  color: #1f2937;
  overflow: hidden;
  box-shadow: 0 1px 2px rgba(15, 23, 42, 0.04);
  transition: box-shadow 0.2s ease, transform 0.2s ease;
}
.std-card::before{ /* status bar on top */
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 4px;
  background: var(--std-accent);
}
.std-card.is-late{ --std-accent: #ea580c; --std-soft: #ffedd5; }
.std-card.is-out{ --std-accent: #0891b2; --std-soft: #cffafe; }
.std-card:hover{
  box-shadow: 0 10px 24px rgba(15, 23, 42, 0.1);
  transform: translateY(-2px);
}
.std-card.live_data{ animation: livePulse 0.9s ease; }

.std-head{
  display: flex;
  align-items: center;
  gap: 12px;
  padding-right: 40px; /* keep clear of the menu button */
}
.std-avatar{
  position: relative;
  flex-shrink: 0;
}
.std-photo{
  width: 60px;
  height: 60px;
  border-radius: 50%;
  object-fit: cover;
  background: #f1f5f9;
  box-shadow: 0 0 0 3px var(--std-bg), 0 0 0 5px var(--std-accent);
}
.std-dir{
  position: absolute;
  right: -4px;
  bottom: -4px;
  width: 22px;
  height: 22px;
  border-radius: 50%;
  background: var(--std-accent);
  color: #fff;
  border: 2px solid var(--std-bg);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
}
.std-title{ min-width: 0; }
.std-name{
  margin: 0;
  font-size: 15px;
  font-weight: 700;
  line-height: 1.3;
  color: #0f172a;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
.std-sub{
  display: flex;
  align-items: center;
  gap: 6px;
  margin-top: 3px;
  font-size: 12px;
  color: #64748b;
  min-width: 0;
}
.std-id{
  flex-shrink: 0;
  font-weight: 700;
  color: #334155;
  background: #fff;
  border-radius: 6px;
  padding: 0 6px;
}
.std-class{
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.std-time-block{
  margin: 14px 0 12px;
  padding: 10px 12px;
  border-radius: 10px;
  background: var(--std-soft);
}
.std-time-label{
  font-size: 11px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.4px;
  color: #475569;
}
.std-time{
  font-size: 22px;
  font-weight: 800;
  line-height: 1.2;
  color: #0f172a;
  font-variant-numeric: tabular-nums;
}
.std-status-row{
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 6px;
}
.std-chip{
  background: var(--std-accent);
  color: #fff;
  font-size: 11px;
  font-weight: 700;
  padding: 2px 10px;
  border-radius: 999px;
}
.std-late{
  font-size: 12px;
  font-weight: 700;
  color: var(--std-accent);
}

.std-foot{
  margin-top: auto;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  padding-top: 10px;
  border-top: 1px solid #dfe3e8;
  font-size: 12px;
  color: #475569;
}
.std-shift{
  display: inline-flex;
  align-items: center;
  gap: 4px;
  white-space: nowrap;
}
.std-mini{
  background: #fff;
  border-radius: 6px;
  padding: 1px 6px;
  font-size: 11px;
}
.std-del{
  border: none;
  background: transparent;
  color: #94a3b8;
  padding: 0 4px;
  border-radius: 6px;
  cursor: pointer;
  transition: color 0.15s, background 0.15s;
}
.std-del:hover{
  color: #dc2626;
  background: #fee2e2;
}
.std-remarks{
  margin-top: 6px;
  font-size: 12px;
  font-style: italic;
  color: #64748b;
}

@keyframes livePulse{
  0% { transform: scale(0.92); }
  100% { transform: scale(1); }
}

@media (max-width: 768px) {
  .live-attendace-area{
    padding: 12px;
  }
  .attendance-card{
    padding: 14px 14px 10px;
  }
}

.smallerbtn{
  padding: 2px 5px;
  font-size: 12px;
}
</style>
