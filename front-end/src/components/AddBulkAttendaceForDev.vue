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
                <select v-model="payload.class_short" class="form-control cb-input" @change="submitSearch">
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
               <div class="col-md-6 col-12 mt-3" >
                   <div class="row">
                       <div class="col-12">
                           <label for="">Select Date Range</label>
                           <EmDateTimePicker 
                           ref="pickerModelValueRef"
                           v-model="payload.dates"
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
                           displayIn="inline" 
                           :buttons="{applyBtn: false, todayBtn: false}"
   
                           ></EmDateTimePicker>
                       </div>
                   </div>
                    
               </div>
   
               <div class="col-md-6 col-12mt-3">
                   <div class="row">
                        <div class="col-12">
                           <div class="form-group float-end">
                               <label for="">Punch Out Times</label>
                               <Switch v-model="payload.out_time_punch" size="lg"></Switch>
                           </div>
                       </div>
                       <div class="col-12 mt-3">
                           <div class="form-group float-end">
                               <label for="">With Random Time</label>
                               <Switch v-model="payload.with_random_time" size="lg"></Switch>
                           </div>
                       </div>
                       
                       <template v-if="true">
                           <div class="col-12 mt-3">
                               <div class="form-group float-end">
                                   <label for="">Before</label>
                                   <input style="max-width:180px" v-model="payload.times.before" type="number" class="form-control cb-input" :disabled="!payload.with_random_time"> 
                               </div>
                           </div>
                           <div class="col-12 mt-3">
                               <div class="form-group float-end">
                                   <label for="">After</label>
                                   <input style="max-width:180px" v-model="payload.times.after" type="number" class="form-control cb-input" :disabled="!payload.with_random_time"> 
                               </div>
                           </div>
                           <div class="col-12 mt-3">
                               <div class="form-group float-end">
                                   <label for="" >Day Miss Probability</label>
                                   <input style="max-width:180px" v-model="payload.day_miss_probility" type="number" class="form-control cb-input" :disabled="!payload.with_random_time"> 
                               </div>
                           </div>
                           <div class="col-12 mt-3">
                               <div class="form-group float-end">
                                   <label for="" >Shift Miss Probability</label>
                                   <input style="max-width:180px" v-model="payload.shift_miss_probility" type="number" class="form-control cb-input" :disabled="!payload.with_random_time"> 
                               </div>
                           </div>
                           <div class="col-12 mt-3">
                               <div class="form-group float-end">
                                   <label for="" >Wait For Each</label>
                                   <select v-model="payload.wait_for_each" class="form-control cb-input" @change="submitSearch">
                                        <option :value="0"> Not Wait </option>                
                                        <option :value="500"> 1/2 Second </option>                
                                        <option :value="1000"> 1 Second </option>                
                                        <option :value="1500"> 1.5 Second </option>                
                                        <option :value="2000"> 2 Second </option>                 
                                    </select> 
                               </div>
                           </div>
                       </template> 
   
                       
   
                       
                   </div>
               </div>
           </div>
        </div>
        <template #footer>
            <div class="col-12 mt-5 d-flex column-gap-2 justify-content-between">
                <Btn @click.stop="AddBulkAttendanceNow()">Add Bulk Attendance <BtnLoader v-if="inserting"></BtnLoader> </Btn>
                <Btn @click.stop="deleteAllDataForSelectedClass()" class="red border" v-if="payload.class_short != 'null' && payload.dates?.startDate && payload.dates?.endDate">
                    <i class='bx bxs-trash' ></i> Delete Data for <span class="badge bg-danger shadow">{{ payload.class_short || 'All Classes' }}</span>
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
    wait_for_each: 0, 
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
    day_miss_probility: 5, // Math.random() * 100 <= day_miss_probility, no entry will added for date
    shift_miss_probility: 5, // Math.random() * 100 <= shift_miss_probility, no entry will added for curret shift
    times: {
        before: 20,
        after: 6,
    },
})

let studentsByClass = computed(() => {
    if(!payload.class_short){
        return []
    }
    
    let students = all_students_non_copied.value.filter(student => student.class_short == payload.class_short)
    if(studentnameorid.value){
        let is_id = /\d+/.test(studentnameorid.value)
        if(is_id){
            students = students.filter(student => student.dakhela.toString().includes(studentnameorid.value))
        } else {
            students = students.filter(student => student.name.toLowerCase().includes(studentnameorid.value.toLowerCase()))
        }
    }
    return students
})

watch(()=>payload.class_short, () => {
    payload.selected_students = []
    studentnameorid.value = ''
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
        return emitter.emit('toaster-error', { message: helper.t('Please select a class'), duration: 1000 })
    }
    if(!payload.shifts?.length){
        return emitter.emit('toaster-error', { message: helper.t('Please select shifts'), duration: 1000 })
    }
    
    if(!payload.selected_students?.length){
        return emitter.emit('toaster-error', { message: helper.t('No students found in {name}', { name: getSelectedClass.value.class_name }), duration: 1000 })
    }

    if(!payload.dates.startDate || !payload.dates.endDate){
        return emitter.emit('toaster-error', { message: helper.t('Please select date range'), duration: 1000 })
    }
  
    if(!payload.dates?.startDate?.length){
        return emitter.emit('toaster-error', { message: helper.t('No valid dates found in the selected range (considering weekends)') })
    }

    let date_range = helper.createDateRange(payload.dates.startDate, payload.dates.endDate)

    let records = []
    date_range.forEach(date => {

        let { day_miss_probility, shift_miss_probility } = payload
        payload.selected_students.forEach(student => { 
            let _dayRandVal = Math.random() * 100 
            let miss_day =_dayRandVal <= Number(day_miss_probility)
            if(!miss_day){
                let barcode = makeCarcode(student)
                payload.shifts.forEach((shift, i) => {
                    let _shiftRandVal = Math.random() * 100 
                    let miss_day_shift = _shiftRandVal <= Number(shift_miss_probility)

                    if(!miss_day_shift){

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
                            shift_in_out_pucn.push(out_punch)
                        } 
        
                        records.push(shift_in_out_pucn)
                    } else {
                        console.log('Skip-shift', {i, _shiftRandVal})
                    }
                        
                })
            } else {
                console.log('Skip-date', date);
            }
        })
 
    })
   
    let all_records = records.flat()

    // console.log({records, all_records});

    if(!confirm(helper.t('Are you sure to add {count} new records?', { count: all_records.length }))) return

    inserting.value = true
    for (const item of all_records){
        await punchToSubmitAttendance(item[0], item[1])
        if(payload.wait_for_each){
            await helper.wait(payload.wait_for_each)
        }
    }
    inserting.value = false 
}


async function deleteAllDataForSelectedClass(){

    if(!confirm(helper.t('Are you sure to delete all attendance data for {className} from {startDate} to {endDate}?', { className: payload.class_short, startDate: payload.dates?.startDate, endDate: payload.dates?.endDate }))) return
    let dakhelas = payload.class_short ? all_students.value.filter(s => s.class_short == payload.class_short).map(s => s.dakhela) : all_students.value.map(s => s.dakhela)

    if(!dakhelas || dakhelas.length === 0) {
        return emitter.emit('toaster-error', { message: helper.t('No students found in selected class')})
    }

    let startDate = typeof payload.dates?.startDate === 'string' ? payload.dates.startDate : moment(payload.dates?.startDate).format('YYYY-MM-DD')
    let endDate = typeof payload.dates?.endDate === 'string' ? payload.dates.endDate : moment(payload.dates?.endDate).format('YYYY-MM-DD')

    try {
        let response = await http.delete('/attendence-delete-bulk', {
            data: {
                student_dakhelas: dakhelas,
                start_date: startDate,
                end_date: endDate,
            }
        })
        if(response.status == 200){
            emitter.emit('toaster-success', { message: response.data?.message})
        } else {
            emitter.emit('toaster-error', { message: helper.t('Delete failed!')})
        }
    } catch (error) {
        console.error('Delete error:', error)
        emitter.emit('toaster-error', { message: helper.t('Delete failed')})
    }

    emitter.emit('blulk_deleted_attendences', true)
}

 
</script>

<style scoped> 
  
</style>
