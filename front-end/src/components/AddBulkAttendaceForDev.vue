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
           
            <div class="col-6 mt-3">
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
                    <div class="col-12 mt-3">
                        <pre>
                            {{ payload }}
                        </pre>
                    </div>

                    

                    
                </div>
            </div>
        </div>
        <template #footer>
            <div class="col-12 mt-5 d-flex column-gap-2">
                <Btn @click.stop="AddBulkAttendanceNow()">Add Bulk Attendance</Btn>
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
import { ref, inject, reactive, computed, onMounted } from "vue"; 
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

let payload = reactive({
    class_short: 'play',
    shifts: [],
    dates: {
        startDate: null,
        endDate: null,
    },
    with_random_time: 1,
    out_time_punch: 1,
    times: {
        before: 15,
        after: 15,
    },
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



async function AddBulkAttendanceNow() {
    if(!payload.class_short){
        return emitter.emit('toaster-error', { message: 'Please select a class', duration: 1000 })
    }
    if(!payload.shifts?.length){
        return emitter.emit('toaster-error', { message: 'Please select shifts', duration: 1000 })
    }
    if(!payload.dates.startDate || !payload.dates.endDate){
        return emitter.emit('toaster-error', { message: 'Please select date range', duration: 1000 })
    }

    let students_in_class = all_students_non_copied.value.filter(student => student.class_short == payload.class_short)
    if(!students_in_class?.length){
        return emitter.emit('toaster-error', { message: `No students found in ${getSelectedClass.value.class_name}`, duration: 1000 })
    }
 

    let all_dates = []
    let startDate = moment(payload.dates.startDateTime)
    let endDate = moment(payload.dates.endDateTime)

    while (startDate.isSameOrBefore(endDate)) {
        if(!weekends.includes(startDate.day())){
            all_dates.push(startDate.format('YYYY-MM-DD'))
        }
        startDate.add(1, 'day')
    }

    if(!all_dates?.length){
        return emitter.emit('toaster-error', { message: 'No valid dates found in the selected range (considering weekends)' })
    }

    // let final_payload = {
    //     class_short: payload.class_short,
    //     shifts: payload.shifts,
    //     dates: all_dates,
    //     with_random_time: payload.with_random_time,
    //     times: payload.times,
    //     students: students_in_class.map(s => s.dakhela)
    // }

    let date_range = helper.createDateRange(payload.dates.startDate, payload.dates.endDate)

    let records = []
    date_range.forEach(date => {
        students_in_class.forEach(student => { 
            let barcode = makeCarcode(student)
            payload.shifts.forEach((shift) => {
                let { times } = payload
                let { start, end } = shift
               
                if(payload.with_random_time){
                    let rand_minute = helper.randomBetween(0, Number(times.before) + Number(times.after))
                    start = moment(start, 'HH:mm').subtract(times.before, 'minutes').add(rand_minute, 'minutes').format('HH:mm')
                }
                if(payload.out_time_punch){
                    let rand_minute = helper.randomBetween(0, Number(times.after))
                    end = moment(end, 'HH:mm').add(rand_minute, 'minutes').format('HH:mm')
                }
                let punch_time = date + ' ' + start
                console.log({start});
                 
            })
            // console.log({barcode});
        })
    })
   


    console.log({records});

    // punchToSubmitAttendance(makeCarcode(targetStudent.value), {source: 'manual_button', delay: 0, punch_time: data.startDateTime })
     
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