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
                <select v-model="payload.class_short" class="form-control cb-input" @change="submitSearch" style="width:350px">
                    <option :value="null">-class-</option>
                    <template v-for="(cls, index) in classes" :key="index">
                        <option :value="cls.class_short">{{cls.class_name}}</option>
                    </template>                  
                </select> 
            </div>
            <div class="col-6">
                <BaseSelectMultiple v-model="payload.shifts" :data="class_shifts" valueKey="start" displayKey="start" displayKey2="end"></BaseSelectMultiple>
                <ul>
                    <li v-for="shift in class_shifts" :key="shift.start">{{ shift.start }} - {{ shift.end }}</li>
                </ul>
            </div>
            <div class="col-6 mt-3">
                <EmDateTimePicker 
                ref="pickerModelValueRef"
                v-model="payload.dates"
                @change="false"
                @close="false"
                :displayFormat="'DD-MMM-Y'"
                :rangePicker="false" 
                :timePicker="true" 
                :minDate="null"
                :isDisabled="false"
                :autoOpen="true"
                :sticky="true"
                :stickyMode="true"
                :timePickerButtons="true"
                :use24FormatTimeForEvents="true"
                :invisible="false"
                displayIn="inline_left" 
                :buttons="{applyBtn: 'Set-Attendace', todayBtn: false}"

                ></EmDateTimePicker>
                 
            </div>
        </div>

    </Rightbar> 
</template>

<script setup>
import Btn from './Btn.vue'
import Rightbar from './Rightbar.vue'
import { ref, inject, reactive, computed } from "vue"; 
let http = inject('http'); 
let CONFIG = inject('CONFIG'); 
let emitter = inject('emitter'); 
import BtnLoader from './BtnLoader.vue'
import BaseSelectMultiple from './BaseSelectMultiple.vue'
import EmDateTimePicker from './EmDateTimePicker.vue'

const weekends = CONFIG.value?.settings?.attendance?.weekends || []

let props = defineProps({
    
})
let emits = defineEmits(['change', 'unmount']) 

let classes = inject('classes')
let all_students_non_copied = inject('all_students_non_copied')

let showRightbar = ref(true)
let pickerModelValueRef = ref(null)

let payload = reactive({
    class_short: null,
    shifts: [],
    dates: {
        startDateTime: null,
        endDateTime: null,
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

 
</script>

<style scoped> 
  
</style>