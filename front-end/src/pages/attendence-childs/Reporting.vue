<script setup>
import moment from 'moment/moment'
import { inject, ref, reactive, onMounted, onBeforeUnmount, computed, watch } from "vue";
import Ahelper from "./attendacnceHelper";
import myTable from '../../components/myTable.vue'
import Confirm from '../../components/Confirm.vue'
import ReportingOverview from './deep/ReportingOverview.vue'

const CONFIG = inject("CONFIG");
const classes = inject("classes");
const all_students_non_copied = inject("all_students_non_copied");
const http = inject("http");
const helper = inject("helper");
const emitter = inject("emitter");
const callbacks = inject("callbacks");
const attendenceList = inject("attendenceList");
const attendenceParams = inject("attendenceParams");
const liveAttendenceList = inject("liveAttendenceList");
const getAttendeceList = inject("getAttendeceList");

const pagiation_positon = CONFIG.value?.settings?.attendance?.pagination?.pagiation_positon || 'bottom_center'
let reportingViewTab = inject('reportingViewTab')
 

let log = console.log

let isMounted = ref(false)
 
 
onMounted(()=>{ 
  isMounted.value = true 
})
 




</script>



<template>
  <div class="row mt-3"> 

     <template v-if="reportingViewTab == 1">
      <ReportingOverview></ReportingOverview>
     </template> 

    
     
     
  </div>
</template>


<style scoped>
 

</style>
