<template> 
    <Rightbar
    ref="RightbarRef"
    v-if="showRightbar" 
    title="Add bulk Attendance"
    @unmount="showRightbar = false; $emit('unmount')"
    :largestMode="false"
    >
        <div class="row">
            <div class="col-6">
                <label for="">Select Class </label>
                <select v-model="payload.class_short" class="form-control cb-input" @change="submitSearch" style="width:350px">
                    <option :value="null">-class-</option>
                    <template v-for="(cls, index) in classes" :key="index">
                        <option :value="cls.class_short">{{cls?.class_name}}</option>
                    </template>                  
                </select> 
            </div>
            <div class="col-6">
                <label for="">Attendance For Shifts</label>
                <BaseSelectMultiple v-model="payload.shifts" placeholder="-Select Shifts-" :data="class_shifts" valueKey="start" displayKey="start" displayKey2="end"></BaseSelectMultiple>
            </div>
            <div class="col-12 mt-3">
                <div class="form-group">
                    <label for="">Selected Students <span class="badge bg-primary">{{ payload.selected_students.length }}</span></label>
                    <BaseSelectMultiple placeholder="Select Students" v-model="payload.selected_students" :label="false" :data="studentsByClass" displayKey="full_name" valueKey="id" style="width: 100%" :search="true" :searchDelayTime="100" maxHeight="200px"
                    @searching="(search_text) => studentnameorid = search_text" >
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
                </div> 
            </div>
           <div class="row">
               <div class="col-6 mt-3" >
                   <div class="row">
                       <div class="col-12">
                           <label for="">Select Date Range</label>
                           <EmDateTimePicker 
                           ref="pickerModelValueRef"
                           v-model="payload.dates"
                           @change="({startDate, endDate}) => {
                               helper.delay(() => {
                                   payload.dates = {}
                                   payload.dates.startDate = startDate
                                   payload.dates.endDate = endDate
                               }, 0)
                           }"
                           @close="false"
                           :displayFormat="'DD-MMM-Y'"
                           :rangePicker="true" 
                           :timePicker="false" 
                           :minDate="null"
                           :isDisabled="false"
                           :autoOpen="true"
                           :stickyMode="true"
                           :inline="true"
                           :timePickerButtons="true"
                           :use24FormatTimeForEvents="true"
                           :invisible="true"
                           displayIn="inline_left" 
                           :buttons="{applyBtn: false, todayBtn: false}"
   
                           ></EmDateTimePicker>
                       </div>
                   </div>
                    
               </div>
   
               <div class="col-6 mt-3">
                   <div class="row">
                       <div class="col-6">
                           <div class="form-group">
                               <label for="">With Random Time</label>
                               <Switch v-model="payload.with_random_time" size="lg"></Switch>
                           </div>
                       </div>
                       <div class="col-6">
                           <div class="form-group">
                               <label for="">Punch Out Times</label>
                               <Switch v-model="payload.out_time_punch" size="lg"></Switch>
                           </div>
                       </div>
                       <template v-if="true">
                           <div class="col-6 mt-3">
                               <div class="form-group">
                                   <label for="">Before</label>
                                   <input v-model="payload.times.before" type="number" class="form-control cb-input" :disabled="!payload.with_random_time"> 
                               </div>
                           </div>
                           <div class="col-6 mt-3">
                               <div class="form-group">
                                   <label for="">After</label>
                                   <input v-model="payload.times.after" type="number" class="form-control cb-input" :disabled="!payload.with_random_time"> 
                               </div>
                           </div>
                       </template> 
   
                       
   
                       
                   </div>
               </div>
           </div>
        </div>
        <template #footer>
            <div class="col-12 mt-5 d-flex column-gap-2">
                <Btn @click.stop="AddBulkAttendanceNow()">Add Bulk Attendance <BtnLoader v-if="inserting"></BtnLoader> </Btn>
                <Btn @click.stop="deleteAllDataForSelectedClass()" class="red" v-if="payload.class_short && payload.class_short != 'null' && payload.dates?.startDate && payload.dates?.endDate">
                    <i class='bx bxs-trash' ></i> Delete Data for <span class="badge bg-danger shadow">{{ payload.class_short }}</span>
                </Btn>
            </div>
        </template>

    </Rightbar> 
</template>

<script setup>
import Btn from './Btn.vue'
import Rightbar from './Rightbar.vue'
import { ref, inject, reactive, computed, onMounted, watch } from "vue"; 
let http = inject('http'); 
let CONFIG = inject('CONFIG'); 
let emitter = inject('emitter'); 
import BtnLoader from './BtnLoader.vue'
let helper = inject('helper')
import Switch from './Switch.vue'
import BaseSelectMultiple from './BaseSelectMultiple.vue'
import EmDateTimePicker from './EmDateTimePicker.vue'
import { template } from 'lodash';

const weekends = CONFIG.value?.settings?.attendance?.weekends || []

let props = defineProps({
    
})
let emits = defineEmits(['change', 'unmount']) 

let classes = inject('classes')
let all_students = inject('all_students')
let all_students_non_copied = inject('all_students_non_copied')
let makeCarcode = inject('makeCarcode')
let punchToSubmitAttendance = inject('punchToSubmitAttendance')

// punchToSubmitAttendance(makeCarcode(targetStudent.value), {source: 'manual_button', delay: 0, punch_time: data.startDateTime })

let showRightbar = ref(true)
let pickerModelValueRef = ref(null)
let studentnameorid = ref('')

let payload = reactive({
    class_short: null,
    shifts: [],
    selected_students: [],
    dates: {
        startDate: null,
        endDate: null,
    },
    with_random_time: 1,
    out_time_punch: 1,
    source_device: 1,
    times: {
        before: 15,
        after: 15,
    },
})

let studentsByClass = computed(() => {
    if(!payload.class_short){
        return []
    }
    return all_students_non_copied.value.filter(student => student.class_short == payload.class_short)
})

watch(()=>payload.class_short, () => {
    payload.selected_students = []
})

let getSelectedClass = computed(() => {
    if(!payload.class_short){
        return null
    }
    return classes.value.find(cls => cls.class_short == payload.class_short)
})
let class_shifts = computed(() => {
    if(!getSelectedClass.value){
        return []
    }
    return getSelectedClass.value.shifts
})


onMounted(()=>{
    pickerModelValueRef.value.clearPicker()
})

let inserting = ref(false)

async function AddBulkAttendanceNow() {
    if(inserting.value) return

    if(!payload.class_short){
        return emitter.emit('toaster-error', { message: 'Please select a class', duration: 1000 })
    }
    if(!payload.shifts?.length){
        return emitter.emit('toaster-error', { message: 'Please select shifts', duration: 1000 })
    }
    if(!payload.dates.startDate || !payload.dates.endDate){
        return emitter.emit('toaster-error', { message: 'Please select date range', duration: 1000 })
    }

    if(!payload.selected_students?.length){
        return emitter.emit('toaster-error', { message: `No students found in ${getSelectedClass.value.class_name}`, duration: 1000 })
    }
  
    if(!payload.dates?.startDate?.length){
        return emitter.emit('toaster-error', { message: 'No valid dates found in the selected range (considering weekends)' })
    }

    let date_range = helper.createDateRange(payload.dates.startDate, payload.dates.endDate)

    let records = []
    date_range.forEach(date => {
        payload.selected_students.forEach(student => { 
            let barcode = makeCarcode(student)
            payload.shifts.forEach((shift) => {
                let { times } = payload
                let { start, end } = shift
               
                if(payload.with_random_time){
                    let rand_minute = helper.randomBetween(0, Number(times.before) + Number(times.after))
                    start = moment(start, 'HH:mm').subtract(times.before, 'minutes').add(rand_minute, 'minutes').format('HH:mm')
                }

                let shift_in_out_pucn = []

                let in_punch = [barcode, {
                    source: payload.source_device ? 'device' : 'manual_button',
                    punch_time: date + ' ' + start
                }]

                // In punch
                shift_in_out_pucn.push(in_punch)



                if(payload.out_time_punch){
                    let rand_minute = helper.randomBetween(0, Number(times.after))
                    end = moment(end, 'HH:mm').add(rand_minute, 'minutes').format('HH:mm')

                    let out_punch = [barcode, {
                        source: payload.source_device ? 'device' : 'manual_button',
                        punch_time: date + ' ' + end
                    }]
                    // Out punch
                    shift_in_out_pucn.push(in_punch)
                } 

                records.push(shift_in_out_pucn)
                 
            })
        })
    })
   
    let all_records = records.flat()


    window.addEventListener('unload', (event) => {
        event.preventDefault();
        event.returnValue = false;
        return false
    })

    if(!confirm(`Are you sure to add ${all_records.length} new records` )) return

    inserting.value = true
    for (const item of all_records){
        // punchToSubmitAttendance(makeCarcode(targetStudent.value), {source: 'manual_button', delay: 0, punch_time: data.startDateTime })
        await punchToSubmitAttendance(item[0], item[1])
    }
    inserting.value = false 
}


async function deleteAllDataForSelectedClass(){

    if(!confirm(`Are you sure to delete all attendance data for ${payload.class_short} from ${payload.dates?.startDate} to ${payload.dates?.endDate}?`)) return
    let params = {
        student_ids: all_students.value.filter(s => s.class_short == payload.class_short).map(s => s.dakhela),
        start_date: payload.dates?.startDate,
        end_date: payload.dates?.endDate,
    }
    try {
        let response = await http.delete('/attendence-delete-bulk', { params })
        if(response.status == 200){
            emitter.emit('toaster-success', { message: response.data?.message})
        } else {
            emitter.emit('toaster-error', { message: 'Deleted failed!'})
        }
    } catch (error) {
        emitter.emit('toaster-error', { message: 'Deleted failed'})
    }
}

 
</script>

<style scoped> 
  
</style>