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
import FullCalendarEvents from './../../../components/FullCalendarEvents.vue'
import EmDateTimePicker from './../../../components/EmDateTimePicker.vue'
import Rightbar from './../../../components/Rightbar.vue'
import Btn from './../../../components/Btn.vue'
import Switch from './../../../components/Switch.vue'
import BtnLoader from './../../../components/BtnLoader.vue'
import Modal from './../../../components/modal.vue'
import Confirm from './../../../components/Confirm.vue'

const props = defineProps({
  modelValue: {
    type: Object,
    default: () => ({}),
  },
});

const emit = defineEmits(['update:modelValue', 'onBtnSubmit', 'onBtnClear']);

let log = console.log
let showRightbar = ref(false)
let isSelectedAllClasses = ref(1)
let selectedClasses = ref([...classes.value])

let RightbarRef = ref(null)
let showTextArea = ref(false)
let pickerModelValue = ref({})
let calendarEvents = ref([])
let vacationData = ref([])
let dateRange = ref({ start_date: null, end_date: null })
let targetedVacationToDelete = ref(null)
let showDeleteModal = ref(null)
let showDetailsModal = ref(null)

// let tab3_class_short = inject('tab3_class_short')
let tab3_class_short = ref(null)

watch(tab3_class_short, (classShort) => {
  onInitAndNextPrev(dateRange.value)
})

let vacation_types = CONFIG.value?.settings?.attendance?.vacation_types || []

function remvoeSpaces(str){
  return str ? str.replace(/\s+/g, '') : str
}

let payload = reactive({
  type: 'leave', // leave | vacation
  identity_string: Ahelper.generateUniqueString(),
  class_short: null,
  student_id: null,
  date: null,
  reason: 'Exam',
})


function onCancel(){
  payload.reason = ''
  payload.student_id = null
  payload.reason = 'Exam'
  isSelectedAllClasses.value = 1
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
    callbacks.getLeavesAndVacations({type: 'vacation', ...dateRange.value}),
    onInitAndNextPrev(dateRange.value)
  })

  showBtnLoader.value = true
  helper.delay(()=>showBtnLoader.value = false, 1200)
}



async function onInitAndNextPrev({start_date, end_date}){
  let queryParams = { start_date, end_date }
  dateRange.value = { start_date, end_date }
  let vacation_data = await callbacks.getLeavesAndVacations({type: 'vacation', ...queryParams})
  vacationData.value = vacation_data
  createAndDisplayEventList()
}


async function createAndDisplayEventList(){
  let vacation_events = []

  let class__short = tab3_class_short.value

  // With weekends
  const weekends = CONFIG.value?.settings?.attendance?.weekends || []
  let {start_date, end_date} = dateRange.value
  let weekends_array = helper.createDateRange(start_date, end_date)
                      .filter(date => weekends.includes(moment(date).format('dddd')))
  weekends_array.forEach(date => vacation_events.push(helper.createWeekdayEvent(date)))

  // Excluding weekends because already added above
  let vacation_dates = vacationData.value.filter(v => !weekends_array.includes(v.date))

  let grouped = helper.listGroupBy(vacation_dates, 'reason')

  Object.entries(grouped).forEach(([reason, __vacations]) => {
    // grouped_by_identity
    let vacation_slots = helper.listGroupBy(__vacations, 'identity_string')
    Object.entries(vacation_slots).forEach(([_, vacations]) => {


      // Filter by class short
      if(class__short && class__short != '_all_'){
        vacations = vacations.filter(v => v.class_short == class__short || v.class_short == '_all_')
        if(vacations.length == 0) return
      }


      let first_item = vacations[0]
      let last_item = vacations[vacations.length - 1]
      let backgroundColor = vacation_types.find(vt => {
        return vt.title == reason
      })?.bgcolor || 'tomato'

      let vaction_slot = helper.createVacationEvent(first_item.date, last_item.date, vacations, first_item.reason, { backgroundColor, class__short })
      vacation_events.push(vaction_slot)
    })
  }) 
 
  // ====================================================== //
  // ================= Create Loader Event ================ //
  // ====================================================== //
  let loading_events =  helper.createDateRange(dateRange.value.start_date, dateRange.value.end_date, 'day').map(date => {
    return {
      title: `<span class="spinner-border text-secondary ms-1 fs-6" style="--bs-spinner-width: 20px;--bs-spinner-height:20px;--bs-spinner-border-width: 2px;"></span>`,
      start: date,
      end: date,
      backgroundColor: '#b5666600',
      borderColor: 'transparent',
      textColor: 'black',
      isMirror: false,
      is___custom: true
    }
  })
  calendarEvents.value = loading_events
  // ================= Create Loader Event ================ //
  // ====================================================== //

  setTimeout(() => {
    calendarEvents.value = vacation_events
  }, 300);
}


let initiallyClear = ref(true)

function onAdVacation({date}){
  initiallyClear.value = false
  pickerModelValue.value = {startDate: date, endDate: date}
  showRightbar.value = true
}
 

async function deleteVacations(){
  if(!targetedVacationToDelete.value) return
  let identity_strings = helper.uniqueArray((targetedVacationToDelete.value?.vacations || []).map(v=>v.identity_string))
  if(identity_strings?.length == 0) return
  http.post('/leave-and-vacation-delete', { identity_strings }).then(response => {
    if(response.status == 200){
      onInitAndNextPrev(dateRange.value)
    }
  }).finally(()=>{
     
  })
}




</script>


<template>
  <div>


    <div class="d-flex justify-content-center column-gap-3 mb-2">
        <div class="form-group" tooltip="Select A Class">
          <select class="form-control cb-input" v-model="tab3_class_short" style="min-width: 400px;height:44px" >
            <option :value="null">-All Classes-</option>
            <template v-for="(eachClass, index) in classes" :key="index">
              <option :value="eachClass.class_short">{{ eachClass.class_name }}</option>
            </template>                  
          </select>
        </div>
    </div>
    <FullCalendarEvents 
    :events="calendarEvents"
    :weekends="CONFIG.settings?.attendance?.weekends || []"
    @initAndNextPrev="onInitAndNextPrev" 
    @advacation="onAdVacation" 
    @delete="(vacations)=>{
      targetedVacationToDelete = vacations
      showDeleteModal = true
    }"
    @viewDetails="(vacations)=>{
      targetedVacationToDelete = vacations
      showDetailsModal = true
    }"
    ></FullCalendarEvents>

    <Confirm v-model="showDeleteModal" @yes="deleteVacations">
      <div class="overflow-y-auto modal-table" style="max-height: 200px;">
        <table>
          <tbody>
            <template v-for="item in targetedVacationToDelete?.vacations">
              <tr>
                <td class="size-09"><span class="badge bg-secondary">{{ item?.reason }}</span></td>
                <td class="size-09">{{ item?.date }}</td>
                <td class="size-09">{{ item?.class_short == '_all_' ? 'All' : item?.class_short }}</td>
              </tr>
            </template>
          </tbody>
        </table>
      </div>
      <p class="mb-0"><strong>Do you want to delete all?</strong></p>
    </confirm>
    <Modal v-model="showDetailsModal" @yes="deleteVacations">
      <template #title>Details View</template>
      <div class="overflow-y-auto modal-table" style="max-height: 400px;">
        <table class="w-100">
          <tbody>
            <template v-for="item in targetedVacationToDelete?.vacations">
              <tr>
                <td class="size-09"><span class="badge bg-secondary">{{ item?.reason }}</span></td>
                <td class="size-09">{{ item?.date }}</td>
                <td class="size-09">{{ item?.class_short == '_all_' ? 'All Class' : item?.class_short }}</td>
                <td class="size-09 text-end"><span class="badge bg-secondary">{{ item?.type }}</span></td>
              </tr>
            </template>
          </tbody>
        </table>
      </div>

      <div class="d-flex justify-content-end column-gap-2">
        <Btn @click="showDetailsModal = false">Close</Btn>
        <Btn @click="deleteVacations();showDetailsModal = false" class="red">Delete</Btn>
      </div>

    </Modal>
    
    <Rightbar ref="RightbarRef" v-if="showRightbar" @unmount="showRightbar = false;initiallyClear=true" title="Add Class Wise Vacation" :largestMode="false"> 
      <div class="row">

        <div class="col-12 mb-3">
          <label for="">Select Date Range</label>
          <div class="position-relative">
            <EmDateTimePicker ref="dateRangePickerRef"
              v-model="pickerModelValue"
              @change="false"
              @close="false"
              @initialized="initiallyClear ? $refs.dateRangePickerRef.clearPicker() : false"
              :displayFormat="'DD-MMM-Y'"
              :rangePicker="true" 
              :timePicker="false" 
              :minDate="null"
              :isDisabled="false"
              :startDate="pickerModelValue?.startDate"
              :endDate="pickerModelValue?.endDate"
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
          
          <div class="d-flex justify-content-between align-items-center" style="line-height: 40px;">
            <label for="" class="form-check-label">Vacation Applying For (By default selected all)</label>
          </div>
          <Switch v-model="isSelectedAllClasses" size="xlg" yes="All Classes" no="Select Classes"></Switch>
          <template v-if="!isSelectedAllClasses"> 
            <BaseSelectMultiple placeholder="Select Classes" class="mt-2" v-model="selectedClasses" :label="false" :data="classes" displayKey="class_name" valueKey="class_short" style="width: 100%" >
            </BaseSelectMultiple> 
          </template>
        </div>
        
        <div class="col-12 mb-3">
          <label class="form-check-label" >
            Select Vacation Type
          </label>
          <div class="vacationtypes">
            <div class="row">
              <template v-for="vacationType in vacation_types" :key="value">
                <div class="col-md-6">
                  <div class="form-check cp" :class="{checked: payload.reason == vacationType.title}" @click="showTextArea = false;payload.reason = vacationType.title">
                    <input v-model="payload.reason" class="form-check-input" :id="remvoeSpaces(vacationType.title)" type="radio" name="vacation_type" :value="vacationType.title" @click="showTextArea = false">
                    <label class="form-check-label" :for="remvoeSpaces(vacationType.title)">
                      {{ vacationType.title }}
                    </label>
                  </div>
                </div>

              </template>

              <div class="col-md-6">
                <div class="form-check" @click="showTextArea = true;payload.reason = ''">
                  <input @click="showTextArea = true; payload.reason = ''" class="form-check-input" type="radio" name="vacation_type" :value="''" :checked="!vacation_types.map(vt=>vt.title).includes(payload.reason)" >
                  <label class="form-check-label" for="other">
                    Other Vacation
                  </label>
                </div>
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
  border: 1px solid #bdbdbd;
  border-radius: 6px;
  padding: 10px;
}
.vacationtypes .form-check{ 
  border: 1px solid #dcdcdc;
  background-color: #eeeeee;
  padding: 2px 5px 5px 30px;
  border-radius: 5px;
  margin-bottom: 3px;
}
.vacationtypes .form-check.checked{ 
  border: 1px solid #1a8778;
}
.modal-table{
  max-height: 200px;
  border: 1px solid #e2e2e2;
  padding: 10px;
  margin-block: 10px;
  border-radius: 10px;
}
</style>
