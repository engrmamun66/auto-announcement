<script setup>
import moment from 'moment/moment'
import { onMounted, inject, ref, watch, computed, onBeforeUnmount, reactive, provide, Transition } from 'vue';
import AttendencesAll from './attendence-childs/AttendencesAll.vue'
import RealtimeAttendences from './attendence-childs/RealtimeAttendences.vue'
import WeekendAndHolidays from './attendence-childs/WeekendAndHolidays.vue'
import Reporting from './attendence-childs/Reporting.vue'
import HaziraKhata from './attendence-childs/HaziraKhata.vue'
import BaseSelectMultiple from './../components/BaseSelectMultiple.vue'
import EmDateTimePicker from './../components/EmDateTimePicker.vue'
import Btn from './../components/Btn.vue'
import Ahelper from './attendence-childs/attendacnceHelper';
import Pagination from '../components/Pagination.vue'
import BtnLoader from '../components/BtnLoader.vue'
import FetchBulkAttendanceFromDevice from '../components/FetchBulkAttendanceFromDevice.vue'
 
const route = inject('route');
const router = inject('router');
const emitter = inject('emitter');
const storage = inject('storage');
const http = inject('http'); 
const helper = inject('helper');

const log = console.log

const CONFIG = inject('CONFIG');
const classes = inject('classes');
const attendenceList = inject('attendenceList');
const liveAttendenceList = inject('liveAttendenceList');


let tab = ref(Number(storage('attendance_tab').value || '1'))  

watch(tab, (tab_name) => { 
  storage('attendance_tab').value = tab_name
})

const clearingLive = ref(false)
const hasLiveAttendence = computed(() => (liveAttendenceList.value?.length || 0) > 0)
const show_bulk_device_fetch = ref(false)

async function clearAllAndRelaod(){
  if (!hasLiveAttendence.value || clearingLive.value) return
  if (!confirm(helper.t('Clear all live attendance?'))) return
  clearingLive.value = true
  try {
    liveAttendenceList.value = []
  } finally {
    clearingLive.value = false
  }
}

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

provide('parent_tab', tab)
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
      .post("/attendence-list", {}, { params: queryParams })
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

provide('getAttendeceReports', getAttendeceReports)
provide('getAttendeceReportsForSingleClass', getAttendeceReportsForSingleClass)

async function getAttendeceReports(payload={}, { start_date, end_date, action = null }={}) {
  try {
    let queryParams = {
      start_date,
      end_date,
      action,
    }

    let response = await http.post("/attendence-reports", payload, { params: queryParams })
      if (response.status == 200) {
        let data = response.data?.data;
        return data
      } 
      
  } catch (getAttendeceReports__error) {
    console.warn({getAttendeceReports__error});
  }
}

async function getAttendeceReportsForSingleClass(payload={}, { start_date, end_date, action = null }={}) {
  try {
    let queryParams = {
      start_date,
      end_date,
      action,
    }

    let response = await http.post("/attendence-reports-for-single-class", payload, { params: queryParams })
      if (response.status == 200) {
        let data = response.data?.data;
        return data
      } 
      
  } catch (getAttendeceReports__error) {
    console.warn({getAttendeceReports__error});
  }
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
  if(route.query.tab){
    tab.value = Number(route.query.tab) || 1 
  }
})
 
</script>

<template>

  <div class="page-contents">
    <div id="REPORTING_TAB_AREA" class="d-flex justify-content-between align-items-start">
      <ul class="nav nav-tabs mt-0 mb-3 bottom-borderless">
         <li class="nav-item">
           <a @click.stop="tab = 1" @auxclick.stop="clearAllAndRelaod()" class="nav-link cp text-black" :class="{'active': tab == 1}">
             <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="vertical-align:-2px;margin-right:4px"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="3" fill="currentColor" stroke="none"/><line x1="12" y1="2" x2="12" y2="5"/><line x1="12" y1="19" x2="12" y2="22"/><line x1="2" y1="12" x2="5" y2="12"/><line x1="19" y1="12" x2="22" y2="12"/></svg>Realtime</a>
         </li>
         <li class="nav-item">
           <a @click.stop="tab = 5" class="nav-link cp text-black" :class="{'active': tab == 5}">
             <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="vertical-align:-2px;margin-right:4px"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/><polyline points="9 16 11 18 15 14"/></svg>Hazira</a>
         </li>
         <li class="nav-item">
           <a @click.stop="tab = 3" class="nav-link cp text-black" :class="{'active': tab == 3}">
             <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="vertical-align:-2px;margin-right:4px"><circle cx="12" cy="7" r="3"/><path d="M5 21v-2a7 7 0 0 1 14 0v2"/><line x1="17" y1="11" x2="22" y2="11"/><line x1="19" y1="9" x2="19" y2="13"/></svg>Leaves</a>
         </li>
         <li class="nav-item">
           <a @click.stop="tab = 4" class="nav-link cp text-black" :class="{'active': tab == 4}">
             <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="vertical-align:-2px;margin-right:4px"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>Reporting</a>
         </li>
         <li class="nav-item">
           <a @click.stop="tab = 2" class="nav-link cp text-black" :class="{'active': tab == 2}">
             <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="vertical-align:-2px;margin-right:4px"><polyline points="1 4 1 10 7 10"/><path d="M3.51 15a9 9 0 1 0 .49-4.5"/><line x1="12" y1="8" x2="12" y2="12"/><polyline points="12 12 15 14"/></svg>Logs</a>
         </li>   
      </ul>

      <div v-if="tab == 1">
        <div class="d-flex justify-content-center align-items-center gap-2">
            <Btn class="white">In: <span class="badge text-white bg-secondary">{{ Ahelper.count.in(liveAttendenceList) }}</span></Btn>
            <Btn class="white">Out: <span class="badge text-white bg-warning">{{ Ahelper.count.out(liveAttendenceList) }}</span></Btn>
            <Btn class="white">Late: <span class="badge text-white bg-danger">{{ Ahelper.count.late(liveAttendenceList) }}</span></Btn>
            <Btn class="white">Total: <span class="badge text-white bg-success">{{ liveAttendenceList?.length }}</span></Btn>
            <Btn id="transaction_bulk_fetch" class="" @click="show_bulk_device_fetch = true">Get Attendace From History </Btn>
            <Btn class="red" :disabled="!hasLiveAttendence || clearingLive" @click="clearAllAndRelaod" >
              <template v-if="clearingLive">Clearing...</template>
              <template v-else>Clear All</template>
            </Btn>
          </div>
        </div>   
      <div v-else-if="tab == 2">
        <div class="d-flex flex-wrap justify-content-center align-items-center gap-2">
            
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
      <div v-else-if="tab == 3">

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
      <div v-else-if="tab == 4">

        <!-- <div class="d-flex justify-content-end column-gap-3">
          <ul class="nav nav-tabs d2 mt-0 mb-3 bottom-borderless">
            <li class="nav-item">
              <a @click.stop="reportingViewTab = 1" class="nav-link cp text-black" :class="{'active': reportingViewTab==1}" >Overview</a>
            </li>
            <li class="nav-item">
              <a @click.stop="reportingViewTab = 2" class="nav-link cp text-black" :class="{'active': reportingViewTab==2}" >Class Wise</a>
            </li>       
          </ul>
        </div> -->

      </div> 

    </div>

    <!-- <h1>debug::Tab: {{ tab }}</h1> -->
  
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
    <template v-else-if="tab == 5">
        <HaziraKhata ></HaziraKhata>
    </template> 

    <FetchBulkAttendanceFromDevice
      v-if="show_bulk_device_fetch"
      @unmount="show_bulk_device_fetch = false"
    />
  </div>



      
     

</template>


<style scoped>
#REPORTING_TAB_AREA {
  flex-wrap: wrap;
  gap: 0.5rem;
}

#REPORTING_TAB_AREA > ul.nav-tabs {
  flex-wrap: nowrap;
  overflow-x: auto;
  -webkit-overflow-scrolling: touch;
  scrollbar-width: none;
  width: 100%;
}

#REPORTING_TAB_AREA > ul.nav-tabs::-webkit-scrollbar {
  display: none;
}

#REPORTING_TAB_AREA > ul.nav-tabs .nav-link {
  white-space: nowrap;
}

@media (min-width: 768px) {
  #REPORTING_TAB_AREA > ul.nav-tabs {
    width: auto;
    overflow-x: visible;
  }
}
</style>
