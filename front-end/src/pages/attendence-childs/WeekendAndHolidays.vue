<script setup>
import moment from 'moment/moment'
import { inject, ref, reactive, onMounted, onBeforeUnmount, computed, watch } from "vue";
import Ahelper from "./attendacnceHelper";
import myTable from '../../components/myTable.vue'
import FullCalendar from '../../components/FullCalendar.vue'
import Rightbar from '../../components/Rightbar.vue'
import Pagination from '../../components/Pagination.vue'
import AdvanceSearchForm from './deep/AdvanceSearchForm.vue'
import NormalSearchForm from './deep/NormalSearchForm.vue'

const CONFIG = inject("CONFIG");
const classes = inject("classes");
const all_students_non_copied = inject("all_students_non_copied");
const helper = inject("helper");
const callbacks = inject("callbacks");
const attendenceList = inject("attendenceList");
const attendenceParams = inject("attendenceParams");
const liveAttendenceList = inject("liveAttendenceList");
const getAttendeceList = inject("getAttendeceList");

const pagiation_positon = CONFIG.value?.settings?.attendance?.pagination?.pagiation_positon || 'bottom_center'
const weekends = CONFIG.value?.settings?.attendance?.weekends || []

let showRightbar = ref(false)
 
onMounted(()=>{

  getAttendeceList({other_params: {date: moment().format('YYYY-MM-DD')}})
 
})




</script>



<template>

  <button class="btn btn-secondary position-absolute" @click="showRightbar = true">Show Calendar View</button>


  <div class="class-items">
     
    <template v-for="(item, i) in classes" :key="i">
      <div class="class-item">
        <div class="left-side">
          <i class='bx bx-calendar'></i>
          <h4>{{ item.class_name }}</h4>
        </div>
        <div class="right-side">
          <i class='bx bx-calendar'></i>
          <h4>{{ item.class_name }}</h4>
        </div>
      </div>
    </template> 
  </div>


  <Rightbar v-if="showRightbar" @unmount="showRightbar = false">
    <FullCalendar ></FullCalendar> 
  </Rightbar>
</template>


<style scoped>
.class-items{
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-direction: column;
  padding: 20px;
  background-color: #ffffff2b;
  border-radius: 6px;
  max-height: calc(100vh - 230px);
  overflow-y: auto;
}
.class-item{
  width: 100%;
  display: flex;
  justify-content: space-between;
  align-items: center; 
  gap: 20px;
  margin-bottom: 15px;
}
.class-item .left-side,
.class-item .right-side{
  background-color: white;
  padding: 20px;
  border-radius: 5px;
}
.class-item .left-side{
  width: 40%;
}
.class-item .right-side{
  width: 60%;
}


</style>
