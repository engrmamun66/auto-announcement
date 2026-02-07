<template>
  <!-- Attendance Cards -->
   
  <div class="mt-3 live-attendace-area">
    <div class="live-attendace-header">
      <div class="live-attendace-title">Realtime Attendance</div>
      <div class="live-attendace-legend">
        <span class="legend-item">
          <span class="legend-dot legend-present"></span> Present
        </span>
        <span class="legend-item">
          <span class="legend-dot legend-late"></span> Late
        </span>
        <span class="legend-item">
          <span class="legend-dot legend-out"></span> Just-Out
        </span>
      </div>
    </div>
    <div class="max-heigt-for-live-attendace">

      <template v-if="liveAttendenceList?.length">
          <div class="row row-cols-1 row-cols-sm-2 row-cols-md-3 row-cols-lg-4 g-3">
              <template v-for="(item, i) in liveAttendenceList" :key="getLiveKey(item, i)">
                <div class="col position-relative" :style="`order:${-(i + 1)}`" @auxclick="log(item)">

                  
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
                    <button class="card-menu-toggle" type="button" @click.stop="toggleCardMenu(item, i)" aria-label="Card menu">
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
                    <div class="d-flex justify-content-center mb-2 profile-wrap mt-4">
                        <img class="profile-thumb" :src="getProfileImage(getStudent(item))" alt="profile" />
                    </div>
                    <div class="d-flex justify-content-between align-items-center mb-2" >
                        <h4 class="student-name"> {{ getStudent(item)?.name || "Unknown" }} </h4>
                    </div>

                    <ul class="list-unstyled mb-2">
                        <li><strong>Class :</strong> <span class="ms-1">{{ getStudent(item)?.class || "Unknown" }}</span></li>
                        <li :tooltip="(late_consideration_minute && item?.in_time) ? `${late_consideration_minute} minutes of consideration given.` : ''">
                            <strong>Status :</strong> 
                            <span status class="ms-1">{{ item?.in_time ? item?.status : 'Just-Out' }}</span>
                            <span v-if="item?.in_time && item?.late_in_minute" class="ms-1">{{ item?.late_in_minute > 0 ? `${item?.late_in_minute} min` : `before ${Math.abs(item?.late_in_minute)} min` }}</span>
                        </li>
                        <li>
                          <template v-if="item?.in_time">
                              <strong>In Time :</strong> <span class="ms-1">{{ Ahelper.timeFromTime(item?.in_time) }}</span>
                          </template>
                          <template v-else>
                              <strong>Out Time :</strong> <span class="ms-1">{{ Ahelper.timeFromTime(item?.out_time) }}</span>
                          </template>
                        </li>
                        <li><strong>Shift :</strong> <span class="ms-1">{{ Ahelper.printShift(item?.shift_duration) }}</span> </li>
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
          <h5 class="text-muted mb-2 fs-4">No Attendance Records Found</h5>
          <p class="text-secondary mb-0">
              <span class="badge bg-white text-danger fs-5">Live attendance list is currently empty.</span>
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
  if(!confirm("Delete this attendance?")) return
  http.delete(`/attendence-delete/${item.id}`).then(response => {
    if(response.status === 200){
      liveAttendenceList.value = liveAttendenceList.value.filter(_item => _item.id != item.id)
      emitter.emit('toaster-success', {message: 'Attendence Deleted!'})
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
  right: 10px;
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
  right: 10px;
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
