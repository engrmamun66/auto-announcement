<script setup>
import SwitcherForTime from './grand-childs/SwitcherForTime.vue';
import { hours_position, hours_position24, minutes_position } from './grand-childs/timePicker';
import { makeDate, pad2, delay, clone, log } from './grand-childs/helper';
import { ref, computed, reactive, defineProps, onMounted, inject, defineEmits, watch, provide, defineExpose } from 'vue';

let props = defineProps([
    'justInitializeValue', 
    'showingInRightSide',
    'inDatePicker',
    'multiCalendarLastItem',
]);
import Documentation from './grand-childs/Doccomponents/Doc.vue'
import Arrow from './grand-childs/Arrow.vue'
let isMounted = inject('isMounted');
const Emitter = inject('Emitter');
let theme = inject('theme');
let defaults = inject('defaults');
let FORMATS = inject('FORMATS');
let picker = inject('picker');
let pickerValues = inject('pickerValues');
let showDocumentation = inject('showDocumentation');
 
function makeStepRange(step) {    
    let limit = Math.floor(60 / step)
    let start = 0
    let end = start + limit;
    let rangeArray = Array.from({ length: end + start  }, (_, index) => (start + index) * step);
    return rangeArray;    
}
let steps = ref([]);
minutes_position.forEach( minute => {   
    let  { minuteStep } = defaults;    
    if(minuteStep){
        steps.value = makeStepRange(minuteStep);  
        if(steps.value?.length){
            if(steps.value?.includes(minute.id)){
                minute.excluded = false;
            } else {
                minute.excluded = true;
            }
        }        
    }    
})


let emits = defineEmits(['close', 'cancel', 'hidePopup', 'apply', 'changeTime']);
// mode
let time1_mode = ref('am');
let time2_mode = ref('am');
let mode = computed({
    get: () => {
        if(selectingStartTime.value){
            return time1_mode.value;
        }else{
            return time2_mode.value;
        }
    },
    set: (modename) => {
        if(selectingStartTime.value || !defaults?.rangePicker){
            time1_mode.value = modename;
        }else{
            time2_mode.value = modename;
        }
    },
});
let selectingStartTime = ref(true);
provide('selectingStartTime', selectingStartTime);
// Time1
let time1_selectedHour = ref(hours_position[0]);
let time1_selectedMinute = ref(minutes_position[0]);

// Time2
let time2_selectedHour = ref(hours_position[0]);
let time2_selectedMinute = ref(minutes_position[0]);
let selectedHour = computed({
    get: () => {
        if(selectingStartTime.value){
            return time1_selectedHour.value;
        }else{
            return time2_selectedHour.value;
        }
    },
    set: (hourObject) => {
        if(selectingStartTime.value){
            time1_selectedHour.value = hourObject;
        }else{
            time2_selectedHour.value = hourObject;
        }
    },    
})
let selectedMinute = computed({
    get: () => {
        if(selectingStartTime.value){
            return time1_selectedMinute.value;
        }else{
            return time2_selectedMinute.value;
        }
    },
    set: (minuteObject) => {
        if(selectingStartTime.value){
            time1_selectedMinute.value = minuteObject;
        }else{
            time2_selectedMinute.value = minuteObject;
        }
    },
})
let ui2 = reactive({
    expand: null, // null | hours | minutes
    incrHour: function(){
        let hour = selectedHour.value; 
        let using24Format = defaults.use24Format;
        let hours__positions = using24Format ? hours_position24 : hours_position
        let index = hours__positions.findIndex(item => item.id == hour.id);
        index = index + 1;
        if(index > (using24Format ? 23 : 11)) index = 0;
        selectedHour.value = hours__positions[index];
    
    },
    decrHour: function(){
        let hour = selectedHour.value;    
        let using24Format = defaults.use24Format;
        let hours__positions = using24Format ? hours_position24 : hours_position
        let index = hours__positions.findIndex(item => item.id == hour.id);
        index = index - 1;
        if(index < 0) index = (using24Format ? 23 : 11);
        selectedHour.value = hours__positions[index];              
    },
    incrMinute: function(){
        let {id, value} = selectedMinute.value; 
        let indexInSteps = steps.value.findIndex(m => m==value);
        let rightPartOfSteps = steps.value.slice(indexInSteps);
        let next_minute = rightPartOfSteps?.[1] || steps.value[0];
        let index = minutes_position.findIndex(m => m.id == next_minute);           
        selectedMinute.value = minutes_position[index];
    },
    decrMinute: function(){
        let {id, value} = selectedMinute.value; 
        let indexInSteps = steps.value.findIndex(m => m==value);
        let leftPartOfSteps = steps.value.slice(0, indexInSteps);
        let next_minute = leftPartOfSteps?.[leftPartOfSteps.length - 1] || steps.value[steps.value?.length - 1];
        let index = minutes_position.findIndex(m => m.id == next_minute);           
        selectedMinute.value = minutes_position[index];     
    },
});


let centerOfclick = ref(null);

function latestHourAndMinute(){
    let { value: { id: hour1 } } = time1_selectedHour;
    let { value: { id: hour2 } } = time2_selectedHour;

    let { value: {id: minute1} } = time1_selectedMinute;
    let { value: {id: minute2} } = time2_selectedMinute;

    return {
        time1: {
            hour: +hour1 + (time1_mode.value=='pm' ? 12 : 0),
            minute: minute1,
            mode: time1_mode.value,
        },
        time2: {
            hour: +hour2 + (time2_mode.value=='pm' ? 12 : 0),
            minute: minute2,
            mode: time2_mode.value,
        },
    };
}

function onClickClose(){
    if(props?.inDatePicker){
        emits('hidePopup', null);
    } else {
        emits('close', null);
    }
}

function getPrintableTime(hourObject, minuteObject, time_mode) {
    let {value: hour} = hourObject;
    let {value: minute} = minuteObject;
    hour = Number(hour) + (time_mode=='pm' ? 12 : 0);  
    let date_text = makeDate( new Date(), FORMATS.time, {hour, minute});
    return date_text;
}


function updateTimeValues(){     

    let time1_text = getPrintableTime(time1_selectedHour.value, time1_selectedMinute.value, time1_mode.value);
    let time2_text = getPrintableTime(time2_selectedHour.value, time2_selectedMinute.value, time2_mode.value);
    let data = {
        startTime: time1_text,
        endTime: time2_text,
        do_not_hide: defaults.timePickerButtons === false,
    }
    let latest = latestHourAndMinute();
    picker.time1 = {...latest.time1, time: time1_text};
    picker.time2 = {...latest.time2, time: time2_text};
    
    pickerValues.startTime = data.startTime;
    pickerValues.endTime = data.endTime;
}

function onClickOk({emit_name='changeTime', fromOkButton=false}={}, ){        

    if(emit_name) emits(emit_name, { inDatePicker: props.inDatePicker});  
    if(fromOkButton) emits('close', true);
}



watch(time1_selectedHour, (newValue, oldValue)=>{
    if(!defaults.rangePicker){
        time2_selectedHour.value = newValue;
    }
    if(defaults.endTimeAutoValid){
        setTimeout(() => {
            Time2_autoValidatation();
        }, 50);
    }

})
watch(time1_selectedMinute, (newValue, oldValue)=>{
    if(!defaults.rangePicker){       
        time2_selectedMinute.value = newValue;        
    }
    if(defaults.endTimeAutoValid){
        setTimeout(() => {
            Time2_autoValidatation();
        }, 50);
    }
})
watch(time2_selectedHour, (newValue, oldValue)=>{
   
    if(defaults.endTimeAutoValid){
        setTimeout(() => {
            Time2_autoValidatation();
        }, 50);
    }

})
watch(time2_selectedMinute, (newValue, oldValue)=>{
    if(defaults.endTimeAutoValid){
        setTimeout(() => {
            Time2_autoValidatation();
        }, 50);
    }
})
watch(time1_mode, (newValue, oldValue)=>{
    if(defaults.endTimeAutoValid){
        setTimeout(() => {
            Time2_autoValidatation();
        }, 50);
    }
})
/* -------------------------------------------------------------------------- */
/*                      Auto Emit Without OK button click                     */
/* -------------------------------------------------------------------------- */
watch(selectedHour, (newValue, oldValue)=>{
    setTimeout(() => {
        updateTimeValues();
        if(!defaults.timePickerButtons || defaults.sticky){
            if(!mounting_now.value) onClickOk();           
        }
    }, 100);    
})
watch(selectedMinute, (newValue, oldValue)=>{
    setTimeout(() => {
        updateTimeValues();
        if(!defaults.timePickerButtons || defaults.sticky){
            if(!mounting_now.value) onClickOk();
        }
    }, 100);    
})
watch(mode, (newValue, oldValue)=>{
    setTimeout(() => {
        updateTimeValues();
        if(!defaults.timePickerButtons || defaults.sticky){
            if(!mounting_now.value) onClickOk();
        }
    }, 100);    
})


function Time2_autoValidatation() {
    let {date1, date2} = picker;
    let is_same_day = date1 == date2;
    if(is_same_day){
        let {time1, time2} = latestHourAndMinute();
        let dateTime_1 = makeDate(new Date(), FORMATS.date) + ` ${pad2(time1.hour)}:${pad2(time1.minute)}`;
        let dateTime_2 = makeDate(new Date(), FORMATS.date) + ` ${pad2(time2.hour)}:${pad2(time2.minute)}`;
        let isNotValid = new Date(dateTime_1) <= new Date(dateTime_2);  
        if(!isNotValid){
            time2_mode.value = time1_mode.value;
            time2_selectedHour.value = time1_selectedHour.value;
            time2_selectedMinute.value = time1_selectedMinute.value;
        }
    }
}



function getCenterOfCircle() {
    if(!centerOfclick.value) return false;
    let circle = centerOfclick.value;
    let circleRect = circle.getBoundingClientRect();
    let centerX = circleRect.left + circleRect.width / 2;
    let centerY = circleRect.top + circleRect.height / 2;
    return { centerX, centerY };
}

let move = reactive({
    dragging: false,
})

let mounting_now = ref(true);

function asMounted(){
    let [hour1, minute1, mode1] = [ picker.time1.hour, picker.time1.minute, picker.time1.mode ];
    let [hour2, minute2, mode2] = [ picker.time2.hour, picker.time2.minute, picker.time2.mode ];    

    time1_mode.value = mode1;
    time2_mode.value = mode2;

    minute1 = minute1 == 12 ? 0 : minute1;
    minute2 = minute2 == 12 ? 0 : minute2; 

    if(defaults?.use24Format){  
          
        time1_selectedHour.value = hours_position24?.filter(h => h.value == pad2(hour1))?.[0] || hours_position[0];
        time2_selectedHour.value = hours_position24?.filter(h => h.value == pad2(hour2))?.[0] || time1_selectedHour.value;
    } else {

        if(hour1 > 11) hour1 = hour1 - 12;
        if(hour2 > 11) hour2 = hour2 - 12;
    
        time1_selectedHour.value = hours_position?.filter(h => h.value == pad2(hour1))?.[0] || hours_position[0];
        time2_selectedHour.value = hours_position?.filter(h => h.value == pad2(hour2))?.[0] || time1_selectedHour.value;
    }

    time1_selectedMinute.value = minutes_position?.filter(m => m.value == pad2(minute1))?.[0] || minutes_position[0];
    time2_selectedMinute.value = minutes_position?.filter(m => m.value == pad2(minute2))?.[0] || time1_selectedMinute.value;

    mounting_now.value = false;
}

onMounted(() => {     
    asMounted();    
})

let {
    body_bg: color_body_bg,
    primary_bg: color_primary_bg,
    bg_grey: color_bg_grey,
    font_dark: color_font_dark,
    font_dark_low: color_font_dark_low,
    font_light: color_font_light,
    soft_border: color_soft_border,
} = defaults.colors
const color_transparent_1 = color_primary_bg + '3d';
const color_transparent_2 = color_primary_bg + '1c';

let getPickerWidth = computed(()=>{
    if(props.showingInRightSide || defaults?.timePickerUi == 'modern'){
        return '240px';
    } else {
        return '260px';
    }
})
let maxHeight = computed(()=>{    
    if(defaults.timePickerUi == 'classic'){
        return getPickerWidth.value;
    }
    else if(defaults.timePickerUi == 'standard' && defaults.timePickerButtons && props.showingInRightSide){
        return '210px'
    } 
    else if(defaults.timePickerUi == 'standard' && defaults.timePickerButtons && !props.showingInRightSide){
        return '260px'
    } 
    else {
        return '210px';
    }
})
const area_radius = defaults.rangePicker ? '6px 6px 0px 0px' : '6px';
const gird_template_repeat = defaults.use24Format ? 'repeat(2,1fr)' : 'repeat(3,1fr)';
const indentityClasses = computed(() => {
    let class_str = [
        defaults?.timePickerUi, 
        props.showingInRightSide ? 'showingInRightSide' : '', 
        defaults?.rangePicker ? 'usingRangePicker' : ''
    ].filter(Boolean).join(' ');
    return class_str
})
let moderPicker_selectSize = computed(()=>{
    let size = props.showingInRightSide ? (defaults?.rangePicker ? 9 : 10) : 6;
    if(defaults.row >= 6) size = size;
    else {
        if(defaults?.rangePicker) size = 5;
        else size = 4;
    }
    return size;
})

defineExpose(({
    switch: function(bool){ // apatoto this is not using
        selectingStartTime.value = bool;
    },
    asMounted: asMounted,
}))

</script>

<template>
    <div @click.stop="false" :multiCalendarLastItem="multiCalendarLastItem"
    :style="`width:${getPickerWidth}; ${(showingInRightSide && defaults?.rangePicker && defaults?.timePickerUi == 'modern') ? 'margin-top:6px' : ''};${multiCalendarLastItem ? 'margin-bottom:30px': ''}`" 
    :class="{[`em-theme-${theme}`]: true, [indentityClasses]: showingInRightSide, [defaults.timePickerUi]: true}">
        <div  class="clocklet-container clocklet-container--inline" style="position:relative" >  
            <template v-if="defaults.timePickerUi == 'standard'">

                <template v-if="defaults.timePickerButtons && !showingInRightSide">
                    <template v-if="ui2.expand == null">
                        <div @click.stop="onClickClose()" class="closeIcon standard" :class="{[indentityClasses]: showingInRightSide}"><i class='bx bx-x' ></i></div>     
                        <div @click.stop="onClickOk({fromOkButton: true})" class="okIcon standard" :class="{[indentityClasses]: showingInRightSide}" ><i class='bx bx-check'></i></div> 
                    </template>    
                    <template v-else>
                        <div @click.stop="ui2.expand = null" class="backIcon"><i class='bx bx-chevron-left'></i></div> 
                    </template>    
                </template>    

                <div class="clocklet clocklet--inline" :class="{[defaults.timePickerUi]: true, ['rangePicker']: defaults?.rangePicker, 'showingInRightSide': showingInRightSide}" >
                    
                    <div class="clocklet-plate standard" :class="{ 
                        'need-scroll': defaults.timePickerButtons ? (defaults.minuteStep < 3 && ui2.expand != null) : (ui2.expand != null),
                        }" >

                        <template v-if="defaults.onlyTimePicker" >
                            <div v-if="!ui2.expand && defaults?.rangePicker" class="printable-time-section" >
                                   
                                    {{ getPrintableTime(time1_selectedHour, time1_selectedMinute, time1_mode) }}
                                    -
                                    {{ getPrintableTime(time2_selectedHour, time2_selectedMinute, time2_mode) }}   
                            </div>
                        </template>

                        <div v-if="ui2.expand == null" class="columns fade-in" :class="{[indentityClasses]: showingInRightSide, ['rangePicker']: defaults?.rangePicker}" >
                            

                            <div class="column">
                                <div @click.stop="ui2.incrHour()"> 
                                    <Arrow to="up"></Arrow>
                                </div>
                                <button @click.stop="ui2.expand = 'hours'" @wheel.prevent="(e)=>{
                                    if(e.deltaY < 0) ui2.incrHour();
                                    else ui2.decrHour()
                                }" >
                                    {{ pad2(selectedHour?.id) }}
                                </button>
                                <div @click.stop="ui2.decrHour()"> 
                                    <Arrow to="down"></Arrow>
                                </div>
                            </div>
                            <div class="column">
                                <div @click.stop="ui2.incrMinute()"> <Arrow to="up"></Arrow> </div>
                                <button @click.stop="ui2.expand = 'minutes'" @wheel.prevent="(e)=>{
                                    if(e.deltaY < 0) ui2.incrMinute();
                                    else ui2.decrMinute()
                                }" >
                                    {{ pad2(selectedMinute?.id) }}
                                </button>
                                <div @click.stop="ui2.decrMinute()"> <Arrow to="down"></Arrow> </div>
                            </div>
                            <template v-if="!defaults.use24Format">
                                <div class="column">
                                    <div @click.stop="mode=='am' ? mode='pm' : mode='am'"> <Arrow to="up"></Arrow> </div>
                                    <button @click.stop="mode=='am' ? mode='pm' : mode='am'" @wheel.prevent="(e)=>{
                                        delay(()=>{
                                            mode=='am' ? mode='pm' : mode='am'
                                        }, 50)
                                        
                                    }">{{ mode?.toUpperCase() }}</button>
                                    <div @click.stop="mode=='am' ? mode='pm' : mode='am'"> <Arrow to="down"></Arrow> </div>
                                </div>
                            </template>
                        </div>
                        <template v-if="ui2.expand == 'hours'">
                            <div class="label-of-selection">
                                <i class="bx bx-chevron-left cp" @click.stop="ui2.expand = null" ></i>
                                <span class="labelof-section">Select Hour</span>
                                <i class="bx bx-chevron-right hide-this"></i>
                            </div>
                            <ul class="all-hours fade-in">
                                <template v-if="defaults.use24Format">
                                    <template v-for="(hour, index) in hours_position24" :key="index">
                                        <li @click.stop="selectedHour = hour; ui2.expand=null" :class="{'active-hour': selectedHour?.id == hour.id}" >{{ hour.id }}</li>
                                    </template>
                                </template>
                                <template v-else>
                                    <template v-for="(hour, index) in hours_position" :key="index">
                                        <li @click.stop="selectedHour = hour; ui2.expand=null" :class="{'active-hour': selectedHour?.id == hour.id}" >{{ hour.id }}</li>
                                    </template>
                                </template>
                            </ul>
                        </template>
                        <template v-else-if="ui2.expand == 'minutes'" >
                            <div class="label-of-selection">
                                <i class="bx bx-chevron-left cp" @click.stop="ui2.expand = null" ></i>
                                <span class="labelof-section"> Select Minute</span>
                                <i class="bx bx-chevron-right hide-this"></i>
                            </div>
                            <ul class="all-minutes fade-in">                        
                                <template v-for="(minute, index) in minutes_position" :key="index">
                                    <li v-if="!minute.excluded" @click.stop="selectedMinute = minute; ui2.expand=null" :class="{'active-minute': selectedMinute?.id == minute.id}">{{ minute.id }}</li>
                                </template>
                            </ul>
                        </template>
                    </div>
                </div>
            </template>
            <template v-else-if="defaults.timePickerUi == 'classic'">
                <template v-if="defaults.timePickerButtons && !showingInRightSide">
                    <div @click.stop="onClickClose()" class="closeIcon" :class="{[indentityClasses]: showingInRightSide}"><i class='bx bx-x' ></i></div>     
                    <div @click.stop="onClickOk({fromOkButton: true})" class="okIcon" :class="{[indentityClasses]: showingInRightSide}" ><i class='bx bx-check'></i></div> 
                </template>

                <div class="clocklet clocklet--inline" data-clocklet-format="HH:mm" data-clocklet-value="14:25">
                    <div class="clocklet-plate classic">
                        <!-- Minute Picker -->
                        <div class="clocklet-dial clocklet-dial--minute">
                            <div class="clocklet-hand clocklet-hand--minute" :style="selectedMinute.deg"></div>
                            <template v-for="(minute, index) in minutes_position" :key="index">
                                <button
                                :style="minute.style"
                                class="clocklet-tick clocklet-tick--minute"
                                :class="{
                                    'excluded' : minute.excluded,
                                    'clocklet-tick--selected' : selectedMinute.value == minute.value,
                                }" 
                                type="button" 
                                :data-clocklet-tick-value="minute.id"
                                @click.stop="selectedMinute = minute"
                                draggable="falses"
                                @dragenter="selectedMinute = minute"
                                >
                                </button>                        
                            </template>                        
                        </div>

                        <!-- Hour Picker -->
                        <div class="clocklet-dial clocklet-dial--hour">
                            <div class="clocklet-hand clocklet-hand--hour" :style="selectedHour.deg"></div>
                            <template v-for="(hour, index) in (defaults.use24Format ? hours_position24 : hours_position)" :key="index">
                                <button 
                                type="button" 
                                :style="hour.style"
                                class="clocklet-tick clocklet-tick--hour"
                                :class="{
                                    'hour-24-format': defaults.use24Format,
                                    'clocklet-tick--selected' : selectedHour.value == hour.value
                                    }" 
                                @click.stop="selectedHour = hour"
                                :data-clocklet-tick-value="hour.id"
                                draggable="false"
                                @dragstart="move.dragging = true"
                                @dragenter="/*selectedHour = hour*/ false"
                                @drag="false"
                                @dragend="move.dragging = false"
                                >
                                </button>
                            </template>                   
                        </div>
                        <template v-if="!defaults.use24Format">
                            <div class="clocklet-ampm" :data-clocklet-ampm="mode" @click.stop="mode=='am' ? mode='pm' : mode='am'" data-clocklet-ampm-formatted=""></div>
                        </template>
                        <div ref="centerOfclick" class="clocklet-hand-origin"></div>
                    </div>
                </div>
                <template v-if="defaults.onlyTimePicker" >
                    <div class="display-time">
                        <span class="start-time">{{ getPrintableTime(time1_selectedHour, time1_selectedMinute, time1_mode) }}</span>
                        <template v-if="defaults.rangePicker">
                            <div>&nbsp;</div>
                            <span class="end-time">{{ getPrintableTime(time2_selectedHour, time2_selectedMinute, time2_mode) }}</span>
                        </template>
                    </div>
                </template>
            </template>
            <template v-else-if="defaults.timePickerUi == 'modern'">

                <div class="modern_timepicker" :class="[indentityClasses, defaults?.use24Format ? 'use24Format' : '']">
                    <template v-if="defaults.onlyTimePicker" >
                        <p class="header">
                            <b>
                                <template v-if="defaults?.rangePicker" >
                                    {{ getPrintableTime(time1_selectedHour, time1_selectedMinute, time1_mode) }}
                                    -
                                    {{ getPrintableTime(time2_selectedHour, time2_selectedMinute, time2_mode) }}
                                </template>
                                <template v-else>
                                    {{ getPrintableTime(time1_selectedHour, time1_selectedMinute, time1_mode) }}
                                </template>
                            </b>
                        </p>
                    </template>
                    <div class="picker_contents">
                        <select :size="moderPicker_selectSize" :value="selectedHour?.id" :value__="selectedHour?.id" class="timepicker_hour" @change="(e)=>{
                            let hour;
                            if(defaults.use24Format) hour = hours_position24.filter(i => i.id == e.target.value)?.[0];
                            else hour = hours_position.filter(i => i.id == e.target.value)?.[0];
                            selectedHour = hour;
                        }" >
                            <template v-if="defaults.use24Format">
                                <template v-for="(hour, index) in hours_position24" :key="index">                                   
                                    <option :value="hour.id" :pad2="pad2(hour.id)" :class="{selected: selectedHour.id === hour.id}" :selectedHourId="selectedHour.id" :hourId="hour.id" >{{ pad2(hour.id) }}</option>
                                </template>
                            </template>
                            <template v-else>
                                <template v-for="(hour, index) in hours_position" :key="index">
                                    <option :value="pad2(hour.id)" :pad2="pad2(hour.id)" :class="{selected: selectedHour.id === hour.id}" :selectedHourId="selectedHour.id" :hourId="hour.id">{{ hour.value }}</option>
                                </template>
                            </template>                            
                        </select>
                        <select :size="moderPicker_selectSize" :value="selectedMinute.id" class="timepicker_minute" @change="(e)=>{
                            let minute = minutes_position.filter(i => i.id == e.target.value)?.[0];
                            selectedMinute = minute;
                        }">
                            <template v-for="(minute, index) in minutes_position" :key="index">
                                <option v-if="!minute.excluded" :value="minute.id" :pad2="pad2(minute.id)" :class="{selected: selectedMinute.id === minute.id}" >{{ pad2(minute.id) }}</option>
                            </template>
                        </select>
                        <template v-if="!defaults.use24Format">
                            <select :size="moderPicker_selectSize" class="timepicker_ampm" :value="mode" :class="{'for_size_10': moderPicker_selectSize == 10, 'for_size_9': moderPicker_selectSize == 9}" @change="(e)=>{
                                mode = e.target.value
                            }" >
                                <option class="h-50-percent" value="am" pad2="AM" :class="{selected: mode === 'am'}" >AM</option>
                                <option class="h-50-percent" value="pm" pad2="PM" :class="{selected: mode === 'pm'}" >PM</option>
                            </select>
                        </template>
                    </div>
                    <template v-if="defaults.timePickerButtons && !showingInRightSide">
                        <div class="timepicker_control">
                            <button @click.stop="onClickClose()" >Close</button>
                            <button @click.stop="onClickOk({fromOkButton: true})" >Set</button>
                        </div>
                    </template>
                </div>
            </template>



            <template v-if="defaults.rangePicker && defaults.timePicker">
                <SwitcherForTime v-if="!showingInRightSide" ></SwitcherForTime>
            </template>
            <Documentation v-if="showDocumentation && !showingInRightSide" ></Documentation>
            <div v-if="defaults?.documentation && !showingInRightSide && !inDatePicker" class="documentation-toggler" @click.stop="showDocumentation = !showDocumentation" >Documentation</div>
            
        </div>
    </div>
</template>

<style scoped>
.clocklet,
.clocklet-ampm,
.clocklet-container,
.clocklet-dial,
.clocklet-hand,
.clocklet-hand-origin,
.clocklet-plate,
.clocklet-tick {
    touch-action: manipulation;
    touch-action: none;
    -webkit-user-select: none;
    -moz-user-select: none;
    -ms-user-select: none;
    user-select: none;
    -webkit-touch-callout: none;
    -webkit-tap-highlight-color: transparent;
    box-sizing: border-box;
    position: absolute;
    font-size: inherit
}

.clocklet--inline,
.clocklet-container--inline {
    position: static
}

.clocklet-container {
    display: inline;
    width: 0;
    height: 0;
    box-shadow: 0px 8px 32px rgba(0, 0, 0, .16);
}

.clocklet {
    font-size: 16px;
    height: v-bind(maxHeight);
    margin-top: 1px;
    padding: 8px;
    border-top-left-radius: v-bind(area_radius);
    border-top-right-radius: v-bind(area_radius);
}
.showingInRightSide:not(.classic) .clocklet {
    border-radius: v-bind(area_radius);
}

.clocklet:not(.clocklet--showing) {
    transition: opacity .2s ease-out
}

.clocklet:not(.clocklet--shown):not(.clocklet--inline) {
    opacity: 0;
    pointer-events: none
}

[data-clocklet-placement=bottom][data-clocklet-alignment=left] {
    transform-origin: 0 0
}

[data-clocklet-placement=bottom][data-clocklet-alignment=right] {
    transform-origin: 100% 0
}

[data-clocklet-placement=top][data-clocklet-alignment=left] {
    transform-origin: 0 100%
}

[data-clocklet-placement=top][data-clocklet-alignment=right] {
    transform-origin: 100% 100%
}

.clocklet-plate {
    position: relative;
    height: 100%;
    border-radius: 50%;
}

.clocklet-plate.classic {
    border: 1px solid v-bind(color_bg_grey);
}

.clocklet-dial {
    left: 0;
    top: 0;
    right: 0;
    bottom: 0;
    margin: auto;
    border-radius: 50%
}

.clocklet-ampm:before,
.clocklet-hand,
.clocklet-hand-origin,
.clocklet-tick {
    z-index: 1
}

.clocklet-hand {
    left: 0;
    top: 6.4%;
    right: 0;
    bottom: 50%;
    margin: auto;
    transform-origin: 50% 100%
}

.clocklet-tick {
    width: 1.75em;
    height: 1.75em;
    margin: -.875em;
    border-radius: 50%;
    padding: 0;
    outline: 0;
    border: 0;
    cursor: pointer;
    background-color: transparent;
    font-family: inherit;
    color: v-bind(color_font_dark);
    font-weight: inherit;
}
.clocklet-tick.hour-24-format {
    font-size: 15px;
}

.clocklet-tick:before {
    content: attr(data-clocklet-tick-value)
}

.clocklet-ampm {
    top: calc(50% + .75em);
    left: 0;
    right: 0;
    margin: auto;
    width: 3em;
    height: 1.5em;
    border-radius: .75em;
    cursor: pointer
}

.clocklet-ampm,
.clocklet-ampm:before {
    display: flex;
    align-items: center;
    justify-content: center
}

.clocklet-ampm:before {
    position: relative;
    width: 2em;
    height: 2em;
    border-radius: 50%;
    content: attr(data-clocklet-ampm);
    transform: translateX(-1em)
}

.clocklet--shown .clocklet-ampm:before {
    transition: transform .1s ease-out
}

.clocklet-ampm[data-clocklet-ampm=pm]:before {
    transform: translateX(1em);
    font-size: 15px;
}

.clocklet-ampm[data-clocklet-ampm-formatted]:not([data-clocklet-ampm-formatted=""]):before {
    content: attr(data-clocklet-ampm-formatted)
}

.clocklet-hand-origin {
    left: calc(50% - 5px);
    top: calc(50% - 5px);
    right: calc(50% - 5px);
    bottom: calc(50% - 5px);
    border-radius: 50%
}

.clocklet:not([data-clocklet-value]) .clocklet-hand,
.clocklet:not([data-clocklet-value]) .clocklet-hand-origin,
.clocklet[data-clocklet-value=""] .clocklet-hand,
.clocklet[data-clocklet-value=""] .clocklet-hand-origin {
    display: none
}

.clocklet-dial--hour {
    width: calc(40% + 56px);
    height: calc(40% + 56px)
}

.clocklet-hand--hour {
    width: 8px
}

.clocklet-tick--hour[data-clocklet-tick-value="0"]:not(.hour-24-format):before {
    content: "12"
}
.clocklet-tick--hour[data-clocklet-tick-value="0"].hour-24-format:before {
    content: "0"
}

.clocklet-dial--minute {
    width: 100%;
    height: 100%
}

.clocklet-hand--minute {
    width: 2px
}

.clocklet-tick--minute:not([data-clocklet-tick-value$="0"]):not([data-clocklet-tick-value$="5"]) {
    transform: scale(.6)
}

.clocklet {
    border: 1px solid v-bind(color_soft_border);
    background-color: v-bind(color_bg_grey);
}
.showingInRightSide .clocklet {
    background-color: transparent
}

[data-clocklet-placement=top] {
    box-shadow: 4px -4px 4px hsla(0, 0%, 50.2%, .5)
}

[data-clocklet-placement=bottom] {
    box-shadow: 4px 4px 4px hsla(0, 0%, 50.2%, .5)
}

.clocklet-plate {
    background-color: v-bind(color_body_bg);
}

.clocklet-hand {
    background-color: v-bind(color_transparent_1);
}

.clocklet-hand-origin {
    background-color: v-bind(color_primary_bg);
}

.clocklet-tick--selected {
    background-color: v-bind(color_primary_bg);
}

.em-theme-light .clocklet-tick--selected {
    color: v-bind(color_font_light);
}

.em-theme-dark .clocklet-tick--selected {
    color: v-bind(color_font_dark);
}

.clocklet--hoverable:not(.clocklet--dragging) .clocklet-tick:hover {
    background-color: v-bind(color_transparent_2);
}

.clocklet-ampm {
    background-color: v-bind(color_bg_grey);
}

.clocklet-ampm:before {
    background-color: v-bind(color_primary_bg);
    font-size: 15px;
}

.em-theme-light .clocklet-ampm:before {
    color: v-bind(color_font_light);
}

.em-theme-dark .clocklet-ampm:before {
    color: v-bind(color_font_dark);
}

.clocklet-ampm:hover:before {
    background-color: v-bind(color_primary_bg);
}


/* -------------------------------------------------------------------------- */
/*                             Start Modification                             */
/* -------------------------------------------------------------------------- */
.excluded{
    pointer-events: none  !important;
    visibility: hidden !important;
}
.display-time{
    width: 100%;
    padding: 6px;
    border: transparent;    
    background: v-bind(color_bg_grey);
    display: flex;
    justify-content: space-around;
    align-items: center;
}
.display-time span{
    font-size: 15px;
    color: v-bind(color_font_dark);  
}
.display-time div{
    width: 2px;
    height: 100%;
    background-color: v-bind(color_transparent_2);   
}

.pick-the-time{
    width: 100%;
    text-align: center;
    padding: 8px;
    border: transparent;
    background: v-bind(color_transparent_2);  
    color: v-bind(color_font_dark);  
    text-transform: capitalize;
}
.backIcon{
   position: absolute;
    top: 14px;
    left: 10px;
    z-index: 1;
    padding: 5px;
    cursor: pointer; 
    text-align: center;
}
.backIcon i{
    color: v-bind(color_primary_bg);
    background-color: v-bind(color_body_bg);
    border: 1px solid v-bind(color_soft_border);
    border-radius: 4px;
} 
.em-theme-dark .backIcon i{
    font-size: 26px;
    color: v-bind(color_font_dark);
}
.closeIcon,
.okIcon{
    position: absolute;
    top: 230px;
    z-index: 1;
    padding: 5px;
    cursor: pointer;    
}
.closeIcon.standard,
.okIcon.standard{
    top: 215px;   
}
.closeIcon.showingInRightSide.classic,
.okIcon.showingInRightSide.classic{
    top: 200px;
}
.closeIcon.showingInRightSide.standard,
.okIcon.showingInRightSide.standard{
    top: 198px;
}

.closeIcon i,
.okIcon i{
    font-size: 23px;
    color: v-bind(color_primary_bg); 
    border-radius: 4px;
    padding: 2px 3px;
    box-shadow:#0000001f 0 1px 3px, #0000001c 0 1px 2px;
        font-size: 23px;
    color: var(--01ac833b-color_primary_bg);
    border-radius: 4px;
    padding: 2px 3px;
    box-shadow: #0000001f 0 1px 3px, #0000001c 0 1px 2px;
}
.em-theme-light .closeIcon i,
.em-theme-light .okIcon i{
    color: v-bind(color_primary_bg);
    background-color: v-bind(color_body_bg);
}
.em-theme-dark .closeIcon i,
.em-theme-dark .okIcon i{
    color: v-bind(color_font_dark);
    background-color: v-bind(color_bg_grey);
}

.clocklet:has(.standard) {
    border: 1px solid v-bind(color_soft_border);
    background-color:  v-bind(color_body_bg);
    border-top-left-radius: 6px;
    border-top-right-radius: 6px;
}
.clocklet:has(.standard.showingInRightSide) {
    border: 1px solid transparent !important;
}

.closeIcon{
    left: 10px;
}
.okIcon{
    right: 10px;
}
.closeIcon:has(~div .clocklet-plate.standard){
    left: 30px !important;
}
.okIcon:has(~div .clocklet-plate.standard){
    right: 30px!important;
}

.clocklet-plate.standard{
    border-radius: 0 !important;
    padding: 10px !important;
    max-height: 250px;
    display: flex;
    flex-direction: column;
}

.clocklet-plate.standard.need-scroll{
    overflow-y: scroll;
}

.clocklet-plate.standard .label-of-selection{
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 15px;
}
.clocklet-plate.standard .label-of-selection .hide-this{
    opacity: 0 !important;
    pointer-events: none !important;
}
.clocklet-plate.standard .label-of-selection i{
    font-size: 20px;
    color: v-bind(color_font_dark);
}

.clocklet-plate.standard .label-of-selection .labelof-section{
    text-align: center;
    font-size: 16px;
    color: v-bind(color_font_dark);
}

.clocklet-plate.standard ul.all-hours{
    display: grid;
    grid-template-columns: repeat(3,1fr);
    gap: 16px;
    row-gap: 14px;
    list-style: none!important;
    margin: 0px;
    padding: 0;
}
.clocklet-plate.standard ul.all-hours li{
    padding: 5px;
    color: v-bind(color_font_dark);
    background-color: v-bind(color_bg_grey);
    text-align: center;
    cursor: pointer;
    border-radius: 3px;
}

.clocklet-plate.standard ul.all-minutes{
    display: grid;
    grid-template-columns: repeat(4,1fr);
    gap: 16px;
    row-gap: 14px;
    list-style: none!important;
    margin: 0px;
    padding: 0;
}
.clocklet-plate.standard ul.all-minutes li{
    padding: 5px;
    color: v-bind(color_font_dark);
    background-color: v-bind(color_bg_grey);
    text-align: center;
    cursor: pointer;
    border-radius: 3px;
}

.clocklet-plate.standard ul.all-hours li.active-hour,
.clocklet-plate.standard ul.all-minutes li.active-minute{
    color: v-bind(color_font_light);
    background-color: v-bind(color_primary_bg);
}


.clocklet-plate.standard.need-scroll::-webkit-scrollbar {
    width: 4px !important;
}
.clocklet-plate.standard.need-scroll::-webkit-scrollbar-thumb {
    background: v-bind(color_bg_grey);
}
.clocklet-plate.standard.need-scroll::-webkit-scrollbar-thumb:hover {
    background: v-bind(color_bg_grey);
}


.clocklet-plate.standard .printable-time-section {
    text-align: center;
    font-size: 16px;
    color: v-bind(color_font_dark);
}
.clocklet-plate.standard .columns {
    display: grid;
    grid-template-columns: v-bind(gird_template_repeat);
    gap: 16px;
    row-gap: 14px;
    margin-top: 24px;
}
.clocklet-plate.standard .columns.rangePicker {
    margin-top: 4px;
}

.clocklet-plate.standard .columns.showingInRightSide {
    margin-top: 0px;
}

.clocklet-plate.standard .columns .column{
    display: grid;
    text-align: center;
    row-gap: 0px;
}

.clocklet-plate.standard .columns .column div
{
    cursor: pointer;
    padding: 15px 5px;
    border: transparent;
    background-color: transparent;
    transition: all 0.3s;
}
.clocklet-plate.standard .columns .column div:first-child
{
    border-radius: 5px 5px 0px 0px;
}
.clocklet-plate.standard .columns .column div:last-child
{
    border-radius: 0px 0px 5px 5px;
}
.clocklet-plate.standard .columns .column div:first-child:hover > i
{
    transform: translateY(-2px);
    scale: 1.05;
}
.clocklet-plate.standard .columns .column div:last-child:hover > i
{
    transform: translateY(2px);
    scale: 1.05;
}
.clocklet-plate.standard .columns .column button
{
    border: v-bind(color_soft_border);
    padding: 16px;
    border-radius: 6px;
    color: v-bind(color_font_dark);
    font-weight: 500;
    font-size: 15px;
}
.em-theme-light .clocklet-plate.standard .columns .column button
{
    background-color: v-bind(color_body_bg);
    border: 1px solid v-bind(color_soft_border);
}
.em-theme-light .clocklet-plate.standard .columns .column button:hover
{
    border: 1px solid v-bind(color_soft_border);
}

.em-theme-dark .clocklet-plate.standard .columns .column button
{
    background-color: v-bind(color_bg_grey);
}
 



@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

.fade-in {
  animation: fadeIn 0.3s ease-in-out; /* Adjust the duration and timing function as needed */
}



/* -------------------------------------------------------------------------- */
/*                             Modern Time Picker                             */
/* -------------------------------------------------------------------------- */

.modern_timepicker {
    width: fit-content;
    border: 1px solid v-bind(color_soft_border);
    background-color: v-bind(color_body_bg);
    border-radius: 6px;
    width: 100%;
    padding: 6px;
}
.modern_timepicker.usingRangePicker {
    border-bottom-left-radius: 0px;
    border-bottom-right-radius: 0px;
}

.modern_timepicker .header {
    text-align: center;
    color: v-bind(color_font_dark);
    margin: 5px 0px;
    margin-top: 6px;
    margin-bottom: 7px;
    font-size: 15px;
}
.modern_timepicker .picker_contents {
    display: flex;
    justify-content: space-around;
}


.modern_timepicker .timepicker_hour,
.modern_timepicker .timepicker_minute,
.modern_timepicker .timepicker_ampm {
    scroll-behavior: smooth;
    -ms-overflow-style: none;
    scrollbar-width: none;
    border: 1px solid v-bind(color_soft_border); 
    color: v-bind(color_font_dark);
    font-weight: bold;
    background: transparent;
    padding: 3px;
    width: 33.333333%;
}
.modern_timepicker.use24Format .timepicker_hour,
.modern_timepicker.use24Format .timepicker_minute,
.modern_timepicker.use24Format .timepicker_ampm {
    width: 50%;
}


.modern_timepicker .timepicker_hour::-webkit-scrollbar,
.modern_timepicker .timepicker_minute::-webkit-scrollbar,
.modern_timepicker .timepicker_ampm::-webkit-scrollbar {
    display: none;
}

.modern_timepicker .timepicker_hour option,
.modern_timepicker .timepicker_minute option,
.modern_timepicker .timepicker_ampm option {
    font-weight: bold;
    background: v-bind(color_bg_grey);
    position: relative;
    text-align: center;
    padding: 5px 0px;
    font-size: 15px;
    cursor: pointer;
}
.modern_timepicker option.h-50-percent {
    height: 50%;
    line-height: 230px;
    display: flex;
    align-items: center;
    justify-content: center;
}

.modern_timepicker select option.selected::after {
    background-color: v-bind(color_primary_bg) !important;
    border: 1px solid v-bind(color_primary_bg);
    content: attr(pad2);
    position: absolute;
    left: 0px;
    width: calc(100% + 0px);
    height: 24px;
    color: white !important;
    z-index: 99;
    text-align: center;
    transform: translate(0px, -5px);
    line-height: 24px;
}
.modern_timepicker.usingRangePicker select option.selected::after {
    transform: translate(0px,-5px);
}
.modern_timepicker select.timepicker_ampm option.selected::after {
    width: calc(100% + 0px);
    height: 100%;
    transform: translate(0px, 0px);
    line-height: 66px;
}
.modern_timepicker select.timepicker_ampm.for_size_9 option.selected::after {
    line-height: 100px;
}
.modern_timepicker select.timepicker_ampm.for_size_10 option.selected::after {
    line-height: 112px;
}

.modern_timepicker .timepicker_control {
    text-align: end;
    margin-top: 9px;
    margin-bottom: 3px;
    padding: 0px 4px;
}

.modern_timepicker .timepicker_control button {
    padding: 3px 12px;
    border: none;
    font-weight: bold;
    background-color: v-bind(color_primary_bg);
    color: white;
    margin-left: 5px;
    border-radius: 4px;
}

.modern_timepicker .timepicker_control button:first-child {
    margin-right: 5px;
    background-color: #ff6a6a;
}


</style>