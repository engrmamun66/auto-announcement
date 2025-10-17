<script setup>
import moment from 'moment/moment'
import { onMounted, inject, ref, watch, computed, onBeforeUnmount, reactive, provide, Transition } from 'vue';
import AttendencesAll from './attendence-childs/AttendencesAll.vue'
import RealtimeAttendences from './attendence-childs/RealtimeAttendences.vue'
import WeekendAndHolidays from './attendence-childs/WeekendAndHolidays.vue'
import Reporting from './attendence-childs/Reporting.vue'
import BaseSelectMultiple from './../components/BaseSelectMultiple.vue'
import EmDateTimePicker from './../components/EmDateTimePicker.vue'
import Btn from './../components/Btn.vue'
import Ahelper from './attendence-childs/attendacnceHelper';
import Pagination from '../components/Pagination.vue'
import BtnLoader from '../components/BtnLoader.vue'
 
const route = inject('route');
const router = inject('router');
const emitter = inject('emitter');
const storage = inject('storage');
const http = inject('http'); 

const log = console.log

const CONFIG = inject('CONFIG');
const classes = inject('classes');
const attendenceList = inject('attendenceList');
const liveAttendenceList = inject('liveAttendenceList');


let tab = ref(Number(storage('attendance_tab').value || '1'))  
watch(tab, (index) => {
  storage('attendance_tab').value = index
})

// ====================================================== //
// ====================================================== //
// ====================================================== //
// ====================================================== //
// ====================================================== //
// =============== For AttendencesAll.vue =============== //
// ====================================================== //

let perpage_limits = [ 10, 15, 20, 25, 30, 40, 50, 100, 200, 500 ]

let sortby_columns = [
  {
    id: 'student_id',
    title: 'Student ID',
  },
  {
    id: 'in_time',
    title: 'In Time',
  },
  {
    id: 'out_time',
    title: 'Out Time',
  },
  {
    id: 'late_in_minute',
    title: 'Late Time',
  },
  {
    id: 'status',
    title: 'Status',
  }, 
  {
    id: 'shift_duration',
    title: 'Shift Duration',
  },
  {
    id: 'device_index',
    title: 'Device Index',
  },
]
let sort_direction = ref('ASC')
let sortby_column = ref('late_in_minute')

const pagination_perpage = ref(Number(storage('pagination_perpage').value || 0) || CONFIG.value?.settings?.attendance?.pagination?.perpage || 20)
watch(pagination_perpage, (limit) => {
  storage('pagination_perpage').value = limit
  emitter.emit('reset_pagination', true)
})

let attendenceParams = ref({
    "page_no": 1,
    "total": 3,
    "totalPages": 1,
    "limit": pagination_perpage.value, 
})

provide('attendenceParams', attendenceParams)
provide('sortby_column', sortby_column)
provide('sort_direction', sort_direction)
provide('pagination_perpage', pagination_perpage)
provide('getAttendeceList', getAttendeceList)

function getAttendeceList({ page_no = null, reset = false, other_params = {} } = {}) {
  try {
    if (reset) {
      attendenceParams.value.page_no = 1;
      attendenceParams.value.total = 3;
      attendenceParams.value.totalPages = 1;
      attendenceParams.value.limit = 50;
    }
    let queryParams = { ...attendenceParams.value };
    if (page_no) {
      queryParams.page_no = page_no;
    }
    queryParams = { ...queryParams, ...other_params };

    http
      .get("/attendence-list", { params: queryParams })
      .then((response) => {
        if (response.status == 200) {
          let data = response.data;
          attendenceList.value = data.data;
          attendenceParams.value = data.pagination;
        }
      })
      .finally(() => {});
  } catch (error) {}
}
// ============= End For AttendencesAll.vue ============= //
// ====================================================== // 
// ====================================================== // 
// ====================================================== // 






// ====================================================== //
// ====================================================== //
// ====================================================== //
// ====================================================== //
// ====================================================== //
// ============= For Weekends And Vacations ============= //
// ====================================================== //

let leaveAndWeekendSubTab = ref(storage('attendance_leave_and_weekend_sub_tab').value || 1) 
watch(leaveAndWeekendSubTab, (index) => {
  storage('attendance_leave_and_weekend_sub_tab').value = index
})

provide('leaveAndWeekendSubTab', leaveAndWeekendSubTab) 
 
// ============= End Weekends And Vacations ============= //
// ====================================================== // 
// ====================================================== // 
// ====================================================== // 



// ====================================================== //
// ====================================================== //
// ====================================================== //
// ====================================================== //
// ====================================================== //
// ===================== For Reporting ================== //
// ====================================================== //

let reportingViewTab = ref(storage('attendance_reporting_view_tab').value || 1)
watch(reportingViewTab, (index) => {
  storage('attendance_reporting_view_tab').value = index
})
provide('reportingViewTab', reportingViewTab)

// ===================== End Reporting ================== //
// ====================================================== // 
// ====================================================== // 
// ====================================================== // 


onMounted(()=>{
 
 
})
 
</script>

<template>

  <div class="page-contents">
    <div class="d-flex justify-content-between align-items-start">
      <ul class="nav nav-tabs mt-0 mb-3 bottom-borderless">
         <li class="nav-item">
           <a @click.stop="tab = 1" @auxclick.stop="clearAllAndRelaod()" class="nav-link cp text-black" :class="{'active': tab==1}" ><i class='bx bx-time-five transformY-2px' ></i> Realtime&nbsp;Attendence</a>
         </li>
         <li class="nav-item">
           <a @click.stop="tab = 2" class="nav-link cp text-black" :class="{'active': tab==2}" ><i class='bx bx-history transformY-2px' ></i> Attendence&nbsp;History</a>
         </li>   
         <li class="nav-item">
           <a @click.stop="tab = 3" class="nav-link cp text-black" :class="{'active': tab==3}" ><i class='bx bx-run transformY-2px' ></i> Leaves And Vacations</a>
         </li>   
         <li class="nav-item">
           <a @click.stop="tab = 4" class="nav-link cp text-black" :class="{'active': tab==4}" ><i class='bx bx-timer transformY-2px'></i> Reporting </a>
         </li>   
      </ul>

      <div v-if="tab==1">
        <div class="d-flex justify-content-center align-items-center gap-2">
            <Btn class="white">In: <span class="badge text-white bg-secondary">{{ Ahelper.count.in(liveAttendenceList) }}</span></Btn>
            <Btn class="white">Out: <span class="badge text-white bg-warning">{{ Ahelper.count.out(liveAttendenceList) }}</span></Btn>
            <Btn class="white">Late: <span class="badge text-white bg-danger">{{ Ahelper.count.late(liveAttendenceList) }}</span></Btn>
            <Btn class="white">Total: <span class="badge text-white bg-success">{{ liveAttendenceList?.length }}</span></Btn>
          </div>
        </div>   
      <div v-else-if="tab==2">
          <div class="d-flex justify-content-center align-items-center gap-2">
            
          <Btn class="white">Total: <span class="badge text-white bg-success">{{ attendenceList?.length }}</span></Btn>

          <div class="d-flex"  >
            <Pagination v-if="attendenceParams?.totalPages > 1" v-model="attendenceParams" @jumpToPage="(page_no) => {
              getAttendeceList({page_no})
            }" ></Pagination>
          </div> 

          <div class="form-group" tooltip="Sort By">
            <select class="form-control cb-input" v-model="sortby_column" >
              <template v-for="(column, index) in sortby_columns" :key="index">
                <option :value="column.id">{{ column.title }}</option>
              </template>                  
            </select>
          </div>
          <div class="form-group" tooltip="Sort Direction">
            <select class="form-control cb-input" v-model="sort_direction" >
              <template v-for="(direction, index) in ['ASC', 'DESC']" :key="index">
                <option :value="direction">{{ direction }}</option>
              </template>                  
            </select>
          </div>

          <div class="form-group" tooltip="Per Page">
            <select v-model="pagination_perpage" class="form-control cb-input" style="width: 110px">
              <template v-for="(limit, index) in perpage_limits" :key="index">
                <option :value="limit">Limit {{ limit }}</option>
              </template>                  
            </select>
          </div>
        </div>
      </div>   
      <div v-else-if="tab==3">

        <div class="d-flex justify-content-end column-gap-3">
          <ul class="nav nav-tabs d2 mt-0 mb-3 bottom-borderless">
            <li class="nav-item">
              <a @click.stop="leaveAndWeekendSubTab = 1" class="nav-link cp text-black" :class="{'active': leaveAndWeekendSubTab==1}" >Class Wise</a>
            </li>
            <li class="nav-item">
              <a @click.stop="leaveAndWeekendSubTab = 2" class="nav-link cp text-black" :class="{'active': leaveAndWeekendSubTab==2}" >Student Wise</a>
            </li>       
          </ul>
        </div>
        
      </div> 
      <div v-else-if="tab==4">

        <div class="d-flex justify-content-end column-gap-3">
          <ul class="nav nav-tabs d2 mt-0 mb-3 bottom-borderless">
            <li class="nav-item">
              <a @click.stop="reportingViewTab = 1" class="nav-link cp text-black" :class="{'active': reportingViewTab==1}" >Overview</a>
            </li>
            <li class="nav-item">
              <a @click.stop="reportingViewTab = 2" class="nav-link cp text-black" :class="{'active': reportingViewTab==2}" >Class Wise</a>
            </li>       
          </ul>
        </div>

      </div> 

    </div>
  
    <template v-if="tab == 1">
        <RealtimeAttendences ></RealtimeAttendences>
    </template>
    <template v-else-if="tab == 2">
        <AttendencesAll ></AttendencesAll>
    </template>
    <template v-else-if="tab == 3">
        <WeekendAndHolidays ></WeekendAndHolidays>
    </template> 
    <template v-else-if="tab == 4">
        <Reporting ></Reporting>
    </template> 
  </div>



      
     

</template>


<style scoped>
 

 
</style>
