<script setup>
import moment from 'moment/moment'
import { inject, ref, reactive, onMounted, onBeforeUnmount, computed, watch } from "vue";
import Ahelper from "./../attendacnceHelper";

const CONFIG = inject("CONFIG");
const classes = inject("classes");
const all_students = inject("all_students");
const helper = inject("helper");
const callbacks = inject("callbacks");
const http = inject("http");
const emitter = inject("emitter");
const attendenceList = inject("attendenceList");
const attendenceParams = inject("attendenceParams");
const liveAttendenceList = inject("liveAttendenceList");
import myTable from '../../../components/myTable.vue'
import Pagination from '../../../components/Pagination.vue'
import BaseSelectMultiple from './../../../components/BaseSelectMultiple.vue'
import FullCalendarClasswise from './../../../components/FullCalendarClasswise.vue'
import EmDateTimePicker from './../../../components/EmDateTimePicker.vue'
import Rightbar from './../../../components/Rightbar.vue'
import Btn from './../../../components/Btn.vue'
import Switch from './../../../components/Switch.vue'
import BtnLoader from './../../../components/BtnLoader.vue'

const props = defineProps({
  modelValue: {
    type: Object,
    default: () => ({}),
  },
});

const emit = defineEmits(['update:modelValue', 'onBtnSubmit', 'onBtnClear']);

let log = console.log
let showRightbar = ref(false)
let selectedClasses = ref([...classes.value])
console.log('helper.generateUniqueString()', Ahelper.generateUniqueString());

let RightbarRef = ref(null)
let showTextArea = ref(false)
let pickerModelValue = ref({})
let calendarEvents = ref([])
let vacationData = ref([])
let dateRange = ref({ start_date: null, end_date: null })

let vacation_types = CONFIG.value?.settings?.attendance?.vacation_types || []

function remvoeSpaces(str){
  return str ? str.replace(/\s+/g, '') : str
}


let queryParams = {
  // start
}


let payload = reactive({
  type: 'leave', // leave | vacation
  identity_string: Ahelper.generateUniqueString(),
  class_short: null,
  student_id: null,
  date: null,
  reason: 'Exam',
})

watch(showTextArea, (bool)=> {
  if(bool === false){
    payload.reason = 'Exam'
  }
})


function onCancel(){
  payload.reason = ''
  payload.student_id = null
  payload.reason = 'Exam'
  selectedClasses.value = [...classes.value]
  emit('onBtnClear')
  RightbarRef.value.unmount()
}

let showBtnLoader = ref(false)

async function onSubmit(){
  if(!pickerModelValue.value?.startDate || !pickerModelValue.value?.endDate){
    emitter.emit('toaster-error', {message: 'Please select date range'})
    return
  } 
  if(!selectedClasses.value.length){ 
    emitter.emit('toaster-error', {message: 'Please select classes'})
    return
  } 
  if(!payload.reason.length){ 
    emitter.emit('toaster-error', {message: 'Please select or write vacation reason'})
    return
  } 
  let start_date =  moment(pickerModelValue.value.startDate).format('YYYY-MM-DD')
  let end_date =  moment(pickerModelValue.value.endDate).format('YYYY-MM-DD')
  let class_shorts = selectedClasses.value.map(c=>c.class_short)
  let reason = payload.reason
  let identity_string = payload.identity_string


  let is_for_all_classes = class_shorts.length == classes.value.length
  if(is_for_all_classes){
    class_shorts = ['_all_']
  }

  let records = []
  class_shorts.forEach(class_short => {
    let dates = helper.createDateRange(start_date, end_date)
    dates.forEach(date => {
      records.push({
        type: 'vacation',
        identity_string,
        class_short,
        student_id: null,
        date,
        reason
      })
    })
  })

  http.post('/leave-and-vacation-add-bulk', { records }).then(response => {
    if(response.status == 200){
      let data = response.data
    }
  }).finally(()=>{
    onCancel()
    callbacks.getLeavesAndVacations()
    onInitAndNextPrev(dateRange.value)
  })

  showBtnLoader.value = true
  helper.delay(()=>showBtnLoader.value = false, 1200)
}



async function onInitAndNextPrev({start_date, end_date}){
  queryParams = { start_date, end_date }
  dateRange.value = { start_date, end_date }
  let vacation_data = await callbacks.getLeavesAndVacations(queryParams)
  vacation_data = vacation_data.map(vacation => {
    vacation['reason_and_date'] = vacation.reason + '' + vacation.date
    return vacation
  })
  vacationData.value = vacation_data
  createAndDisplayEventList()
}

async function createAndDisplayEventList(){
  let vacation_events = []

  // With weekends
  const weekends = CONFIG.value?.settings?.attendance?.weekends || []
  let {start_date, end_date} = dateRange.value
  let weekends_array = helper.createDateRange(start_date, end_date)
                      .filter(date => weekends.includes(moment(date).format('dddd')))
  weekends_array.forEach(date => vacation_events.push(helper.createWeekdayEvent(date)))

  // with vacations/holidays
  // vacationData.value.forEach(vacation => {
  //   vacation_events.push(helper.createVacationEvent(vacation, classes.value))
  // })
  let goruped = helper.listGroupBy(vacationData.value, 'reason_and_date')
  Object.entries(goruped).forEach(([reason_and_date, vacations], i)=>{
    let [reason, date] = reason_and_date.split('') 
    let backgroundColor = vacation_types.find(vt => {
      console.log({title: vt.title, reason});
      return vt.title == reason
    })?.bgcolor || 'tomato'
    vacation_events.push(helper.createVacationEvent(date, vacations, reason, classes.value, {backgroundColor}))
  })

 



  calendarEvents.value = vacation_events

}
 


</script>


<template>
  <div>

    <FullCalendarClasswise 
    :events="calendarEvents"
    @initAndNextPrev="onInitAndNextPrev" 
    @add-vacation="showRightbar = true" 
    ></FullCalendarClasswise>

    <Rightbar ref="RightbarRef" v-if="showRightbar" @unmount="showRightbar = false" title="Add Class Wise Vacation" :largestMode="false"> 
      <div class="row">

        <div class="col-12 mb-3">
          <label for="">Select Date Range</label>
          <div class="position-relative">
            <EmDateTimePicker ref="dateRangePickerRef"
              v-model="pickerModelValue"
              @change="false"
              @close="false"
              @initialized="$refs.dateRangePickerRef.clearPicker()"
              :displayFormat="'DD-MMM-Y'"
              :rangePicker="true" 
              :timePicker="false" 
              :minDate="null"
              :isDisabled="false"
              :autoOpen="false"
              :use24FormatTimeForEvents="true"
              :invisible="false"
              displayIn="bottom_left" 
              :buttons="{applyBtn: 'Apply', todayBtn: false}"
              :useCustomRange="false"
              style="width: 100%"
              >
            </EmDateTimePicker>
          <i @click.stop="$refs.dateRangePickerRef.toggle()" class='bx bxs-calendar tooglerIcon' ></i>
         </div>
        </div>



        
        <div class="col-12 mb-3">
          <BaseSelectMultiple placeholder="Select Classes" v-model="selectedClasses" :label="'Select Classes (By default selected all)'" :data="classes" displayKey="class_name" valueKey="class_short" style="width: 100%" >
          </BaseSelectMultiple> 
        </div>
        
        <div class="col-12 mb-3">
          <label class="form-check-label" >
            Select Vacation Type
          </label>
          <div class="vacationtypes">
            <div class="d-flex justify-content-start align-items-center flex-wrap gap-1 column-gap-3">
              <template v-for="vacationType in vacation_types" :key="value">
                <div class="form-check">
                  <input v-model="payload.reason" class="form-check-input" :id="remvoeSpaces(vacationType)" type="radio" name="vacation_type" :value="vacationType.title">
                  <label class="form-check-label" :for="remvoeSpaces(vacationType)">
                    {{ vacationType.title }}
                  </label>
                </div>

              </template>
              <div class="form-check">
                <input v-model="payload.reason" @click="showTextArea = !showTextArea" class="form-check-input" id="other" type="radio" name="vacation_type" :value="''">
                <label class="form-check-label" for="other">
                  Other
                </label>
              </div>
            </div>
            <div v-if="showTextArea" class="form-group mt-2">
             <label>Write custom note for vacation type</label>
             <textarea ref="textAreaRef" v-model="payload.reason" class="form-control cb-input cb-textarea"></textarea>
            </div>
          </div>

          <div class="d-flex justify-content-start mt-3 pt-2 gap-2">
            <Btn class="red" @click="onCancel">Cancel</Btn>
            <Btn @click="onSubmit">Save Now <BtnLoader v-if="showBtnLoader"></BtnLoader> </Btn>
          </div>

        </div>
        
      </div>
 


  </Rightbar>
    
    
  </div>
</template>


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
.vacationtypes{
  border: 1px solid #ffffff;
  border-radius: 6px;
  padding: 10px;
}
</style>
