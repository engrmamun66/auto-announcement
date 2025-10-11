<script setup>
import moment from 'moment/moment'
import { inject, ref, reactive, onMounted, onBeforeUnmount, computed, watch } from "vue";
import Ahelper from "./../attendacnceHelper";

const CONFIG = inject("CONFIG");
const classes = inject("classes");
const all_students = inject("all_students");
const helper = inject("helper");
const callbacks = inject("callbacks");
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

let pickerModelValue = ref({})

let payload = reactive({
  type: 'leave', // leave | vacation
  indentity_string: Ahelper.generateUniqueString(),
  class_short: null,
  student_id: null,
  date: null,
  reason: '',
})

 


</script>


<template>
  <div>
    <FullCalendarClasswise 
      @add-vacation="showRightbar = true"
    ></FullCalendarClasswise>

    <Rightbar v-if="showRightbar" @unmount="showRightbar = false" title="Add Class Wise Vacation" :largestMode="false"> 
      <div class="row">

        <div class="col-12 mb-3">
          <div class="position-relative">
            <label for="">Select Date Range</label>
            <EmDateTimePicker ref="dateRangePickerRef"
              v-model="pickerModelValue"
              @change="false"
              @close="false"
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
          <!-- <small class="p-1 bg-body-secondary text-black-50 text-break">
            স্বাভাবিকভাবেই প্রতিষ্ঠান থেকে কোনও বন্ধ দেয়া হলে সকল ক্লাসের জন্যই দেয়া হয়।  
            তবে আপনি ছাইলে কোন ক্লাসকে এখান থেকে বাদ দিয়ে ছুটির সময়সীমা নির্ধারণ করতে পারেন। 
          </small>  -->
          <small class="p-1 bg-body-secondary text-black-50 text-break">
            Normally, if an institution gives a holiday, it is given to all classes. However, you can exclude any class from this list and set the holiday period.
          </small> 
        </div>
        
        <div class="col-12 mb-3">
           <div class="form-group">
            <label>Note</label>
            <textarea  v-model="payload.reason" class="form-control cb-input cb-textarea"></textarea>
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

</style>
