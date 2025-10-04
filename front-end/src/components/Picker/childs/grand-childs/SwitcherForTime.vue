<script setup>
import { ref, defineProps, inject } from 'vue';
let { forDate } = defineProps({
    forDate: {
        default: true, 
        required: false,
    },
});

const startText = 'Start Time';
const endText ='End Time';

let theme = inject('theme');
let defaults = inject('defaults');
let picker = inject('picker');
let selectingStartTime = inject('selectingStartTime');

function handleClick(value){
    if(value == 'left'){   
        selectingStartTime.value = true;
    }
    if(value == 'right'){
        selectingStartTime.value = false;
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

</script>

<template>
    <div class="switches-container">
        <input type="radio" name="switchPlan" value="left" :checked="selectingStartTime" />
        <input type="radio" name="switchPlan" value="right" :checked="!selectingStartTime" />
        <label for="startTime" @click.stop="handleClick('left')">{{ startText }}</label>
        <label for="EndTime" @click.stop="handleClick('right')">{{ endText }}</label>
        <div class="switch-wrapper" :class="{[`theme-${theme}`]: true}">
            <div class="switch" :class="{right: selectingStartTime===false}">
                <div>{{ startText }}</div>
                <div>{{ endText }}</div>
            </div>
        </div>
    </div>
</template>

<style scoped>
/* a container - decorative, not required */
.container {
    border: transparent;
    width: 100%;
    padding: 0px;
    margin-left: auto;
    margin-right: auto;
    background-color: v-bind(color_bg_grey);
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
    background-color: v-bind(color_body_bg);
    position: relative;
    border-bottom-left-radius: 6px;
    border-bottom-right-radius: 6px;
    overflow: hidden;
    border-bottom: 1px solid v-bind(color_soft_border); 
    border-left: 1px solid v-bind(color_soft_border); 
    border-right: 1px solid v-bind(color_soft_border); 
}

/* input (radio) for toggling. hidden - use labels for clicking on */
.switches-container input {
    visibility: hidden;
    position: absolute;
    top: 0;
}

/* labels for the input (radio) boxes - something to click on */
.switches-container label {
    width: 50%;
    padding: 7px;
    margin: 0;
    text-align: center;
    cursor: pointer;
    color: v-bind(color_font_dark);
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
    height: 100%;
}

.switch div {
    width: 100%;
    opacity: 0;
    display: block;
    position: absolute;
    text-align: center;
    will-change: opacity;
    transition: opacity .2s cubic-bezier(.77,0,.175,1) .125s;
    top: 8px;
    left: 0;
}

.switches-container input:nth-of-type(1):checked~.switch-wrapper {
    transform: translateX(0%);
}

.switches-container input:nth-of-type(2):checked~.switch-wrapper {
    transform: translateX(100%);
}


.switches-container input:nth-of-type(1)~.switch-wrapper.theme-light .switch div:nth-of-type(1) {
    opacity: 1;
    color: v-bind(color_font_light);
}
.switches-container input:nth-of-type(1)~.switch-wrapper.theme-dark .switch div:nth-of-type(1) {
    opacity: 1;
    color: v-bind(color_font_dark);
}

.switches-container input:nth-of-type(1)~.switch-wrapper .switch div:nth-of-type(2) {
    opacity: 0;
}

.switches-container input:nth-of-type(2):checked~.switch-wrapper.theme-light .switch div:nth-of-type(2) {
    opacity: 1;
    color: v-bind(color_font_light);
}
.switches-container input:nth-of-type(2):checked~.switch-wrapper.theme-dark .switch div:nth-of-type(2) {
    opacity: 1;
    color: v-bind(color_font_dark);
}
.switches-container input:nth-of-type(2):checked~.switch-wrapper .switch div:nth-of-type(1) {
    opacity: 0;
}
</style>