<script setup>
import { ref, inject, defineProps, computed, defineEmits } from 'vue';
const startText = 'Start';
const endText = 'End';
import { makeDate, delay, log } from './helper';

let props = defineProps(['disabled', 'displayTime'])
let emits = defineEmits(['run_timePicker_asMounted'])

let theme = inject('theme');
let defaults = inject('defaults');
let picker = inject('picker');
let pickerValues = inject('pickerValues');
let FORMATS = inject('FORMATS');
let selectingStartDate = inject('selectingStartDate');

function handleClick(value){
    if(value == 'from_right'){
        selectingStartDate.value = false;
    } else {
        selectingStartDate.value = true;
    }
}

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

let timesRightSideOfLable = computed(()=> {
    if(defaults.timePicker && props.displayTime){
        return ({
            t1: makeDate(pickerValues.startTime, FORMATS.time),
            t2: makeDate(pickerValues.endTime, FORMATS.time),
        });
    } else {
        return ({t1: '', t2: ''});
    }
})
let timesRightSideOfDate = computed(()=> {
    if(defaults.timePicker && !props.displayTime){
        return ({
            t1: makeDate(pickerValues.startTime, FORMATS.time),
            t2: makeDate(pickerValues.endTime, FORMATS.time),
        });
    } else {
        return ({t1: '', t2: ''});
    }
})

function resetDate1Time1(){
    picker.date1 = '';    
    picker.time1 = {
        "hour": 0,
        "minute": 0,
        "mode": "am",
        "time": "12:00 AM"
    }
    emits('run_timePicker_asMounted', '1');
    delay(() => pickerValues.startTime = '', 20);
    
}
function resetDate2Time2(){
    picker.date2 = '';    
    picker.time2 = {
        "hour": 0,
        "minute": 0,
        "mode": "am",
        "time": "12:00 AM"
    }
    emits('run_timePicker_asMounted', '2');
    delay(() => pickerValues.endTime = '', 20);
}


</script>

<template>
    <div class="switches-root-container">
        <div class="switches-container">
            <label for="switchStartDate" @click.stop="disabled ? false : handleClick('from_left')" >
                <div class="lbl">{{ startText }} <span class="just-time" >{{ timesRightSideOfLable.t1 }}</span>  </div>
                <div class="selecteddate" >{{ makeDate(picker.date1, FORMATS.default) }} {{ timesRightSideOfDate.t1 }} </div>
            </label>
            <label for="switchEndDate" @click.stop="disabled ? false : handleClick('from_right')" >
                <div class="lbl">{{ endText }} <span class="just-time" >{{ timesRightSideOfLable.t2 }}</span> </div>
                <div class="selecteddate" >{{ makeDate(picker.date2, FORMATS.default) }} {{ timesRightSideOfDate.t2 }} </div>
            </label>
            <div class="switch-wrapper" :class="{[`theme-${theme}`]: true, [selectingStartDate ? 'selecting-start' : 'selecting-end']: true}">
                <div class="switch">
                    <div class="bound" :style="`opacity:1; display:${selectingStartDate ? 'block' : 'none'};`" >
                        <div class="lbl">{{ startText }} <span class="just-time" >{{ timesRightSideOfLable.t1 }}</span>  </div>
                        <div class="selecteddate" >{{ makeDate(picker.date1, FORMATS.default) }} {{ timesRightSideOfDate.t1 }}  </div>
                        <i class="bx bx-x clearDate" @click.stop="resetDate1Time1" ></i>

                    </div>
                    <div class="bound" :style="`opacity:1; display:${!selectingStartDate ? 'block' : 'none'};`" >
                        <div class="lbl">{{ endText }} <span class="just-time" >{{ timesRightSideOfLable.t2 }}</span> </div>
                        <div class="selecteddate" >{{ makeDate(picker.date2, FORMATS.default) }} {{ timesRightSideOfDate.t2 }}  </div>
                        <i class="bx bx-x clearDate" @click.stop="resetDate2Time2" ></i>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<style scoped>
/* a container - decorative, not required */
.switches-root-container {
    display: flex;
    justify-content: center;
}

/* container for all of the switch elements 
    - adjust "width" to fit the content accordingly 
*/
.switches-container {
    width: 100%;
    display: flex;
    line-height: 1rem;
    border-radius: 0;
    margin-left: auto;
    margin-right: auto;
    background-color: v-bind(color_soft_border);
    position: relative;
    height: 54px;
    border-radius: 6px;
    overflow: hidden;
}

.switches-container label {
    width: 50%;
    padding: 7px;
    margin: 0;
    color: v-bind(color_font_dark);
    text-align: left;
    line-height: 20px;
    cursor: pointer;
}


/* switch highlighters wrapper (sliding left / right) 
    - need wrapper to enable the even margins around the highlight box
*/
.switch-wrapper {
    position: absolute;
    top: 0;
    bottom: 0;
    width: 50%;
    padding: 0;
    z-index: 0;
    transition: transform .3s cubic-bezier(.77, 0, .175, 1);
    font-size: 14px;
}

.switch {
    border-radius: 0px;
    background: v-bind(color_primary_bg);
    margin: 4px;
    height: calc(100% - 8px);
    border-radius: 6px;
}
 
.switch .bound {
    width: 100%;
    display: block;
    will-change: opacity;
    position: absolute;
    transition: opacity .2s cubic-bezier(.77,0,.175,1) .125s;
    top: 10px;
    left: 10px;
    opacity: 1;
}

.switch .bound .lbl,
.switch .bound .selecteddate,
.switch .bound i.clearDate {
    font-weight: 600;
    /* color: v-bind(color_font_dark); */
    color: rgb(243, 243, 243);
}

.switch .bound i.clearDate {
    position: absolute; 
    top: 10px;
    right: 20px;
    border: 1px solid;
    border-radius: 50%;
    font-weight: 800;
    background-color: v-bind(color_transparent_2);
    cursor: pointer;
    opacity: 0;
    transition: all 0.2s;
    font-size: 13px;
}
.switch:hover .bound i.clearDate {
    opacity: 1;
}


.switches-container .switch-wrapper.selecting-start {
    cursor: pointer;
    transform: translateX(0%);
}

.switches-container .switch-wrapper.selecting-end {
    cursor: pointer;
    transform: translateX(100%);
}

span.just-time{
    font-size: 13px;
    margin-left: 3px;
}

</style>