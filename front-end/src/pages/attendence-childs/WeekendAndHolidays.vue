<script setup>
import moment from 'moment/moment'
import { inject, ref, reactive, onMounted, onBeforeUnmount, computed, watch } from "vue";
import Ahelper from "./attendacnceHelper";
import myTable from '../../components/myTable.vue'
import FullCalendar from '../../components/FullCalendar.vue'
import Pagination from '../../components/Pagination.vue'
import AdvanceSearchForm from './AdvanceSearchForm.vue'
import NormalSearchForm from './NormalSearchForm.vue'

const CONFIG = inject("CONFIG");
const classes = inject("classes");
const all_students = inject("all_students");
const helper = inject("helper");
const callbacks = inject("callbacks");
const attendenceList = inject("attendenceList");
const attendenceParams = inject("attendenceParams");
const liveAttendenceList = inject("liveAttendenceList");
const getAttendeceList = inject("getAttendeceList");

const pagiation_positon = CONFIG.value?.settings?.attendance?.pagination?.pagiation_positon || 'bottom_center'
 
 
onMounted(()=>{

  getAttendeceList({other_params: {date: moment().format('YYYY-MM-DD')}})
 
})



</script>



<template>
  <div class="row">
    <FullCalendar></FullCalendar>
    <h1>dfd</h1>
     
  </div>
</template>


<style scoped>
 

</style>
