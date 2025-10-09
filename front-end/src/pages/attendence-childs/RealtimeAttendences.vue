<template>
  <!-- Attendance Cards -->
   
  <div class="mt-3 max-heigt-for-live-attendace">
    <template v-if="liveAttendenceList?.length">
        <div class="row row-cols-1 row-cols-sm-2 row-cols-md-3 row-cols-lg-4 g-3">
            <template v-for="(item, i) in liveAttendenceList" :key="i">
              <div class="col position-relative" :style="`order:${-i}`" @auxclick="log(item)">

                
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
                      'live_data': liveAttendenceList?.live_data,
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
                      <span class="badge text-dark bg-body-secondary">
                          {{ Ahelper.printDate(item) }}
                      </span>
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
        <h5 class="text-muted mb-2">No Attendance Records Found</h5>
        <p class="text-secondary mb-0">
            Live attendance list is currently empty.
        </p>
        </div>
    </div>
    </template>
  </div>
</template>

<script setup>
import { inject, ref, onMounted, onBeforeUnmount } from "vue";
import Ahelper from "./attendacnceHelper";

const http = inject('http');
const CONFIG = inject("CONFIG");
const emitter = inject('emitter');
const classes = inject("classes");
const attendenceList = inject("attendenceList");
const all_students = inject("all_students");
const liveAttendenceList = inject("liveAttendenceList");

let log = console.log

const late_consideration_minute = CONFIG.value?.settings?.attendance?.late_consideration_minute || 0
let isMounted = ref(false)

const getStudent = ({ student_id }) =>
  all_students.value.find((std) => std.dakhela == student_id);

onMounted(()=>{
  setTimeout(() => {
    isMounted.value = true
  }, 500);
})

function deleteAttedence(item){
  if(prompt("Delete this attendance?").toLocaleLowerCase() !== 'd') return
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
  animation: keyframe-blowUp 1.0s cubic-bezier(0.165, 0.84, 0.44, 1) forwards;
  animation: keyframe-scaleUp 1.5s cubic-bezier(0.165, 0.84, 0.44, 1) forwards;
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
.max-heigt-for-live-attendace{
    max-height: calc(100vh - 200px);
    overflow-y: auto;
    box-shadow: inset 5px 22px 44px #00000045;
    padding: 15px;
    border-radius: 20px;
}
</style>
