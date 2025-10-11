<script setup>
import moment from 'moment/moment'
import { inject, ref, reactive, onMounted, onBeforeUnmount, computed, watch } from "vue";
import Ahelper from "./attendacnceHelper";
import myTable from '../../components/myTable.vue'
import FullCalendar from '../../components/FullCalendar.vue'
import Rightbar from '../../components/Rightbar.vue'
import Btn from '../../components/Btn.vue'
import Pagination from '../../components/Pagination.vue'
import BaseSelectMultiple from '../../components/BaseSelectMultiple.vue'
import AdvanceSearchForm from './deep/AdvanceSearchForm.vue'
import NormalSearchForm from './deep/NormalSearchForm.vue'
import ClasswiseLeavesAndVacationsCalendar from './deep/ClasswiseLeavesAndVacationsCalendar.vue'
import StudentwiseLeavesAndVacationsCalendar from './deep/StudentwiseLeavesAndVacationsCalendar.vue'

const CONFIG = inject("CONFIG");
const classes = inject("classes");
const all_students_non_copied = inject("all_students_non_copied");
const helper = inject("helper");
const callbacks = inject("callbacks");
const attendenceList = inject("attendenceList");
const attendenceParams = inject("attendenceParams");
const liveAttendenceList = inject("liveAttendenceList");
const getAttendeceList = inject("getAttendeceList");
const leaveAndWeekendSubTab = inject("leaveAndWeekendSubTab");

const pagiation_positon = CONFIG.value?.settings?.attendance?.pagination?.pagiation_positon || 'bottom_center'
const weekends = CONFIG.value?.settings?.attendance?.weekends || []

let showRightbar = ref(false)
const getTitle = computed(()=> leaveAndWeekendSubTab.value == 1 ? 'Add Class Wise Vacation' : 'Add Student Leave')

 
 
onMounted(()=>{

  getAttendeceList({other_params: {date: moment().format('YYYY-MM-DD')}})
 
})




</script>



<template>
 

   <Transition name="fade">
    <div class="mt-3">
      <template v-if="leaveAndWeekendSubTab == 1"">
        <div class="row row-cols-2 row-cols-md-1">
          <ClasswiseLeavesAndVacationsCalendar></ClasswiseLeavesAndVacationsCalendar> 
        </div>
      </template>
      <template v-else-if="leaveAndWeekendSubTab == 2"">
        <StudentwiseLeavesAndVacationsCalendar></StudentwiseLeavesAndVacationsCalendar> 
      </template>
    </div>
   </Transition>


  <Rightbar v-if="showRightbar" @unmount="showRightbar = false" :title="getTitle"> 
    <div class="row">
      <div class="form-group">
        <label for="">Title</label>
        <input type="text" class="form-control cb-input">
      </div>
    </div>
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
</style>
