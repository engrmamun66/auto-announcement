<script setup>
import { ref, computed, reactive, defineProps, onMounted, inject, defineEmits } from 'vue';
let { x, defaults, applyBtn } = defineProps({
    defaults: { 
        required: false,
        default: {},
    },
    applyBtn: { 
        required: false,
        default: true,        
    },
    x: { 
        required: false,
        default: -1,        
    },
});

const theme = inject('theme');
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



let emits = defineEmits(['onCancel', 'onApply', 'onToday']);
function handleClick(from=''){
    if(from == 'today'){
        emits('onToday');
    }
    if(from == 'cancel'){
        emits('onCancel');
    }
    if(from == 'apply'){
        emits('onApply');
    }
}
let openTimePicker = inject('openTimePicker');
const windowInnerWidth_more_than_590 = inject('windowInnerWidth_more_than_590');

const hide_button_by_condition = computed(() => {
    if(defaults.calendarQuantity > 1 && x < defaults.calendarQuantity){
        return 'opacity:0;pointer-events:none';
    }
})


</script>

<template>
    <template v-if="defaults.buttons || defaults.timePicker">
        <template v-if="defaults.buttons?.todayBtn && (defaults.buttons?.cancelBtn || defaults.buttons?.applyBtn)">
            <div class="flex-between" :style="hide_button_by_condition">
                <div class="buttons">
                    <button class="btn-today" @click.stop="handleClick('today')">{{ defaults.buttons?.todayBtn }}</button>
                    <button v-if="(!windowInnerWidth_more_than_590 || !defaults?.allowRightSideTimePicker) && defaults.timePicker" class="pick-time" :class="{[`theme-${theme}`]: true}" @click.stop="openTimePicker=true">
                        <!-- <i class='bx bx-time'></i> -->
                        Time</button>
                </div>
                 <div class="buttons">
                    <button v-if="defaults.buttons?.cancelBtn" class="btn-cancel" @click.stop="handleClick('cancel')">{{ defaults.buttons?.applyBtn ? defaults.buttons?.cancelBtn : 'Close' }}</button>
                    <button v-if="defaults.buttons?.applyBtn && applyBtn" class="btn-apply" :class="{[`theme-${theme}`]: true}" @click.stop="handleClick('apply')">{{ defaults.buttons?.applyBtn }}</button>
                </div>
            </div>           
        </template>
        <template v-else>
            <div class="buttons" :style="hide_button_by_condition">
                <button v-if="(!windowInnerWidth_more_than_590 || !defaults?.allowRightSideTimePicker) && defaults.timePicker" class="pick-time" :class="{[`theme-${theme}`]: true}" @click.stop="openTimePicker=true">
                    <!-- <i class='bx bx-time'></i>  -->
                    Time</button>
                <button v-if="defaults.buttons?.cancelBtn" class="btn-cancel" @click.stop="handleClick('cancel')">{{ defaults.buttons?.applyBtn ? defaults.buttons?.cancelBtn : 'Close' }}</button>
                <button v-if="defaults.buttons?.applyBtn && applyBtn" class="btn-apply" :class="{[`theme-${theme}`]: true}" @click.stop="handleClick('apply')">{{ defaults.buttons?.applyBtn }}</button>
            </div>
        </template>
    </template>
</template>

<style scoped>
.flex-between{
    display: flex;
    justify-content: space-between;
}
.buttons{
    display: flex;
    justify-content: end;
}
.btn-today, .btn-cancel, .btn-apply, .pick-time{
    padding: 6px 10px;
    border:none;
    text-align: center;
    border-radius: 3px;
}
.btn-today,
.btn-cancel{
    color: v-bind(color_font_dark);
    background-color: v-bind(color_bg_grey);
}
.pick-time{
    background-color: v-bind(color_primary_bg);
}
.pick-time i{
    font-size: 18px;
    transform: translateY(2px);
}

button:has(~button){
    margin-right: 6px;
}

.btn-apply
{
    background-color: v-bind(color_primary_bg);
}
.btn-apply.theme-light,
.pick-time.theme-light
{
    color: v-bind(color_font_light);
}
.btn-apply.theme-dark,
.pick-time.theme-dark
{
    color: v-bind(color_font_dark);
}

.btn-today,
.btn-cancel,
.btn-apply,
.pick-time{
    font-size: 15px;
}
.pick-time{
    margin-right: 5px;
}
</style>