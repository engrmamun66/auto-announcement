<script setup>
import moment from 'moment/moment'
import { onMounted, inject, ref, watch, computed, onBeforeUnmount, reactive, provide } from 'vue';
import AttendencesAll from './attendence-childs/AttendencesAll.vue'
import RealtimeAttendences from './attendence-childs/RealtimeAttendences.vue'
import BaseSelectMultiple from './../components/BaseSelectMultiple.vue'
import EmDateTimePicker from './../components/EmDateTimePicker.vue'
import Btn from './../components/Btn.vue'
import Ahelper from './attendence-childs/attendacnceHelper';
import Pagination from '../components/Pagination.vue'
 
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


let perpage_limits = [ 10, 15, 20, 25, 50, 100 ]

let tab = ref(Number(storage('attendance_tab').value || '1'))  
watch(tab, (index) => {
  storage('attendance_tab').value = index
})


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
  


onMounted(()=>{
 
 
})
 
</script>

<template>

  <div class="page-contents">
    <div class="d-flex justify-content-between align-items-center">
      <ul class="nav nav-tabs mt-0 mb-3 bottom-borderless">
         <li class="nav-item">
           <a @click.stop="tab = 1" @auxclick.stop="clearAllAndRelaod()" class="nav-link cp text-black" :class="{'active': tab==1}" >Realtime&nbsp;Attendence</a>
         </li>
         <li class="nav-item">
           <a @click.stop="tab = 2" class="nav-link cp text-black" :class="{'active': tab==2}" >Attendence&nbsp;History</a>
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
      <div v-if="tab==2">
        <div class="d-flex justify-content-center align-items-center gap-2">

          <div class="d-flex"  >
            <Pagination v-if="attendenceParams?.totalPages > 1" v-model="attendenceParams" @jumpToPage="(page_no) => {
              getAttendeceList({page_no})
            }" ></Pagination>
        </div> 

          <Btn class="white">Limit per page</Btn>
          <div class="form-group">
            <select v-model="pagination_perpage" class="form-control cb-input" style="width: 100px">
              <template v-for="(limit, index) in perpage_limits" :key="index">
                <option :value="limit">{{ limit }}</option>
              </template>                  
            </select>
          </div>
        </div>
      </div>   

    </div>
  
     <transition>
       <template v-if="tab == 1">
           <RealtimeAttendences ></RealtimeAttendences>
       </template>
       <template v-else-if="tab == 2">
           <AttendencesAll ></AttendencesAll>
       </template>
     </transition>
  </div>



      
     

</template>


<style scoped>
 

 
</style>
