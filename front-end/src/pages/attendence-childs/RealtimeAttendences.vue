<template>
  <!-- Attendance Cards -->
   
  <div class="mt-3 live-attendace-area">
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
import { inject, ref, onMounted, watch, nextTick } from "vue";
import Ahelper from "./attendacnceHelper";

const http = inject('http');
const CONFIG = inject("CONFIG");
const emitter = inject('emitter');
const classes = inject("classes");
const attendenceList = inject("attendenceList");
const all_students_non_copied = inject("all_students_non_copied");
const liveAttendenceList = inject("liveAttendenceList");

let log = console.log

const late_consideration_minute = CONFIG.value?.settings?.attendance?.late_consideration_minute || 0
let isMounted = ref(false)
const LIVE_ANIM_MS = 900

const getStudent = ({ student_id }) =>
  all_students_non_copied.value.find((std) => std.dakhela == student_id);

const getLiveKey = (item, i) =>
  item?.id || item?.identity_string || `${item?.student_id || 'std'}-${item?.in_time || item?.out_time || i}`;

onMounted(()=>{
  setTimeout(() => {
    isMounted.value = true
  }, 500);
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
.attendance-card {
  background: #fff;
  border-radius: 10px;
  padding: 1rem 1.2rem;
  border: 1px solid #e2e2e2;
  transition: all 0.25s ease;
  color: #333;
  padding-top: 40px;
}
.attendance-card.live_data { 
  animation: livePulse 1.0s ease;
  box-shadow: 0 8px 18px rgba(25, 135, 84, 0.25);
}

.attendance-card:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.student-name{
  margin-bottom: 10px;
  font-weight: 700;
  border: 1px solid;
  border-bottom: 2px double;
  border-color:rgba(255, 255, 255, 0.442);
  cursor: pointer;
  padding: 5px;
  border-radius: 5px;
  width: 100%;
  text-align: center;
}

.status-present {
  background-color: #198754; /* Bootstrap success green */
  color: #fff !important;
}

.status-absent {
  background-color: chocolate; /* Bootstrap danger red */
  color: #fff !important;
}

.status-outtime {
  background-color: #0c7086; /* Bootstrap danger red */
  color: #fff !important;
}

.status-present .badge,
.status-absent .badge {
  background: rgba(255, 255, 255, 0.2) !important;
  color: #fff !important;
}

.remarks {
  border-top: 1px dashed rgba(255, 255, 255, 0.4);
  padding-top: 6px;
  font-style: italic;
}

.no-data-card {
  min-height: 250px;
  background-color: #f8f9fa;
  border: 1px dashed #ccc;
}
span[status]{
  background-color: rgba(255, 255, 255, 0.161);
    padding: 1px 8px 3px 6px;
    border-radius: 6px;
    color: #ffffff;
    transform: translateY(-2px);
    border: 1px solid #ffffff54;
}
.popup{
    position: absolute;
    padding: 5px 15px;
    text-align: center;
    background-color: rgb(255, 255, 255);
    border-radius: 0px 0px 5px 5px;
    top: 1px;
    box-shadow: 0px 1px 0px rgba(0, 0, 0, 0.489), inset 1px 1px 0px rgba(0, 0, 0, 0.175);
    z-index: 1;
  } 
.popup.in-out{  
    left: 50%;
    top: 1px;
    transform: translateX(-50%);
    border-radius: 0px 0px 5px 5px;
} 
li{
  margin-bottom: 6px;
}
.live-attendace-area{
    box-shadow: inset 5px 22px 44px #00000045;
    padding: 15px;
    border-radius: 6px;
}
.max-heigt-for-live-attendace{
    max-height: calc(100vh - 200px);
    overflow-y: auto;  
}

@keyframes livePulse {
  0% { transform: scale(0.2); }
  100% { transform: scale(1); }
}
</style>
