<script setup>
import moment from 'moment/moment';
import { ref, inject, provide, reactive, watch, defineEmits, defineProps, onMounted } from 'vue';
import EmDateTimePicker from './pages/EmDateTimePicker.vue';
import { makeDate, createDateRange, checkType, addMonth, isInMinMaxDate } from './pages/childs/grand-childs/helper.js';

let encodeOptions = inject('encodeOptions'); 
let PICKER_OPTION_ATTR = inject('PICKER_OPTION_ATTR'); 


let props = defineProps({
    target: {
        type: [HTMLElement],
        required: true,
    },
    options: {
        type: [Object],
        required: false,
        default: {},
    },
});

let emits = defineEmits(['remount']);


const FORMATS = {
    date: 'YYYY-MM-DD', //YYYY-MM-DD HH:mm:ss
    output: 'YYYY-MM-DD', //YYYY-MM-DD HH:mm:ss
    week_index: 'd', // 0 to 6
    day_index: 'D', // 1 to 31
    weekday_short: 'ddd', // Sat, Sun ...
    forDisplay: (props.options.displayFormat ?? 'DD, MMM YYYY'),
    forHeading: 'MMMM YYYY',
    year: 'YYYY',
    month: 'MMMM',
    monthShort: 'MMM',
    time: props.options?.timeFormat ?? (props.options?.use24Format ? 'HH:mm' : 'hh:mm A'),
};
provide('FORMATS', FORMATS);


let isMounted = ref(false);
let mountCount = ref(0);
let showPicker = ref(false);
let modelValueData = ref({
    startDate: '',
    endDate: '',
    startTime: '',
    endTime: '',
});
const pickerValues = reactive({
    startDate: '',
    endDate: '',
    startTime: '',
    endTime: '',
});
let HIDDEN_DATA_KEY = inject('HIDDEN_DATA_KEY');
let PICKER_EVENTS = inject('PICKER_EVENTS', false);
let PICKER_METHODS = inject('PICKER_METHODS', false);

provide('isMounted', isMounted);
provide('pickerValues', pickerValues);


const picker = reactive({
    // with Single Date
    date: '',
    date1: '',
    date2: '',
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

provide('picker', picker);

let displayPicker = ref(false);
provide('displayPicker', displayPicker); 


/**
 * ============== Inactive Date List =====================
 * data smaple 1
 * -------------
    inactiveDates = [
        {
            "recurring": {
                "repeat": "weekly",
                "weekDays": "SA,SU"
            }
        },
        {
            "recurring": {
                "repeat": "weekly",
                "weekDays": "SA,SU"
            }
        },
        {
            "start": "2024-12-17T18:00:00.000Z",
            "end": "2024-12-19T18:00:00.000Z",
            "title": null
        },
        {
            "date": "2024-12-17T18:00:00.000Z",
        },
        '2024-03-15',
        datObject,
        momentObject,
    ]
 */ 
let inactiveDates = reactive({
    weekDays: {
        Sun: false,
        Mon: false,
        Tue: false,
        Wed: false,
        Thu: false,
        Fri: false,
        Sat: false,
    },
    dates: { // key value paire
        // 2024-03-15: true,
        // 2024-03-17: true,
        // 2024-04-01: true, 
    }
});
provide('inactiveDates', inactiveDates);


function resetInavtiveDates(){
    inactiveDates.dates = {};
    Object.keys(inactiveDates.weekDays).forEach(key => {
        inactiveDates.weekDays[key] = false
    });
}
function processInaciveDates(data=props.options?.inactiveDates){
    resetInavtiveDates()
    if(data && Array.isArray(data) && data?.length){
        data.forEach(item => {
            if(typeof item === 'string'|| item instanceof Date || item instanceof moment ){
                if(makeDate(item, FORMATS.date)){
                    inactiveDates.dates[makeDate(item, FORMATS.date)] = true;
                }
            } 
            else if(typeof item === 'object') {
                if(item?.date){
                    if(makeDate(item.date, FORMATS.date)){
                        inactiveDates.dates[makeDate(item.date, FORMATS.date)] = true;
                    }
                }
                if (item?.start && item?.end){
                    createDateRange(item.start, item.end).forEach(_date => inactiveDates.dates[_date] = true)
                }
                if (item?.start && !item?.end){
                    inactiveDates.dates[makeDate(item?.start, FORMATS.date)] = true;
                }
                if (item?.recurring?.weekDays){
                    item?.recurring?.weekDays.split(',').forEach(text => {
                        text = text?.toLowerCase();                       
                        if(text == 'su' || text == 'sun') inactiveDates.weekDays['Sun'] = true;
                        if(text == 'mo' || text == 'mon') inactiveDates.weekDays['Mon'] = true;
                        if(text == 'tu' || text == 'tue') inactiveDates.weekDays['Tue'] = true;
                        if(text == 'we' || text == 'wed') inactiveDates.weekDays['Wed'] = true;
                        if(text == 'th' || text == 'thu') inactiveDates.weekDays['Thu'] = true;
                        if(text == 'fr' || text == 'fri') inactiveDates.weekDays['Fri'] = true;
                        if(text == 'sa' || text == 'st') inactiveDates.weekDays['Sat'] = true; 

                    });
                }
            }
        });
    }  
}
// End inactive date processing




provide('showPicker', showPicker);

/* -------------------------------------------------------------------------- */
/*                         Registering Picker Events                          */
/* -------------------------------------------------------------------------- */

props.target.addEventListener('click', (e)=>{
    e.stopPropagation();
    document.removeEventListener('click', hidePicker);
    document.addEventListener('click', hidePicker);
    if(props.options?.toggle){
        showPicker.value = !showPicker.value;
    } else {
        showPicker.value = true;
        displayPicker.value = true;
    }
})

 

/* -------------------------------------------------------------------------- */
/*                Importing some methods from child compnents                 */
/* -------------------------------------------------------------------------- */
let sharedFuncs = reactive({
    // From DateTimePicker.vue
   fn: {}, // {..fn}
   emitableData: () => null,

   // From EmDateTimePicker.vue
   onOpen: () => null,
   onCancel: () => null,
   onClose: () => null,
   onChangeDate: () => null,
   onChangeTime: () => null,
   onNext: () => null,
   onPrev: () => null,
   nextPrevious: () => null,
   getMonthCalendarDays: () => null,
   defaults: {}, 
})
provide('sharedFuncs', sharedFuncs);



function checkStartAndEndDate__isInMinMax__and_isAnyInavtiveDates(){
    /**
     * ====== checking starDate is in min-max, and not in any inavtive dates ======
    */
    let startDateObj = sharedFuncs.fn.dateToMonthDay(picker.date1);
    let endDateObj = sharedFuncs.fn.dateToMonthDay(picker.date2);

    let startDate_isInMinMax = isInMinMaxDate(picker.date1, sharedFuncs.defaults);
    let endDate_isInMinMax = isInMinMaxDate(picker.date2, sharedFuncs.defaults);

    let startDate_isInavtive = sharedFuncs.fn.isInactiveDate(startDateObj, sharedFuncs.defaults);
    let endDate_isInavtive = sharedFuncs.fn.isInactiveDate(endDateObj, sharedFuncs.defaults);

    if(!startDate_isInMinMax || startDate_isInavtive){
        let calendar_days = [
            ...sharedFuncs.getMonthCalendarDays(picker.date),
            ...sharedFuncs.getMonthCalendarDays(addMonth(picker.date, 1)),
            ...sharedFuncs.getMonthCalendarDays(addMonth(picker.date, 2)),
            ...sharedFuncs.getMonthCalendarDays(addMonth(picker.date, 3)),
            ...sharedFuncs.getMonthCalendarDays(addMonth(picker.date, 4)),
            ...sharedFuncs.getMonthCalendarDays(addMonth(picker.date, 5)),
            ...sharedFuncs.getMonthCalendarDays(addMonth(picker.date, 6)),
            ...sharedFuncs.getMonthCalendarDays(addMonth(picker.date, 7)),
            ...sharedFuncs.getMonthCalendarDays(addMonth(picker.date, 8)),
            ...sharedFuncs.getMonthCalendarDays(addMonth(picker.date, 9)),
            ...sharedFuncs.getMonthCalendarDays(addMonth(picker.date, 10)),
            ...sharedFuncs.getMonthCalendarDays(addMonth(picker.date, 11)),
            ...sharedFuncs.getMonthCalendarDays(addMonth(picker.date, 12)),
        ];
        let all_active_dates = calendar_days.filter(monthdayObject => {
            return (
                monthdayObject.date > picker.date1
                && sharedFuncs.fn.isInactiveDate(monthdayObject) == false 
                && isInMinMaxDate(monthdayObject.date, sharedFuncs.defaults) == true
            );
        });
        if(all_active_dates.length){
            let first_active_date = all_active_dates[0]['date'];

            // with startDate
            picker.date1 = pickerValues.startDate = first_active_date;
            if(showPicker.value === false) picker.date = first_active_date;
            

            // with endDate
            if(first_active_date > picker.date2 || !endDate_isInMinMax || endDate_isInavtive){
                picker.date2 = pickerValues.endDate = first_active_date;
            } 
        }
    }
}

provide('checkStartAndEndDate__isInMinMax__and_isAnyInavtiveDates', checkStartAndEndDate__isInMinMax__and_isAnyInavtiveDates);



/* -------------------------------------------------------------------------- */
/*                     Shwoing Availability In Calendar                       */
/* -------------------------------------------------------------------------- */
/**
 * data format
 * =============
 * options.availableInDates = 
  [
    {
        "date": "2024-12-12T00:00:00.000Z",
        "title": 100,
        "color": "#a7ffa4",  // for bg color, (text color willbe black |  white)
    },
  ]
 */
const availableInDates = ref({});
provide('availableInDates', availableInDates);

setAvaiableInDates();

function setAvaiableInDates(data=props.options?.availableInDates){
    if(!data) return;
    if(data?.length){
        data.forEach(item => {
            if(item?.['date'] && item?.['title']){
                let date = makeDate(item.date);
                if(date){
                    availableInDates.value[date] = {
                        date,
                        title: item?.['title'],
                        color: item?.['color'],
                    };
                }                
            }
        });
    }
}


function changeDateFromMethodFiring(params){
    let startDate = makeDate(params?.[0]);
    let endDate = makeDate(params?.[1] || params?.[0])
    startDate = makeDate(startDate);
    endDate = makeDate(endDate);
    if(startDate && endDate){    
        pickerValues.startDate = picker.date1 = startDate;
        if(showPicker.value === false) picker.date = startDate;
        pickerValues.endDate = picker.date2 = endDate || startDate; 
        sharedFuncs.fn.setTargetValue();
        checkStartAndEndDate__isInMinMax__and_isAnyInavtiveDates();
    }
}

function setTimeFromMethodFiring(params, {from_set_date_time_event=false}={}){
    let startTime, endTime

    if(from_set_date_time_event && params?.length == 4){
        startTime = params?.[2];
        endTime = params?.[3] || startTime;
    } else {
        startTime = params?.[0];
        endTime = params?.[0] || startTime;
    }   

    if(startTime || endTime){

        let startTimeObj = makeDate(startTime, FORMATS.time, {all: true});
        let endTimeObj = makeDate(endTime || startTime, FORMATS.time, {all: true});        

        pickerValues.startTime = startTimeObj.formatted;
        pickerValues.endTime = endTimeObj.formatted;  

        let time_1 = moment().format(FORMATS.date) + ' ' + startTimeObj.formatted;
        let time_2 = moment().format(FORMATS.date) + ' ' + endTimeObj.formatted;
        
        let tiem_2_is_same_or_before = moment(new Date(time_1)).isSameOrBefore(new Date(time_2));

        if(props.options?.rangePicker && !tiem_2_is_same_or_before){
            startTimeObj = endTimeObj;
            console.warn('Warning From Date Picker:: End time should not less than start time');
        }

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
        sharedFuncs.fn.setTargetValue();
    }
}




/* -------------------------------------------------------------------------- */
/*                         Registering Picker Methods                         */
/* -------------------------------------------------------------------------- */
props.target.addEventListener(`method:${PICKER_METHODS['show']}`, ({detail: {element, params}})=>{
    element.click();
})
props.target.addEventListener(`method:${PICKER_METHODS['hide']}`, ({detail: {element, params}})=>{
    showPicker.value = false;
})
props.target.addEventListener(`method:${PICKER_METHODS['toggle']}`, ({detail: {element, params}})=>{
    document.removeEventListener('click', hidePicker);
    showPicker.value = !showPicker.value;
})
props.target.addEventListener(`method:${PICKER_METHODS['setInactiveDates']}`, ({detail: {element, params}})=>{
    /**
     * Use Example
     * =====================================
     * Show line number: 89 or (search by ("= Inactive Date List =")
     */
    processInaciveDates(params?.[0]);
})
props.target.addEventListener(`method:${PICKER_METHODS['clearInactiveDates']}`, ({detail: {element, params}})=>{
    /**
     * Use Example
     * =====================================
     * 1) inputEl.emDateTimePicker('clear_inactive_dates');
     */
    processInaciveDates([]);
})
props.target.addEventListener(`method:${PICKER_METHODS['updateOptions']}`, ({detail: {element, params}})=>{
    /**
     * Use Example
     * =====================================
     * 1) inputEl.emDateTimePicker('update_options', {...options});
     */
    if(checkType(params?.[0]) === 'object'){ 
        let new_options = {...props.options, ...params[0]};
        let encodedOptions = encodeOptions(new_options);
        props.target.setAttribute(PICKER_OPTION_ATTR, encodedOptions);
        emits('remount', {new_options});   
    } 
})
props.target.addEventListener(`method:${PICKER_METHODS['setDate']}`, ({detail: {element, params}})=>{
    
    /**
     * User can send parameter muliple ways
     * =====================================
     * 1) inputEl.emDateTimePicker('set_date', startDate)
     * 2) inputEl.emDateTimePicker('set_date', startDate, endDate)
     */
     changeDateFromMethodFiring(params);
})
props.target.addEventListener(`method:${PICKER_METHODS['setTime']}`, ({detail: {element, params}})=>{
    
    /**
     * User can send parameter muliple ways
     * =====================================
     * 1) inputEl.emDateTimePicker('set_date', startDate)
     * 2) inputEl.emDateTimePicker('set_date', startDate, endDate)
     */
     setTimeFromMethodFiring(params);
})
props.target.addEventListener(`method:${PICKER_METHODS['setDateTime']}`, ({detail: {element, params}})=>{
    
    /**
     * User can send parameter muliple ways
     * =====================================
     * 1) inputEl.emDateTimePicker('set_date', startDateTime)
     * 2) inputEl.emDateTimePicker('set_date', startDateTime, endDateTime)
     */
     changeDateFromMethodFiring(params);
     setTimeFromMethodFiring(params, {from_set_date_time_event: true});
})
props.target.addEventListener(`method:${PICKER_METHODS['setAvailableInDates']}`, ({detail: {element, params}})=>{
    
    /**
     * User can send parameter like this
     * =====================================
     * inputEl.emDateTimePicker('set_available_in_dates', [
            {
                "date": "2024-12-12T00:00:00.000Z",
                "title": 100,
                "color": "#a7ffa4",  // for bg color, (text color willbe black |  white)
            },
        ])
     */
     setAvaiableInDates(params?.[0]);
})
props.target.addEventListener(`method:${PICKER_METHODS['clearAvailableInDates']}`, ({detail: {element, params}})=>{
    
    /**
     * No parameter needed
     * =====================
     * inputEl.emDateTimePicker('clear_available_in_dates')
     */
     availableInDates.value = {};
})


/* -------------------------------------------------------------------------- */
/*                              Triggering Events                             */
/* -------------------------------------------------------------------------- */

props.target.addEventListener(`trigger:empicker:event`, ({detail: { eventName }})=>{
    
    if(eventName === PICKER_EVENTS.open){
        sharedFuncs.onOpen(sharedFuncs.emitableData());
    }
    else if(eventName === PICKER_EVENTS.close){
        sharedFuncs.onClose(sharedFuncs.emitableData())
    }
    else if(eventName === PICKER_EVENTS.cancel){
        sharedFuncs.onCancel(sharedFuncs.emitableData())
    }
    else if(eventName === PICKER_EVENTS.changeDate){
        sharedFuncs.onChangeDate(sharedFuncs.emitableData())
    }
    else if(eventName === PICKER_EVENTS.changeTime){
        sharedFuncs.onChangeTime(sharedFuncs.emitableData())
    }
    /* === search-identity: nextPrev__fire === */
    else if(eventName === PICKER_EVENTS.next){ 
        let data = sharedFuncs.fn.onClickNext(); 
        sharedFuncs.onNext(data);    
    }
    else if(eventName === PICKER_EVENTS.prev){         
        let data = sharedFuncs.fn.onClickPrev(); 
        sharedFuncs.onPrev(data); 
    } 
    else if(eventName === PICKER_EVENTS.nextPrevious){   
        let data = sharedFuncs.fn.onClickNext();
        sharedFuncs.nextPrevious(data);
    }
    /* ================== END ================== */ 
    
})




function hidePicker(e) {
    e.stopPropagation();
    if(props.options?.sticky) return;
    let previous_value = showPicker.value;
    showPicker.value = false;
    if(previous_value === true){
        sharedFuncs.onClose(sharedFuncs.emitableData());
    }
}


onMounted(() => {

    processInaciveDates();

    document.removeEventListener('click', hidePicker);
    document.addEventListener('click', hidePicker);
    try {
        if(props.options?.autoOpen || props.options?.sticky){
            showPicker.value = true;
            setTimeout(() => {
                props.target.click()
            }, 100);
        } 

        if(props.options?.invisible){
            props.target.style.display = 'block';        
            props.target.style.opacity = '0';        
            props.target.style.width = '0px';            
            props.target.style.height = '0px';             
        } 

        if(mountCount.value == 0 ){        
            if(!props.options.autoOpen && !props.options?.sticky){
                showPicker.value = true;
                setTimeout(() => {
                    showPicker.value = false;
                }, 0);
            }
        }
    } catch (error) {
        console.log('EachPicker.vue:onMounted():error', error);
    }
    mountCount.value += 1;  
})

</script>

<template>  
    <template v-if="showPicker">
        <EmDateTimePicker v-model="modelValueData" :target="target" :options="options"></EmDateTimePicker>
    </template>

</template>