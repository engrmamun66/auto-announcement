<script setup>
import {moment} from './childs/grand-childs/helper.js';
import { Emitter } from './childs/EventEmitter.js';
import DateTimePicker from './childs/DateTimePicker.vue';
import Modal from './childs/grand-childs/Modal.vue';
import { clone, makeDate, formatDate, isInMinMaxDate, parseMinMaxDate, withDate } from './childs/grand-childs/helper';
import { h, ref, provide, reactive, defineProps, onMounted, useAttrs, computed, defineExpose, watch, onBeforeUnmount } from 'vue';
globalThis.makeDate = makeDate;
globalThis.formatDate = formatDate;
globalThis.clone = clone;

const FORMATS = reactive({
  date: 'YYYY-MM-DD', //YYYY-MM-DD HH:mm:ss
  output: 'YYYY-MM-DD', //YYYY-MM-DD HH:mm:ss
  week_index: 'd', // 0 to 6
  day_index: 'D', // 1 to 31
  weekday_short: 'ddd', // Sat, Sun ...
  forDisplay: 'DD MMM, YYYY',
  forHeading: 'MMMM YYYY',
  year: 'YYYY',
  month: 'MMMM',
  monthShort: 'MMM',
  time: 'hh:mm A',
  time24: 'HH:mm',
  default: 'MM/DD/YYYY',
});

provide('FORMATS', FORMATS);


let emits = defineEmits([ 'update:modelValue', 'init', 'open', 'cancel', 'close', 'hide', 'change', 'changeTime', 'nextPrevious']);
let props = defineProps({
    modelValue: {
        type: [Object, String],
        required: false,
        default: {
            /**
              startDate: new Date(),
              endDate: new Date(),            
              startTime: '09:30 AM',
              endTime: '10:30 AM',
             */
        },
    },
    disabled: {
        required: false,
        default: false,
    },
    showValueIf: {
        required: false,
        default: true,
    },
    options: {
        type: [Object],
        required: false,
        default: {},
    },
    placeholder: {
        type: String,
        required: false,
        default: '',
    },
    availableInDates: {
        type: [Array, Object],
        required: false,
        default: null,
        /**
         --- availabiblity data structure: 1---
        let availableInDates = [
            {
                "date": "2024-02-1T00:00:00",
                "available": 45489,
                "highlight": "red", // red | green | yellow
            },
            {
                "date": "2024-02-3T01:00:00",
                "available": 45489,
                "highlight": "red"  // red | green | yellow
            },
        ]
        ---- or --
        --- availabiblity data structure: 2---
        let availableInDates = {
            aiasesKey: {
                available: 'tota_available_in_store',
                date: 'date'
            },
            data: [...itemObjects]
        }
        */
    },
});

withDate.updateLocale({
    lang: 'en',
    adjustWeekday: props?.options?.local?.adjustWeekday || 0,
})


FORMATS.forDisplay = props?.options?.onlyTimePicker ? FORMATS.time : ( props?.options?.displayFormat ?? FORMATS.forDisplay );
FORMATS.time = props?.options?.timeFormat ?? (props?.options?.use24Format ? 'HH:mm' : 'hh:mm A');
if(!props?.options?.onlyTimePicker && /\s?hh:.*/ig.exec(FORMATS.forDisplay)){
    FORMATS.forDisplay = FORMATS.forDisplay.replace(/\s?hh:.*/ig, ''); // removing time format if exist
    console.warn('Time format automatic removed. "displayFormat" is only for date format. Time will add automatically if using timepicker');
}

let isUsingRandomSelection = props.options?.useRandomSelection && !props?.rangePicker && !props?.onlyTimePicker;

provide('isUsingRandomSelection', isUsingRandomSelection);

let availableInDates_list = ref(props.availableInDates);
provide('availableInDates_list', availableInDates_list);




let showPicker = ref(false);
let isShowInitilaztionValue = ref(true);
let isMounted = ref(false);
const picker = reactive({
    // with Single Date
    date: makeDate(props.modelValue?.startDate || new Date(), FORMATS.date),
    date1: makeDate(props.modelValue?.startDate || new Date(), FORMATS.date),
    date2: makeDate(props.modelValue?.endDate || props.modelValue?.startDate || new Date(), FORMATS.date),
    time1: {
        time: '',
        hour: 0,
        minute: 0,
        mode: 'am',
    },
    time2: {
        time: '',
        hour: 0,
        minute: 0,
        mode: 'am',
    },
})
const pickerValues = reactive({
    startDate: '',
    endDate: '',
    startTime: '',
    endTime: '',
    dates: [], // for >>> options.useRandomSelection
});


watch(picker, (newVal, oldVal) => {
    setTimeout(() => {
        // console.log({picker});
    }, 0);
})

watch(pickerValues, (newVal, oldVal) => {
    setTimeout(() => {
        // console.log({pickerValues, newVal, oldVal});
    }, 0);
})

let clonedOptions = { ...clone(props.options || {}), ...clone(useAttrs()), displayFormat: FORMATS.forDisplay };
let target = ref(null);
let theme = (clonedOptions?.theme && clonedOptions?.theme=='dark') ? clonedOptions?.theme : 'light';


pickerValues.startDate = parseMinMaxDate(clonedOptions?.minDate) || makeDate(props.modelValue?.startDate, FORMATS.date);
pickerValues.endDate = parseMinMaxDate(clonedOptions?.maxDate) || parseMinMaxDate(clonedOptions?.minDate) || makeDate(props.modelValue?.endDate, FORMATS.date);
pickerValues.startTime = makeDate(props.modelValue?.startTime, FORMATS.time);
pickerValues.endTime = makeDate(props.modelValue?.endTime, FORMATS.time);
pickerValues.dates = (props.modelValue?.dates && props.modelValue?.dates?.length) ? props.modelValue?.dates?.map(date => makeDate(date, FORMATS.date)) : [];


function monthDiff(date1, date2) {
  const d1 = moment(date1);
  const d2 = moment(date2);
  const months = d1.diff(d2, 'months', true);  // The true flag enables floating point precision
  return Math.abs(Math.round(months));  // Round to the nearest whole number
}

provide('theme', theme);
provide('picker', picker);
provide('target', target);
provide('Emitter', Emitter);
provide('isMounted', isMounted);
provide('pickerValues', pickerValues);
provide('modelValue', props.modelValue);
provide('options', clonedOptions);
provide('monthDiff', monthDiff);





function hidePicker(event=null) {
    if(event) event.stopPropagation();  
    if(!clonedOptions?.sticky){
        showPicker.value = false;
        emits('hide', null);
    }
}

function closePicker(emites_key, data=null) {
    if(!clonedOptions?.sticky){
        showPicker.value = false;
        emits(emites_key, data)
    }
}

function updateModalValue(data){
    emits('update:modelValue', data);
}
function onInitialize(){
    isShowInitilaztionValue.value = false;

    if(clonedOptions?.autoSetValuFirstTime){
        setTargetValue_and_updateModelValue();
    } else {
        
        if(isTextTypeModelValue()){
            if(props.modelValue) setTargetValue_and_updateModelValue();
        } else {
            let has_date = props.modelValue?.startDate || props.modelValue?.endDate;
            let has_time = props.modelValue?.startTime || props.modelValue?.endTime;
            let has_dates_array = props.modelValue?.dates;
            if(props.modelValue){
                if((clonedOptions?.timePicker || clonedOptions?.onlyTimePicker) && has_time){
                    setTargetValue_and_updateModelValue();        
                }
                else if(has_date || has_dates_array){
                    setTargetValue_and_updateModelValue();        
                }    
            }
        }   
    }   
    
}
function nextPrevious(data) {
    emits('nextPrevious', data);
}
function onCancel(data=null) {
    closePicker('cancel', setTargetValue_and_updateModelValue({allowUpdateModelValue: false}));
}
function onClose(data=null) {
    closePicker('close', setTargetValue_and_updateModelValue({allowUpdateModelValue: false}));
}
function onChange(data) {
    emits('change', setTargetValue_and_updateModelValue());
}
function onChangeTime(data) {
    emits('changeTime', setTargetValue_and_updateModelValue());    
}

function isHexColor(color){
    if(!color) return false;
    if(!(typeof color == 'string')) return false;
    return /^([#0-9a-fA-F]){7}$/g.test(color);
}
provide('isHexColor', isHexColor);

const displayPositions = [ 
    'modal', 

    'top_left', 
    'top_right', 
    'top_center',

    'bottom_left', 
    'bottom_right',     
    'bottom_center', 

    'left_top', 
    'left_bottom', 
    'left_center', 

    'right_top', 
    'right_bottom', 
    'right_center', 
    
    'inline', 
    'inline_left', 
    'inline_right', 
    'inline_center',

    'center', 
];
provide('displayPositions', displayPositions);

const get_position = computed(() => {
    return(clonedOptions?.displayIn && displayPositions.includes(clonedOptions?.displayIn ?? 'modal')) ? clonedOptions?.displayIn : 'modal';
});

let input_value = ref(null);
provide('input_value', input_value);

let displayDiv = ref(null);

let divStyles = ref({
    borderRadius: '6px',
    transition: 'all 0.2s',
    position: (clonedOptions?.displayIn == 'inline') ? 'relative' : 'fixed',
    [(clonedOptions?.displayIn == 'inline') ? '' : 'zIndex']: '2147483647', // this is maximum zIndex
})
let pickerInterval = null;
watch(showPicker, (newVal, oldVal) => {   
    setDivStyles();
    clearInterval(pickerInterval);
})
watch(input_value, (newVal, oldVal) => {  
    setDivStyles();
})

onBeforeUnmount(()=>{
    clearInterval(pickerInterval);
})

let timeout = null
function setDivStyles(e=null){
    if(!showPicker.value) return;

    clearTimeout(timeout);


    timeout = setTimeout(() => {
        let displayIn = (clonedOptions?.displayIn && displayPositions.includes(clonedOptions?.displayIn ?? 'modal')) ? clonedOptions?.displayIn : 'modal';
        const style = {};
        if(displayIn == 'modal') return style;
        let input = target.value;
        let wrapper = displayDiv.value; 

        let adjustX = clonedOptions?.adjustX || 0;
        let adjustY = clonedOptions?.adjustY || 0;

        if(input && wrapper){
            let bodyBound = document.body.getBoundingClientRect();
            let inputBound = input.getBoundingClientRect();
            let pickerArea = wrapper.querySelector('.main-content-of-picker');
            if(pickerArea){
                let pickerBound = pickerArea.getBoundingClientRect();
    
                wrapper.style.removeProperty('top');
                wrapper.style.removeProperty('bottom');
                wrapper.style.removeProperty('left');
                wrapper.style.removeProperty('right');
                wrapper.style.opacity = '1';
                wrapper.style.transform = 'translateY(0px)';
                
                if(displayIn.startsWith('inline')){
                    divStyles.value.transition = 'none !important';
                    wrapper.style.removeProperty('boxShadow');
                    wrapper.classList.remove('openingAnimation');
                    return;
                } else {

                    if(displayIn.startsWith('top_')){
                        wrapper.style.boxShadow = `rgb(0 0 0 / 33%) 0px -5px 10px 1px`;
                    } else {
                        wrapper.style.boxShadow = `rgb(0 0 0 / 33%) 0px 5px 10px 1px`;
                    }
                }
    
                if(bodyBound.width > 450){
                    if(displayIn === 'bottom_left'){
                        wrapper.style.top = Math.floor((inputBound.bottom + adjustY)) + 'px';
                        wrapper.style.left = Math.floor(inputBound.left + adjustX) + 'px';
                    }
                    else if( displayIn === 'bottom_right' ){
                        wrapper.style.top = Math.floor(inputBound.bottom + adjustY) + 'px';
                        wrapper.style.right = Math.floor((bodyBound.right - inputBound.right) + adjustX) + 'px';
                    }
                    else if( displayIn === 'bottom_center' ){
                        wrapper.style.top = Math.floor(inputBound.bottom + adjustY) + 'px';
    
                        if(pickerBound.width > inputBound.width){
                            let extraLeft = Math.abs((pickerBound.width - inputBound.width) / 2);
                            wrapper.style.left = Math.floor((inputBound.left - extraLeft) + adjustX)+ 'px';
                        } else {
                            let extraLeft = Math.abs((inputBound.width - pickerBound.width) / 2);
                            wrapper.style.left = Math.floor((inputBound.left + extraLeft) + adjustX)+ 'px';
                        }
                    }
                    else if( displayIn === 'top_left' ){
                        wrapper.style.top = Math.floor((inputBound.top + adjustY) - pickerBound.height) + 'px';
                        wrapper.style.left = Math.floor(inputBound.left + adjustX) + 'px';
                    }
                    else if( displayIn === 'top_right' ){
                        wrapper.style.top = Math.floor((inputBound.top + adjustY) - pickerBound.height) + 'px';
                        wrapper.style.right = Math.floor((bodyBound.right - inputBound.right) + adjustX) + 'px';
                    }
                    else if( displayIn === 'top_center' ){
                        wrapper.style.top = Math.floor((inputBound.top + adjustY) - pickerBound.height) + 'px';
    
                        if(pickerBound.width > inputBound.width){
                            let extraLeft = Math.abs((pickerBound.width - inputBound.width) / 2);
                            wrapper.style.left = Math.floor((inputBound.left - extraLeft) + adjustX)+ 'px';
                        } else {
                            let extraLeft = Math.abs((inputBound.width - pickerBound.width) / 2);
                            wrapper.style.left = Math.floor((inputBound.left + extraLeft) + adjustX)+ 'px';
                        }
                    }
                    else if( displayIn === 'left_top' ){
                        wrapper.style.left = Math.floor((inputBound.left - pickerBound.width) + adjustX) + 'px';
                        wrapper.style.top = Math.floor((inputBound.top - pickerBound.height) + adjustY) + 'px';
                    }
                    else if( displayIn === 'left_bottom' ){
                        wrapper.style.left = Math.floor((inputBound.left - pickerBound.width) + adjustX) + 'px';
                        wrapper.style.top = Math.floor((inputBound.bottom) + adjustY) + 'px';
                    }
                    else if( displayIn === 'left_center' ){
                        wrapper.style.left = Math.floor((inputBound.left - pickerBound.width) + adjustX) + 'px';
                        let half = Math.abs((pickerBound.height - inputBound.height) / 2)
                        wrapper.style.top = Math.floor(( inputBound.top - half) + adjustY) + 'px';
                    }
                    else if( displayIn === 'right_top' ){
                        wrapper.style.left = Math.floor((inputBound.right) + adjustX) + 'px';
                        wrapper.style.top = Math.floor((inputBound.top - pickerBound.height) + adjustY) + 'px';
                    }
                    else if( displayIn === 'right_bottom' ){
                        wrapper.style.left = Math.floor((inputBound.right) + adjustX) + 'px';
                        wrapper.style.top = Math.floor((inputBound.bottom) + adjustY) + 'px';
                    }
                    else if( displayIn === 'right_center' ){
                        wrapper.style.left = Math.floor((inputBound.right) + adjustX) + 'px';
                        let half = Math.abs((pickerBound.height - inputBound.height) / 2)
                        wrapper.style.top = Math.floor(( inputBound.top - half) + adjustY) + 'px';
                    }
                    else if( displayIn === 'center' ){
                        if(inputBound.width > pickerBound.width){
                            let addLeft = (inputBound.width - pickerBound.width) / 2;
                            let addTop = (pickerBound.height - inputBound.height) / 2;
                            wrapper.style.left = Math.floor(inputBound.left + addLeft + adjustX) + 'px';
                            wrapper.style.top = Math.floor((inputBound.top - addTop) + adjustY) + 'px';
                        }
                        else if(inputBound.width < pickerBound.width){
                            let addLeft = (pickerBound.width - inputBound.width) / 2;
                            let addTop = (pickerBound.height - inputBound.height) / 2;
                            wrapper.style.left = Math.floor((inputBound.left - addLeft )+ adjustX) + 'px';
                            wrapper.style.top = Math.floor((inputBound.top - addTop) + adjustY) + 'px';
                        }
                    }
                    else if(displayIn === 'inline_left'){
                        input.style.marginBottom = Math.floor( pickerBound.height - inputBound.height ) + 'px';
                        wrapper.style.top = Math.floor((inputBound.top + adjustY)) + 'px';
                        wrapper.style.left = Math.floor(inputBound.left + adjustX) + 'px';
                    }
                    else if( displayIn === 'inline_right' ){
                        input.style.marginBottom = Math.floor( pickerBound.height - inputBound.height ) + 'px';
                        wrapper.style.top = Math.floor(inputBound.top + adjustY) + 'px';
                        wrapper.style.right = Math.floor((bodyBound.right - inputBound.right) + adjustX) + 'px';
                    }
                    else if( displayIn === 'inline_center' ){
                        input.style.marginBottom = Math.floor( pickerBound.height - inputBound.height ) + 'px';
                        wrapper.style.top = Math.floor(inputBound.top + adjustY) + 'px';
    
                        if(pickerBound.width > inputBound.width){
                            let extraLeft = Math.abs((pickerBound.width - inputBound.width) / 2);
                            wrapper.style.left = Math.floor((inputBound.left - extraLeft) + adjustX)+ 'px';
                        } else {
                            let extraLeft = Math.abs((inputBound.width - pickerBound.width) / 2);
                            wrapper.style.left = Math.floor((inputBound.left + extraLeft) + adjustX)+ 'px';
                        }
                    }

                } else {
    
                    // For mobild view
                    let afterMinusHeight = window.innerHeight - pickerBound.height;
                    let topPosition = Math.abs((afterMinusHeight) / 2);   
    
                    let bodyWidth = bodyBound.width
                    let afterMinusWidth = bodyWidth - pickerBound.width;
                    let leftPosition = Math.abs((afterMinusWidth) / 2);                
                   
                    wrapper.style.top = Math.floor(topPosition) + 'px';
                    wrapper.style.left = Math.floor(leftPosition)+ 'px';
                }
    
    
    
    
                // if(H.isOverFlowingInRightSide(pickerBound, bodyBound, inputBound)){
                //     wrapper.style.removeProperty('left');
                //     wrapper.style.right = (bodyBound.right - inputBound.right) + 'px';
                // }
    
                globalThis.test = {
                    pickerBound ,
                    bodyBound ,
                    inputBound ,
                }

            }

        } 
    }, 0);
}

function hidePickerWithESC(e){
    if(e.code === 'Escape'){
        hidePicker()
    }    
}

function isTextTypeModelValue(){
    return ((!props.modelValue 
    || (typeof props.modelValue === 'string') 
    || (typeof props.modelValue === 'undefined') 
    || (props.modelValue instanceof Date) 
    || (props.modelValue instanceof moment) 
    ) ? true : false);
}

let modalValueIntialized = ref(false);

function initializeFromModelValue(){

    if(isTextTypeModelValue()){        
        
        let modelValue = !props.modelValue ? '' : props.modelValue;
        if((modelValue instanceof Date)){
            modelValue = makeDate(modelValue, `${FORMATS.date} ${FORMATS.time}`);
        } else if (modelValue instanceof moment){
            modelValue = makeDate(moment(modelValue), `${FORMATS.date} ${FORMATS.time}`);
        }

        let parts = modelValue.split(' - ');    
       
        let startDate = makeDate( parts?.[0] || new Date(), FORMATS.date );
        let endDate = makeDate( parts?.[1] || parts?.[0], FORMATS.date );

        if(moment(new Date(startDate)).isValid() && moment(new Date(endDate)).isValid()){

            let startTimeObj = makeDate( parts?.[0] || new Date(), FORMATS.time, {all: true} );
            let endTimeObj = makeDate( parts?.[1] || parts?.[0] || new Date(), FORMATS.time, {all: true} );    
          
            picker.time1 = {
                time: startTimeObj.formatted,
                hour: startTimeObj.hour,
                minute: startTimeObj.minute,
                mode: startTimeObj.mode,
            }; 
            picker.time2 = {
                time: endTimeObj.formatted,
                hour: endTimeObj.hour,
                minute: endTimeObj.minute,
                mode: endTimeObj.mode,
            }; 
    
            picker.date = picker.date1 = pickerValues.startDate = startDate;
            picker.date2 = pickerValues.endDate = endDate;
    
            pickerValues.startTime = startTimeObj.formatted;
            pickerValues.endTime = endTimeObj.formatted;

            if(!props.modelValue) emits('update:modelValue', "");  
    
        } else {
            // console.warn('modelValue is wrong!');
        }   


    } else {

        let startDate = makeDate(props.modelValue?.startDate || new Date(), FORMATS.date); 
        let endDate = makeDate(props.modelValue?.endDate || startDate, FORMATS.date); 

        if(isUsingRandomSelection){
            let dates = (props?.modelValue?.dates || []).map(date => {
                if(moment(new Date(date)).isValid()){
                    date = moment(date).format(FORMATS.date);
                    if(!isInMinMaxDate(date, clonedOptions)){
                        date = null;
                    }
                } else {
                    date = null;
                }
                return date;
            }).filter(Boolean);
    
            if(dates?.length){
                pickerValues.startDate 
                = pickerValues.endDate 
                = picker.date 
                = picker.date1
                = picker.date2
                = dates[0] || startDate;
            }

        } else {
            
            let startTimeObj = makeDate(props.modelValue?.startTime || '12:00 AM', FORMATS.time, {all: true});
            let endTimeObj = makeDate(props.modelValue?.endTime || '12:00 AM', FORMATS.time, {all: true});

            pickerValues.startDate = picker.date = picker.date1 =  startDate;
            pickerValues.endDate = picker.date2 =  endDate;

            pickerValues.startTime = picker.time1.time = startTimeObj.formatted;
            pickerValues.endTime = picker.time2.time = endTimeObj.formatted;

            picker.time1.time = startTimeObj.formatted;
            picker.time1.hour = startTimeObj.hour;
            picker.time1.minute = startTimeObj.minute;
            picker.time1.mode = startTimeObj.mode;

            picker.time2.time = endTimeObj.formatted;
            picker.time2.hour = endTimeObj.hour;
            picker.time2.minute = endTimeObj.minute;
            picker.time2.mode = endTimeObj.mode;           
        }
    }
    modalValueIntialized.value = true;
    /* --------------------------- End With ModalValue -------------------------- */
}



onMounted(() => {  
    
    initializeFromModelValue();

    document.removeEventListener('click', hidePicker);
    document.addEventListener('click', hidePicker);
    document.removeEventListener('keyup', hidePickerWithESC);
    document.addEventListener('keyup', hidePickerWithESC);
    if(clonedOptions?.autoOpen){
        setTimeout(() => {
            if(target.value){
                target.value.click();
            }
        }, 10);
    }
    window.removeEventListener('resize', setDivStyles);
    window.addEventListener('resize', setDivStyles); 

    window.removeEventListener('mousemove', setDivStyles);
    window.addEventListener('mousemove', setDivStyles); 

    window.removeEventListener('scroll', setDivStyles);
    window.addEventListener('scroll', setDivStyles);
})

let defaults_fromChild = ref(null);
provide('defaults_fromChild', defaults_fromChild);
provide('setTargetValue_and_updateModelValue', setTargetValue_and_updateModelValue);

let timepickerUiList_font_dark = computed(()=> defaults_fromChild?.value?.colors?.font_dark)
let timepickerUiList_color_transparent_1 = computed(()=> defaults_fromChild?.value?.colors?.color_transparent_1)

function setTargetValue_and_updateModelValue({options=clonedOptions, allowUpdateModelValue=true}={}) { 
    try {
        
        if(defaults_fromChild.value){
            options = defaults_fromChild.value;
        }

        let t24 = clonedOptions?.use24FormatTimeForEvents;
        const format24 = 'HH:mm';

        let { startDate, endDate, startTime, endTime } = pickerValues;

        let startDate__ = startDate;
        let endDate__ = endDate;  
        
        startDate = makeDate(startDate, FORMATS.forDisplay);
        endDate = makeDate(endDate, FORMATS.forDisplay);

        if(!startTime) startTime = makeDate('12:00 AM', FORMATS.time);
        if(!endTime) endTime = makeDate('12:00 AM', FORMATS.time);
    
        let value = '';
        let modelValue;
        let text_type_modelValue = '';
    
        if(options?.onlyTimePicker){
            if(options.rangePicker){
                value = `${startTime} - ${endTime}`;
                modelValue = {startTime, endTime};
                if(t24){
                    text_type_modelValue = `${startTime} - ${endTime}`;
                } else {
                    text_type_modelValue = `${makeDate(startTime, format24)} - ${makeDate(endTime, format24)}`;
                }
            } else {
                value = `${startTime}`;
                modelValue = {startTime, endTime};
                text_type_modelValue = `${makeDate(startTime, format24)}`;
            }
        } 
        else {            
            // Date + time (if timepicker=true)            
            if(options.rangePicker){
                if(options?.timePicker){
                    value = `${startDate} ${startTime} - ${endDate} ${endTime}`;
                    modelValue = {startDate: startDate__, endDate: endDate__, startTime, endTime};
                    text_type_modelValue = `${startDate__} ${startTime} - ${endDate__} ${endTime}`;
                }
                else {
                    value = `${startDate} - ${endDate}`;
                    modelValue = {startDate: startDate__, endDate: endDate__};
                    text_type_modelValue = `${startDate__} - ${endDate__}`;
                }
            } 
            else {
                if(isUsingRandomSelection){
                    let lengtn = pickerValues.dates?.length;
                    value = `selected ${lengtn} date${lengtn > 1 ? 's' : ''}`;
                    modelValue = {dates: pickerValues.dates};
                    text_type_modelValue = pickerValues.dates?.join(', ');
                } else {
                    if(options?.timePicker){
                        value = `${startDate} ${startTime}`;
                        modelValue = {startDate: startDate__, endDate: endDate__, startTime, endTime};
                        text_type_modelValue = `${startDate__} ${makeDate(startTime, format24)}`;
                    }else {
                        value = `${startDate}`;
                        modelValue = {startDate: startDate__, endDate: endDate__};
                        text_type_modelValue = `${startDate__}`;
                    }
                }
                
            }
        }
        input_value.value = value;
        
        let exitingData = clone(props.modelValue, { remove: ['old'] });


        if(t24){
            if(modelValue.startTime){
                modelValue.startTime = makeDate(modelValue.startTime, format24);
            }
            if(modelValue.endTime){
                modelValue.endTime = makeDate(modelValue.endTime, format24);
            }
        }
    
        let emitableData = {
            ...modelValue,
            old: exitingData,
        };


        if(allowUpdateModelValue){
            if(isTextTypeModelValue()){
                updateModalValue(text_type_modelValue);
            } else {
                updateModalValue(modelValue);
            }
        }
        return emitableData;
    } catch (error) {
        console.warn('setTargetValue_and_updateModelValue:: ', error);
        
    }
} 

let dateTimePickerComponent = ref([]);

defineExpose({
    picker,
    target,
    show(){
        showPicker.value = true;
    },
    hide(){
        showPicker.value = false;
    },
    toggle(bool=undefined){
        if(bool === true || bool === false){
            showPicker.value = Boolean(bool);
        } else {
            showPicker.value = !showPicker.value;
        }
    },
    setDate(startDate, endDate){
        let startDate_isValid = makeDate(startDate);
        let endDate_isValid = makeDate(endDate || startDate);
        if(startDate && startDate_isValid && endDate_isValid){
            startDate = moment(startDate).format(FORMATS.date);
            endDate = moment(endDate).format(FORMATS.date);

            pickerValues.startDate = picker.date = picker.date1 = startDate;
            pickerValues.endDate = picker.date2 = endDate; 
            setTargetValue_and_updateModelValue();
        }
    },
    setAvailableDates(dates){
        if(!dates.length) return;
        dates = dates.filter(item => moment(item?.date).isValid()).map(item => {
            item.date = moment(item.date).format(FORMATS.date);
            return item;
        });
        availableInDates_list.value = dates;
    },
    setTime(startTime, endTime){
        if(startTime || endTime){

            let startTimeObj = makeDate(startTime, FORMATS.time, {all: true});
            let endTimeObj = makeDate(endTime || startTime, FORMATS.time, {all: true});

            pickerValues.startTime = startTimeObj.formatted;
            pickerValues.endTime = endTimeObj.formatted;  
            
            let time_1 = moment().format(FORMATS.date) + ' ' + startTimeObj.formatted;
            let time_2 = moment().format(FORMATS.date) + ' ' + endTimeObj.formatted;
            let tiem_2_is_same_or_before = moment(new Date(time_1)).isSameOrBefore(new Date(time_2));
            if(!tiem_2_is_same_or_before){
                startTimeObj = endTimeObj;
                console.warn('End time should not less than start time');
            }

            picker.time1 = {
                time: startTimeObj.formatted,
                hour: startTimeObj.hour,
                minute: startTimeObj.minute,
                mode: startTimeObj.isAm ? 'am' : 'pm',
            }; 
            picker.time2 = {
                time: endTimeObj.formatted,
                hour: endTimeObj.hour,
                minute: endTimeObj.minute,
                mode: endTimeObj.isAm ? 'am' : 'pm',
            }; 
            setTargetValue_and_updateModelValue();
        }
    },
    focusByDate(date){
        if(date){
            picker.date = makeDate(date, FORMATS.date);        
        }
    },
    clear(){
        input_value.value = '';
    },
    next: function(){
        if(dateTimePickerComponent?.value?.[0]){
            dateTimePickerComponent?.value?.[0].next();
        }
    },
    previous: function(){
        if(dateTimePickerComponent?.value?.[0]){
            dateTimePickerComponent?.value?.[0].prev();
        }
    },
})

let getPlaceHolder = computed(() => {
    if(props.placeholder) return props.placeholder;
    return clonedOptions?.onlyTimePicker ? 'Select Time' : (clonedOptions?.rangePicker ? 'Select Date Range' : 'Select Date');
})

</script>

<template>
    <template v-if="modalValueIntialized">
        <!-- Just auto initilization -->
        <template v-if="target">
            <DateTimePicker ref="dateTimePickerComponent" 
            v-if="isShowInitilaztionValue"
            @init="onInitialize()"
            :justInitializeValue="true"></DateTimePicker>
        </template>

        <template v-if="showPicker && get_position == 'modal'">
            <Modal @makeFalse="onClose();hidePicker()">
                <DateTimePicker ref="dateTimePickerComponent" 
                @nextPrevious="nextPrevious"
                @cancel="onCancel"
                @close="onClose"
                @change="onChange"
                @changeTime="onChangeTime"
                :justInitializeValue="false"></DateTimePicker>
            </Modal>
        </template>


        <!-- Displaying in fixed position -->

        <template v-if="get_position !== 'modal'">
            <section ref="displayDiv" v-show="showPicker" class="openingAnimation" v-bind="{style: divStyles}">
                <DateTimePicker ref="dateTimePickerComponent" 
                v-if="showPicker"
                @nextPrevious="nextPrevious"
                @cancel="onCancel"
                @close="onClose"
                @change="onChange"
                @changeTime="onChangeTime"
                :justInitializeValue="false"></DateTimePicker> 
            </section>
        </template>
    



        <input 
        ref="target" 
        type="text" 
        :style="`${clonedOptions?.invisible ? 'opacity:0 !important;height:0px !important;padding:0 !important;margin:0 !important;border;none !important' : ''};${$attrs?.style}`"
        class="em-datetimepicker form-control"
        :class="[`theme-${theme} ${$attrs?.class}`]"
        :for="$attrs?.for"
        :disabled="disabled"
        :placeholder="getPlaceHolder" 
        @click.stop.prevent="showPicker = true;"
        :value="showValueIf ? input_value : null"
        readonly
        />

    </template>

    

</template>

<style>


</style>

<style setup>

@keyframes openingAnimation {
  from {
    opacity: 0;
    scale: 1;
    transform: translateY(70px);
  }
  to {
    opacity: 1;
    scale: 1;
    transform: translateY(0px);
  }
}

.openingAnimation {
  animation: openingAnimation 0.2s ease-in-out; /* Adjust the duration and timing function as needed */
}

</style>

