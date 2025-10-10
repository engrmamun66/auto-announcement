<template>
  <div>
    
    <div class="d-flex justify-content-start align-items-center gap-2">
        <BaseSelectMultiple placeholder="Select Classes" v-model="attPayload.classes" :label="false" :data="filteredClasses" displayKey="class_name" valueKey="class_name" :displayKey2="false" style="min-width: 250px" :search="true" :searchDelayTime="100" 
          @searching="(search_text) => attPayload.classSearchText = search_text" >
        </BaseSelectMultiple>

        <BaseSelectMultiple placeholder="Select Students" v-model="attPayload.students" :label="false" :data="filteredAllStudents" displayKey="full_name" valueKey="id" style="min-width: 350px" :search="true" :searchDelayTime="100" 
          @searching="(studentnameorid) => attPayload.studentnameorid = studentnameorid" >
          <template #loopItem1="{item, index}">
            <span class="badge text-dark bg-body-secondary ms-1">
              {{ item.class_short }}
            </span>
          </template>
          <template #loopItem="{item, index}">
            <span class="badge text-dark bg-body-secondary">
              {{ item.class_short }}
            </span>
          </template>
        </BaseSelectMultiple>

        <div class="position-relative">
          <EmDateTimePicker ref="dateRangePickerRef"
            v-model="pickerModelValue"
            @change="onChangeDateRangePicker"
            @close="false"
            :displayFormat="'DD MMM, Y'"
            :rangePicker="true" 
            :timePicker="false" 
            :startDate="pickerModelValue.startDate" 
            :endDate="pickerModelValue.endDate" 
            :minDate="null"
            :isDisabled="false"
            :autoOpen="false"
            :timePickerButtons="true"
            :use24FormatTimeForEvents="true"
            :invisible="false"
            displayIn="bottom_center" 
            :buttons="{applyBtn: 'Apply', todayBtn: true}"
            :useCustomRange="CONFIG?.date_range_list ?? true"
            style="width: 232px"
            >
          </EmDateTimePicker>
          <i @click.stop="$refs.dateRangePickerRef.toggle()" class='bx bxs-calendar tooglerIcon' ></i>
        </div>
      <Btn cbinput="cbinput">Submit</Btn>
      <Btn cbinput="cbinput" class="red">Clear</Btn>
    </div>   
 
  </div>
</template>

<script setup>
import moment from 'moment/moment'
import { inject, ref, reactive, onMounted, onBeforeUnmount, computed, watch } from "vue";
import Ahelper from "./attendacnceHelper";

const CONFIG = inject("CONFIG");
const classes = inject("classes");
const all_students = inject("all_students");
const helper = inject("helper");
const callbacks = inject("callbacks");
const attendenceList = inject("attendenceList");
const attendenceParams = inject("attendenceParams");
const liveAttendenceList = inject("liveAttendenceList");
import myTable from '../../components/myTable.vue'
import Pagination from '../../components/Pagination.vue'
import BaseSelectMultiple from './../../components/BaseSelectMultiple.vue'
import EmDateTimePicker from './../../components/EmDateTimePicker.vue'
import Btn from './../../components/Btn.vue'

const pagiation_positon = CONFIG.value?.settings?.attendance?.pagination?.pagiation_positon || 'bottom_center'
 
let log = console.log

let attPayload = reactive({
  classes: [],
  students: [],
  studentnameorid: '',
  classSearchText: '',
}) 

watch(()=> attPayload.classes, (_classes) => {
  if(_classes?.length === 0){
    attPayload.students = []
    attPayload.studentnameorid = ''
  }
},{deep: true})

let dateRangePickerRef = ref(null)
let pickerModelValue = reactive({
  startDate: moment().startOf('month'),
  endDate: new Date()
})


let filteredAllStudents = computed(() => {
  let selected_class_shorts = attPayload.classes.map(cls => cls.class_short)
  let students = helper.clone(all_students.value)
  
  if(selected_class_shorts?.length){
    students = students.filter(student => selected_class_shorts.includes(student.class_short))
  }
  if(attPayload.studentnameorid){
    let is_id = /\d+/.test(attPayload.studentnameorid)
    if(is_id){
      students = students.filter(student => student.dakhela.toString().includes(attPayload.studentnameorid))
    } else {
      students = students.filter(student => student.name.toLowerCase().includes(attPayload.studentnameorid.toLowerCase()))
    }
  }

  return students
})
let filteredClasses = computed(() => {
  if(!attPayload.classSearchText) return classes.value
  let result = classes.value.filter(cls => cls.class_name.toLowerCase().includes(attPayload.classSearchText.toLowerCase()))
  return result
})
 

defineExpose({
  
})


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

.attendance-card:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.student-name{
  margin-bottom: 10px;
  font-weight: 700;
  border: 1px solid;
  border-bottom: 2px double;
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
  background-color: #dc3545; /* Bootstrap danger red */
  color: #fff !important;
}

.status-outtime {
  background-color: #0095b7; /* Bootstrap danger red */
  color: #fff !important;
}

.status-outtime .badge,
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
    border: 1px solid white;
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
.tooglerIcon{
  position: absolute;
  right: 5px;
  top: 10px;
  font-size: 20px;
  cursor: pointer;
  color: var(--primaryColor)
}

</style>
