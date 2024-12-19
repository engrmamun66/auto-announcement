<script setup>
import { moment } from './grand-childs/helper';
import { ref, computed, reactive, defineProps, onMounted, inject, provide, defineEmits, watch, defineExpose } from 'vue';
import Buttons from './grand-childs/Buttons.vue';
import Switcher from './grand-childs/SwitcherForDate.vue';
import Documentation from './grand-childs/Doccomponents/Doc.vue';
import TimePicker from './TimePicker.vue';
import Arrow from './grand-childs/Arrow.vue'
import { makeDate,
    isValidAvailableData,
    isAvailableByDate,
    withDate,
    createCustomeRanges,
    ucfirst,
    addMonth,
    isInMinMaxDate,
    delay } from './grand-childs/helper';
const isMounted = inject('isMounted');
const picker = inject('picker');
const pickerValues = inject('pickerValues');
const defaults_fromChild = inject('defaults_fromChild');
const setTargetValue_and_updateModelValue = inject('setTargetValue_and_updateModelValue');
const displayPositions = inject('displayPositions');
const theme = inject('theme');
let FORMATS = inject('FORMATS');
const isHexColor = inject('isHexColor');
const isUsingRandomSelection = inject('isUsingRandomSelection');
let emits = defineEmits(['init', 'open', 'cancel', 'close', 'change', 'changeTime', 'nextPrevious']);
let log = console.log;


let { justInitializeValue } = defineProps({       
    justInitializeValue: {
        type: [Boolean],
        required: false,
        default: {},
    },
});


let options = inject('options', {});

// options Example: https://docs.mobiscroll.com/javascript/eventcalendar#opt-eventOrder

const color_vars_light = {
    primary_bg: '#1d1b1b',
    body_bg: '#ffffff',
    bg_grey: '#e2e3ee',
    font_dark: '#444444',
    font_dark_low: '#777777',
    font_light: '#f7f7f7',
    date_disable: '#cacaca',
    soft_border: '#ededed',
};

const stickyMode = options?.sticky || false;

const monthShorts = [ 'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec' ];

const defaults = reactive({
    rangePicker: options?.rangePicker ?? false,
    useCustomRange: options?.useCustomRange || null, // show Example >>> src/pages/childs/grand-childs/helper.js:161
    allowDateOnlyFromCustomRange: options?.allowDateOnlyFromCustomRange ?? false,
    displayFormat: FORMATS.forDisplay,
    minDate: options?.minDate || '',
    maxDate: options?.maxDate || '',
    hideDateOutOfMinMax: options?.hideDateOutOfMinMax ?? false,
    local: {
        lang: 'en',
        adjustWeekday: options?.adjustWeekday ?? 0,
    },
    sticky: stickyMode,
    prevIcon:  options?.prevIcon ?? true,
    nextIcon:  options?.nextIcon ?? true,
    buttons: {
        todayBtn: stickyMode ? null : ((options?.buttons?.todayBtn && (typeof options?.buttons?.todayBtn) == 'boolean') ? 'Today' : options?.buttons?.todayBtn) ?? 'Today',
        cancelBtn: stickyMode ? null :((options?.buttons?.cancelBtn && (typeof options?.buttons?.cancelBtn) == 'boolean') ? 'Cancel' : options?.buttons?.cancelBtn) ?? 'Cancel',
        applyBtn: stickyMode ? null :((options?.buttons?.applyBtn && (typeof options?.buttons?.applyBtn) == 'boolean') ? 'Apply' : options?.buttons?.applyBtn) ?? 'Apply',
    },
    row: (options.row && options.row >= 3 && options.row <= 10) ? options.row : 6,
    // With Time Picker
    timePicker: options?.onlyTimePicker ? true : (options?.timePicker ?? false),
    onlyTimePicker: options?.onlyTimePicker ?? false,
    minuteStep: (options?.minuteStep && options?.minuteStep >= 1 && options?.minuteStep <= 30) ? options?.minuteStep : 1,
    use24Format: options?.use24Format ?? false,
    use24FormatTimeForEvents: options?.use24FormatTimeForEvents ?? false,
    timePickerUi: (options?.timePickerUi && ['classic', 'standard', 'modern']?.includes(options?.timePickerUi)) ? options?.timePickerUi : 'standard',
    timePickerButtons: options?.timePickerButtons ?? true,
    endTimeAutoValid: options?.endTimeAutoValid ?? true,
    allowRightSideTimePicker: options?.allowRightSideTimePicker ?? true,
    displayIn: ((options?.displayIn && displayPositions.includes(options?.displayIn ?? 'modal'))) ? options?.displayIn : 'modal',
    theme: theme,  
    colors: {
        // Just change -----> "primary_bg" to adjust color according any theme color
        primary_bg: isHexColor(options?.colors?.primary_bg) ? options?.colors?.primary_bg : (theme=='light' ? color_vars_light.primary_bg : '#10b105'),
        body_bg: isHexColor(options?.colors?.body_bg) ? options?.colors?.body_bg : (theme=='light' ? color_vars_light.body_bg : '#0d111e'),
        bg_grey: isHexColor(options?.colors?.bg_grey) ? options?.colors?.bg_grey : (theme=='light' ? color_vars_light.bg_grey : '#282f36'),
        font_dark: isHexColor(options?.colors?.font_dark) ? options?.colors?.font_dark : (theme=='light' ? color_vars_light.font_dark : color_vars_light.font_light),
        font_dark_low: isHexColor(options?.colors?.font_dark_low) ? options?.colors?.font_dark_low : (theme=='light' ? color_vars_light.font_dark_low : color_vars_light.font_dark_low),
        font_light: isHexColor(options?.colors?.font_light) ? options?.colors?.font_light : (theme=='light' ? color_vars_light.font_light : color_vars_light.font_dark),
        date_disable: isHexColor(options?.colors?.date_disable) ? options?.colors?.date_disable : (theme=='light' ? color_vars_light.date_disable : color_vars_light.font_dark),
        soft_border: isHexColor(options?.colors?.soft_border) ? options?.colors?.soft_border : (theme=='light' ? color_vars_light.soft_border : color_vars_light.font_dark),
    },
    autoOpen: options?.autoOpen ?? false,
    invisible: options?.invisible ?? false,
    hideSwitcher: options?.hideSwitcher || false,
    adjustCalendarDayWidth: options?.adjustCalendarDayWidth || '0px',  // adjust calendar size
    adjustCalendarDayHeight: options?.adjustCalendarDayHeight || '0px',  // adjust calendar size
    rowGap: options?.rowGap || '',
    columnGap: options?.columnGap || '',
    adjustX: 0, // pixel ->>> ajust calendar fix postion
    adjustY: 0, // pixel ->>> ajust calendar fix postion
    useRandomSelection: options?.useRandomSelection ?? false,
    rangeSelectionPattern: options?.rangeSelectionPattern ?? false, // week | week + 1 week | week + 2 day | from sun to thu | 1st week of month | 2nd, 3rd, 4th, 5th
    documentation: options?.documentation ?? false,
    autoSetValuFirstTime: options?.autoSetValuFirstTime ?? false,
    skipHighlighterDefaultClassess: options?.skipHighlighterDefaultClassess ?? false, // basically it will work with "availableInDates" props
    calendarQuantity: (Number(options?.calendarQuantity) || 1),
    multiCalendarMode: options?.multiCalendarMode || 'scroll', // 'scroll-mode' | 'flex-start' | 'flex-end' | 'flex-center' | 'flex-around' | 'flex-between' | 'flex-evenly'  ---------------- when calendarQuantity > 1 
});


defaults_fromChild.value = defaults;

let showDocumentation = ref(false);
provide('showDocumentation', showDocumentation);


/**
 * This color variable must be samcolor_vars*.ll .vue files 
 * ...............
 * DateTimePicker.vue
 * TimePicker.vue
 * Buttons.vue
 * Modal.vue
 * SwitcherForDate.vue
 * SwitcherForTime.vue
*/

let {
    body_bg: color_body_bg,
    primary_bg: color_primary_bg,
    bg_grey: color_bg_grey,
    font_dark: color_font_dark,
    font_dark_low: color_font_dark_low,
    font_light: color_font_light,
    date_disable: color_date_disable,
    soft_border: color_soft_border,
} = defaults.colors
const color_transparent_1 = (color_primary_bg + '3d');
const color_transparent_2 = (color_primary_bg + '1c');
defaults_fromChild.value.colors.color_transparent_1 = color_transparent_1;
defaults_fromChild.value.colors.color_transparent_2 = color_transparent_2;
/* --------------- End color variables -------------- */

const OUTPUT_FORMAT = computed(()=>{
    if(defaults.onlyTimePicker) return FORMATS.time;
    else return FORMATS.output;
})


let current_view = ref('days');
let selectingStartDate = ref(true);
let timePickerComponent = ref([]);

let hoverDate = ref('');
let openTimePicker = ref(false);
let target = inject('target');
provide('openTimePicker', openTimePicker);
provide('defaults', defaults);
provide('makeDate', makeDate);
provide('selectingStartDate', selectingStartDate);
provide('timePickerComponent', timePickerComponent);

watch(selectingStartDate, (new_boolean, old_boolean) => {
    if(timePickerComponent.value?.[0]){
        timePickerComponent.value?.[0].switch(new_boolean);
    }
})


function daysOfMonth(year, monthIndex, FORMATS, {currentMonth}={}) {
    const firstDayOfMonth = moment().year(year).month(monthIndex).date(1);
    const daysInMonth = firstDayOfMonth.daysInMonth();
    let days = [];
    for (let day = 1; day <= daysInMonth; day++) {
        const currentDay = firstDayOfMonth.date(day);
        const _day = {
            date: currentDay.format(FORMATS.date),
            week_index: currentDay.format(FORMATS.week_index),
            day_index: currentDay.format(FORMATS.day_index),
            weekday_short: currentDay.format(FORMATS.weekday_short),
            month_index: new Date(currentDay.format(FORMATS.date)).getMonth(),
            currentMonth: currentMonth ?? false,
        };
        days = [...days, _day];
    }
    return days;
}

let date2_SelectedByUser = ref(false);

const fn = {     
    initPicker: function(){
        emits('init', null);
    },
    openPicker: function(){
        emits('open', null);
    },
    cancelPicker: function(){
        emits('cancel', null);
    },
    
    changePickerAndUpdateData: function({emitName='change'}={}){
        let { date1, date2 } = picker;
        pickerValues.startDate = date1;
        pickerValues.endDate = date2;

        if(emitName){
            emits(emitName, {/** no need pass data */});
        }
    },    
     
      
    /* -------------------------------------------------------------------------- */
    /*                           Start With Date Picker                           */
    /* -------------------------------------------------------------------------- */
  
    onClickDay: function ({date}) {
        if(!isInMinMaxDate(date, defaults)) {
            return;
        }
        if(defaults.rangePicker){
            if(selectingStartDate.value){
                // For Date 1
                if(!date2_SelectedByUser.value || !picker.date1 || (picker.date1 && picker.date2 && date <= picker.date2)){
                    picker.date1 = date;
                    if(!date2_SelectedByUser.value){
                        selectingStartDate.value = false;
                        if(picker.date2 < picker.date1){
                            picker.date2 = '';
                        }
                    }                
                } else {

                }

            } else {

                if(!picker.date2 || (picker.date1 && picker.date2 && date >= picker.date1)){
                    picker.date2 = date;
                    
                    if(!defaults.buttons?.applyBtn){      
                        this.onClickApply({close: false});
                    }                 
                    date2_SelectedByUser.value = true;
               }
            }           
            
        } else {
            if(defaults.calendarQuantity == 1) picker.date = date;    
            
            picker.date1 = date;
            picker.date2 = date; 
            if(!defaults.buttons?.applyBtn){
                this.onClickApply();    
            }
        }
    },
    conditionalSelection: function (monthDay) {       

        const selectRange = (startDate, endDate) => {
            this.onClickDay({date: startDate});
            this.onClickDay({date: endDate});
            autoFocusCalendar({focus: 'startDate'});
        }

        let {rangeSelectionPattern: text} = defaults;

        if(!text){            
            this.onClickDay(monthDay);
            return;
        }

        // week
        const week_matched = /^week$/ig.exec(text);
        // week + 1 week | week + 2 day
        const week_plus_matched = /^week ?\+ ?(\d+) ?(week|day)$/ig.exec(text);
        // from sun to thu
        const week_day_to_day_matched = /^from ?(Sat|Sun|Mon|Tue|Wed|Thu|Fri) ?to ?(Sat|Sun|Mon|Tue|Wed|Thu|Fri)$/ig.exec(text);
        // week of month
        const week_of_month_matched = /^(1st|2nd|3rd|4th|5th) Week of month$/ig.exec(text);

        if(week_matched){
            let startDate = withDate.weekStartDate(monthDay.date);
            let endDate = withDate.weekEndDate(monthDay.date);
            selectRange(startDate, endDate);
        } 
        else if(week_plus_matched){
            let count = Number(week_plus_matched[1]);
            let units = week_plus_matched[2];
            if(count && units){
                let startDate = withDate.weekStartDate(monthDay.date);
                let endDate = moment(startDate).add(count, 'week').endOf(units).format(FORMATS.date);
                selectRange(startDate, endDate);
            }
        } 
        else if(week_day_to_day_matched){
            let dayShort1 = ucfirst(week_day_to_day_matched[1]);
            let dayShort2 = ucfirst(week_day_to_day_matched[2]);
            const daysOfWeek = withDate.createWeekDays(monthDay.date)
            let result = daysOfWeek.filter(date => {
                let daySort = makeDate(date, FORMATS.weekday_short);
                return [dayShort1, dayShort2].includes(daySort);
            })
            if(result?.length == 2){
                let [startDate, endDate] = result;
                selectRange(startDate, endDate);
            }             
        } 
        else if(week_of_month_matched){
            let count = Number(Array.from(week_of_month_matched[1]).at(0));
            if(count){
                let firstDayOfMonth = moment(monthDay.date).startOf('month');       
                let startDate = moment(firstDayOfMonth).add(count - 1, 'week').startOf('week').format(FORMATS.date);
                let endDate = moment(firstDayOfMonth).add(count - 1, 'week').endOf('week').format(FORMATS.date);
                selectRange(startDate, endDate);
            }
        } 
        else {
            alert('"rangeSelectionPattern" is incorrect');
        }
        
    },
    onClickApply: function ({close=true}={}) { 
        this.changePickerAndUpdateData();
        if(close) emits('close', null);
    },
    onClickToday: function () { 
        let date = makeDate(new Date(), FORMATS.date);
        if(!isInMinMaxDate(date, defaults)){
            return;
        }

        if(defaults.calendarQuantity == 1) picker.date = date;
        if(defaults.rangePicker){
            this.onClickDay({date});
            this.onClickDay({date});
        } else {
            this.onClickDay({date});
        }
        current_view.value = 'days';
        this.changePickerAndUpdateData();
        emits('close', null);
    },
    onClickMonth: function (monthIndex) { 
        let date = new Date(picker.date);
        date.setMonth(monthIndex);
        picker.date = makeDate(date, FORMATS.date);        
        current_view.value = 'years';
    },
    onClickYear: function (year) { 
        let date = new Date(picker.date);
        date.setFullYear(year);        
        date.setFullYear(year);
        picker.date = makeDate(date, FORMATS.date); 
        current_view.value = 'days';
    },
    emitNextPrevious: function(action){
        setTimeout(() => {
            let startDate = moment(picker.date).startOf('month').format(FORMATS.date);
            let endDate = moment(picker.date).endOf('month').add(defaults.calendarQuantity - 1, 'months').format(FORMATS.date);
            let data = {
                action,
                startDate,
                endDate,
                startDateOfCalendar: getMonthCalendarDays(startDate)[0].date,
                endDateOfCalendar: getMonthCalendarDays(endDate).at(-1).date,
            };
            emits('nextPrevious', data);
        }, 50);
    },
    onClickPrev: function () { 
        let date;
        switch (current_view.value) {
            case 'days':
                date = new Date(picker.date);
                date.setMonth(date.getMonth() - defaults.calendarQuantity)
                picker.date = makeDate(date, FORMATS.date);               
                break;        
            case 'years':
                if(years.value.includes(1924)) return;
                date = new Date(picker.date);
                date.setFullYear(date.getFullYear() - 12)
                picker.date = makeDate(date, FORMATS.date);
                break; 
        }
        this.emitNextPrevious('prev');
    },
    onClickNext: function () { 
        let date;
        switch (current_view.value) {
            case 'days':
                date = new Date(picker.date);
                date.setMonth(date.getMonth() + defaults.calendarQuantity);
                picker.date = makeDate(date, FORMATS.date);              

                break;         
            case 'years':
                date = new Date(picker.date);
                date.setFullYear(date.getFullYear() + 12)
                picker.date = makeDate(date, FORMATS.date);
                break; 
        }
        this.emitNextPrevious('next');
        
    },    
    /* -------------------------------------------------------------------------- */
    /*                               Check Functions                              */
    /* -------------------------------------------------------------------------- */
    isInSelectedDate: function ({date}, inclusively=false) { 
        let { date1, date2 } = picker;
        return moment(date).isBetween(date1, date2, 'day', inclusively);
    },
    isHoverDate: function ({date: loopDate}) { 
        let { date1, date2 } = picker;  
        if(!date2){ 
            return (
                (new Date(loopDate) <= new Date(hoverDate.value))
                && (new Date(date1) < new Date(hoverDate.value))
                && (new Date(loopDate) > new Date(date1))
            );
        }
        return false;
    },
    /* -------------------------------------------------------------------------- */
    /*                           with time picker emits                           */
    /* -------------------------------------------------------------------------- */    
    onCloseTimePicker: function (data) {
        openTimePicker.value = false;
        emits('close', null);
    },
    onOkTimePicker: function (data) {     
        let emitName = (defaults.onlyTimePicker || defaults?.applyBtn) ? 'changeTime' : null;
        fn.changePickerAndUpdateData({emitName});

        if(data?.inDatePicker == true){
            openTimePicker.value = false;
            return;
        }
        if(data?.do_not_hide !== true){
            openTimePicker.value = false;
            emits('close', null);
        }
        
    },
};


// @returns [Sun, Mon, Tue, Wed, Thu, Fri, Sat]
const weekDays = computed( () => { 
    return withDate.createWeekDays(new Date, FORMATS.weekday_short);
})

function getMonthCalendarDays(DATE=null){
    let date = new Date(DATE || picker.date);
    // console.log('picker', picker);
    const monthIndex = date.getMonth();
    const days = daysOfMonth(date.getFullYear(), monthIndex, FORMATS, {currentMonth: true});
    const first_weekday_short = days?.[0]?.['weekday_short'];
    const startFrom = weekDays.value.findIndex(weekday => weekday === first_weekday_short);
    // Left tailing
    let _date = new Date(DATE || picker.date);
    _date.setMonth(_date.getMonth() - 1);
    const previous_month_days = daysOfMonth(_date.getFullYear(), _date.getMonth(), FORMATS).slice(-startFrom);
    const days_after_left_tailing = startFrom ? [...previous_month_days, ...days] : [...days];
    // Right tailing    
    let __date = new Date(DATE || picker.date);
    __date.setMonth(__date.getMonth() + 1);
    const next_month_days = daysOfMonth(__date.getFullYear(), __date.getMonth(), FORMATS);
    const days_after_left_and_right_tailing = [...days_after_left_tailing, ...next_month_days];
    days_after_left_and_right_tailing.length = defaults.row * 7;
    return days_after_left_and_right_tailing;
}
globalThis.getMonthCalendarDays = getMonthCalendarDays;

const monthCeledarDays = computed( () => { 
    return getMonthCalendarDays();
});

const years = computed(() => {
    let limit = 12
    let start = new Date(picker.date).getFullYear();
    let end = start + limit;
    let rangeArray = Array.from({ length: end - start }, (_, index) => start - index);
    rangeArray = rangeArray.sort((a, b) => {
        if(a - b){
            return -1;
        } else {
            1
        }
    })    
    return rangeArray;
})


/* -------------------------------------------------------------------------- */
/*                                  onMounted                                 */
/* -------------------------------------------------------------------------- */
onMounted(() => {
    try {
        if(!isMounted.value){               
            fn.initPicker();
            isMounted.value = true;           
        }
    } catch (error) {
        console.warn('mounted >> ', error);
    }

})

/* -------------------------------------------------------------------------- */
/*                   With Highlight availableInDates in calendar              */
/* -------------------------------------------------------------------------- */
let availableInDates_list = inject('availableInDates_list', null) // Array | Object >>> Please dont
const availables = computed(()=> isValidAvailableData(availableInDates_list?.value))

let {rowGap,columnGap} = defaults;

const get_row_gap = computed(() => {
    if(availables.value?.length && availables.value?.some(i => i.available)){
        return rowGap || '20px';
    } else {
        return rowGap || '4px';
    }    
})
const get_column_gap = computed(() => {
    if(availables.value?.length && availables.value?.some(i => i.available)){
        return columnGap || '4px';
    } else {
        return columnGap || (availables.value?.length ? '4px' :'0px');
    }    
})




/* -------------------------------------------------------------------------- */
/*                               With RangeList                               */
/* -------------------------------------------------------------------------- */
let rangeToggler = ref(false);
let usingCustomRange = computed(()=> {
    return defaults?.rangePicker && defaults?.useCustomRange
});
let allDateRangeList = createCustomeRanges(defaults?.useCustomRange);


function autoFocusCalendar({focus='endDate'}={}){
    let { date1, date2 } = picker;
    let calendar = getMonthCalendarDays(date1);
    let both_date_containig_in_same_calendar = calendar.findIndex(i => i.date == date2) > -1;
    if(defaults.calendarQuantity == 1){
        if(both_date_containig_in_same_calendar){
            picker.date = date1;
        } else {
            if(focus=='startDate'){
                picker.date = date1;
            } else {
                picker.date = date2;
            }
        }
    }
}

function toggleRandomDates(date){
    if(!isInMinMaxDate(date, defaults)){
        return;
    };
    if(!pickerValues.dates.includes(date)){
        pickerValues.dates.push(date)
    } else {
        pickerValues.dates = pickerValues.dates.filter(_date => _date != date);
    }
}

 
const onlyCustRange = defaults.useCustomRange && defaults.allowDateOnlyFromCustomRange;
if(onlyCustRange) rangeToggler.value = true;

let windowInnerWidth_more_than_590 = ref(window.innerWidth > 590);
provide('windowInnerWidth_more_than_590', windowInnerWidth_more_than_590);


function testWdth(){
    if(!defaults?.timePicker){
        openTimePicker.value = false;
        return;
    }
    if(!defaults.allowRightSideTimePicker) return;
    windowInnerWidth_more_than_590.value = window.innerWidth > 590;
    if(windowInnerWidth_more_than_590.value) openTimePicker.value = false;
    else openTimePicker.value = true;
}

window.removeEventListener('resize', testWdth);
window.addEventListener('resize', testWdth);

let { skipHighlighterDefaultClassess, calendarQuantity, multiCalendarMode, hideDateOutOfMinMax } = defaults;

let swither400pxWidth = computed(() => {
    return (calendarQuantity > 1 || (windowInnerWidth_more_than_590.value && defaults?.timePicker));
})

defineExpose({
    next: fn.onClickNext,
    prev: fn.onClickPrev,
})

</script>

<template>
    <div class="main-content-of-picker" @click.stop="false" :class="{'calendar-one-more': calendarQuantity > 1}">
        <template v-if="!justInitializeValue && defaults.onlyTimePicker">
            <TimePicker ref="timePickerComponent" :justInitializeValue="justInitializeValue"
            @close="fn.onCloseTimePicker" 
            @changeTime="fn.onOkTimePicker" 
            :showingInRightSide="false"
            v-if="defaults.timePicker">
            </TimePicker>
        </template>
        <template v-if="!justInitializeValue">
            <!-- days of month -->
            <template v-if="!defaults.onlyTimePicker">
                <div :style="`--adjustCalendarDayWidth:${defaults.adjustCalendarDayWidth};--adjustCalendarDayHeight:${defaults.adjustCalendarDayHeight};${rangeToggler ? 'overflow:hidden': ''}`">
                    
                    <template v-if="defaults.rangePicker && !options.hideSwitcher" >
                        <div class="switcher-intop-of-calendar-and-timepicker" :class="{'using-range': usingCustomRange}" >
                            <div class="defined-width" :class="{'multi-calendar': swither400pxWidth }">
                                <Switcher :disabled="onlyCustRange || defaults.rangeSelectionPattern" :displayTime="!swither400pxWidth" @run_timePicker_asMounted="(n)=>{
                                    let timePicker = timePickerComponent?.[0]; 
                                    if(timePicker && timePicker?.asMounted){
                                        timePicker.asMounted();
                                    }
                                }" ></Switcher>
                            </div>
                        </div>
                    </template>
                    <div :class="{
                        'use-custom-range': usingCustomRange,
                        'has-timepicker-in-right-site': (defaults.timePicker) && (windowInnerWidth_more_than_590 && defaults.allowRightSideTimePicker),
                        'calendarQuantity-1': calendarQuantity == 1
                        }" @click.stop.prevent="false">
                        <div :class="{'single-calendar': calendarQuantity == 1, 'multi-calendar':calendarQuantity > 1, [multiCalendarMode]: true }">
                            <!-- 
                                With custom range 
                            -->
                            <span v-if="usingCustomRange && allDateRangeList?.length" class="range-toggler" :class="{active: rangeToggler}" @click.stop="rangeToggler = !rangeToggler" >Ranges</span>
                            <ul v-if="usingCustomRange && allDateRangeList?.length" class="range-list" :class="{active: rangeToggler}">
                                <div class="range-title" >Date Ranges</div>
                                <div class="range-alert" v-if="onlyCustRange"> Date allowed only range list </div>
                                <template v-for="(range, rIndex) in allDateRangeList" :key="rIndex">
                                    <li class="range" 
                                    :class="{
                                        active: picker.date1 == range.startDate && picker.date2 == range.endDate,
                                        'out-of-min-max-date': !isInMinMaxDate(range.startDate, defaults) || !isInMinMaxDate(range.endDate, defaults),
                                    }"
                                    @dblclick.stop="rangeToggler=false"
                                    @click.stop="()=>{
                                        if(isInMinMaxDate(range.startDate, defaults) && isInMinMaxDate(range.endDate, defaults)){
                                            date2_SelectedByUser = false;
                                            selectingStartDate = true;
                                            fn.onClickDay({date: range.startDate});
                                            fn.onClickDay({date: range.endDate});
                                            autoFocusCalendar({focus: 'startDate'});
                                            date2_SelectedByUser = false;
                                            selectingStartDate = true;
                                        }
                                    }"                                    
                                    > {{range?.label || 'Select'}} </li>
                                </template>
            
                            </ul>

                            <!-- 
                                With with calendarQuantity
                            -->
                            <template v-for="x in calendarQuantity" >
                                <template v-if="x == 1" >
                                    <template v-if="current_view=='days'">                       
                                
                                        <div class="days-month-box content" @click.stop="false" >
                                            <header class="header" >
                                                <Arrow to="left" @click="fn.onClickPrev()" :class="{deactive: !defaults?.prevIcon}" :color="color_font_dark" size="12px"></Arrow>
                                                <span :class="{cp: !onlyCustRange && calendarQuantity == 1}" @click="(onlyCustRange || calendarQuantity > 1) ? false : current_view = 'months'">
                                                    {{ makeDate(monthCeledarDays.filter(d => d.currentMonth)[0]?.date, FORMATS.forHeading) }}
                                                </span>
                                                <Arrow to="right" @click="fn.onClickNext()" :class="{deactive: !defaults?.nextIcon || (calendarQuantity > 1)}" :color="color_font_dark" size="12px"></Arrow>
                                            </header>
                                            <!-- <Switcher v-if="defaults.rangePicker && !options.hideSwitcher" :disabled="onlyCustRange || defaults.rangeSelectionPattern"></Switcher> -->
                                            <main class="main-weekdays">
                                                <template v-for="(day, index) in weekDays" :key="index">
                                                    <div class="active fade-in">{{ day }}</div>            
                                                </template>
                                            </main>
                                            <main class="main-days box" :class="{'rangePicker': defaults.rangePicker}">
                                                <template v-for="(monthDay, index) in monthCeledarDays" :key="index">
                                                    <template v-if="monthDay && monthDay?.date">
                                                        <template v-if="defaults.rangePicker">
                                                            <div 
                                                            @click.stop="onlyCustRange ? false : fn.conditionalSelection(monthDay)" 
                                                            @mouseenter="onlyCustRange ? false : hoverDate = monthDay.date"
                                                            class="fade-in"
                                                            :date="monthDay.date"
                                                            :class="{ 
                                                                'active':  skipHighlighterDefaultClassess == false && (picker.date1 === picker.date2) && (picker.date1 === monthDay.date),
                                                                'offset-date': !monthDay.currentMonth,
                                                                'start-date': skipHighlighterDefaultClassess == false && (monthDay.date === picker.date1) && (picker.date1 != picker.date2),
                                                                'end-date': skipHighlighterDefaultClassess == false && (monthDay.date === picker.date2) && (picker.date1 != picker.date2),
                                                                'date-in-selected-range': skipHighlighterDefaultClassess == false && fn.isInSelectedDate(monthDay),
                                                                'hover-date': fn.isHoverDate(monthDay),
                                                                ['not-in-minmax-date' + (hideDateOutOfMinMax ? ' hideDateOutOfMinMax' : '')]: !isInMinMaxDate(monthDay.date, defaults),
                                                                'date-allow-only-from-range': onlyCustRange,
                                                                ['theme-' + theme]: true,
                                                                ['highlight__' + isAvailableByDate(availables, makeDate, monthDay)?.['highlight']]: skipHighlighterDefaultClassess == true, /**higlighiligh default classes */
                                                            }">
                                                                {{ monthDay.day_index }}
                                                                <template v-if="isAvailableByDate(availables, makeDate, monthDay)?.['available']">
                                                                    <div class="availableInDates">{{ isAvailableByDate(availables, makeDate, monthDay)?.['available'] }}</div>
                                                                </template>
                                                            </div>
                                                        </template>
                                                        <template v-else>
    
                                                            <template v-if="isUsingRandomSelection">
                                                                <div 
                                                                    @click.stop="toggleRandomDates(monthDay.date)"
                                                                    @dblclick.stop="()=>{
                                                                        toggleRandomDates(monthDay.date);
                                                                        if(isInMinMaxDate(monthDay.date, defaults)){
                                                                            fn.onClickApply()
                                                                        }
                                                                    }"
                                                                    class="fade-in"
                                                                    @contextmenu="log(pickerValues.dates)"
                                                                    :class="{ 
                                                                        'active': skipHighlighterDefaultClassess == false && pickerValues.dates.includes(monthDay.date),
                                                                        'offset-date': !monthDay?.currentMonth,
                                                                        ['not-in-minmax-date' + (hideDateOutOfMinMax ? ' hideDateOutOfMinMax' : '')]: !isInMinMaxDate(monthDay.date, defaults),
                                                                        ['theme-' + theme]: true,
                                                                        ['highlight__' + isAvailableByDate(availables, makeDate, monthDay)?.['highlight']]: skipHighlighterDefaultClassess == true, /**higlighiligh default classes */
                                                                    }
                                                                    ">
                                                                        {{ monthDay?.day_index }}
                                                                        <template v-if="isAvailableByDate(availables, makeDate, monthDay)?.['available']">
                                                                            <div class="availableInDates">{{ isAvailableByDate(availables, makeDate, monthDay)?.['available'] }}</div>
                                                                        </template>
                                                                    </div> 
                                                            </template>
                                                            <template v-else>
                                                                <div 
                                                                @click.stop="fn.onClickDay(monthDay)"
                                                                @dblclick.stop="fn.onClickApply()"
                                                                class="fade-in"
                                                                :date="monthDay.date"
                                                                :pickerDate1="picker.date1"
                                                                :class="{ 
                                                                    'active': skipHighlighterDefaultClassess == false && picker.date1 == monthDay.date,
                                                                    ['not-in-minmax-date' + (hideDateOutOfMinMax ? ' hideDateOutOfMinMax' : '')]: !isInMinMaxDate(monthDay.date, defaults),
                                                                    'offset-date': !monthDay?.currentMonth,
                                                                    ['theme-' + theme]: true,
                                                                    ['highlight__' + isAvailableByDate(availables, makeDate, monthDay)?.['highlight']]: skipHighlighterDefaultClassess == true, /**higlighiligh default classes */
                                                                }
                                                                "                                                 
                                                                >
                                                                    {{ monthDay?.day_index }}
                                                                    <template v-if="isAvailableByDate(availables, makeDate, monthDay)?.['available']">
                                                                        <div class="availableInDates">{{ isAvailableByDate(availables, makeDate, monthDay)?.['available'] }}</div>
                                                                    </template>
                                                                </div>                                                    
                                                            </template>
                                                            
                                                        </template>
                                                    </template>
                                                </template>
                                            </main>                                
                                            <Buttons :x="x"
                                            :defaults="defaults"
                                            @onCancel="fn.cancelPicker()"
                                            @onApply="fn.onClickApply()"
                                            @onToday="fn.onClickToday()"
                                            ></Buttons>
                                            <Documentation v-if="showDocumentation" ></Documentation>
                                            <div v-if="defaults?.documentation" class="documentation-toggler" @click.stop="showDocumentation = !showDocumentation" >Documentation</div>
                                            
                                            <div v-if="openTimePicker==true" class="time-picker-display-area" @click.stop="openTimePicker=false">
                                                <div>
                                                    <TimePicker ref="timePickerComponent" :justInitializeValue="justInitializeValue" :displayTime="!swither400pxWidth"
                                                    :showingInRightSide="false"
                                                    :inDatePicker="true"
                                                    @close="()=>{
                                                        openTimePicker = false
                                                    }" 
                                                    @hidePopup="()=>{
                                                        openTimePicker = false
                                                    }" 
                                                    @changeTime="(data)=>{
                                                        delete data.inDatePicker;
                                                        fn.onOkTimePicker({...data, do_not_hide: true});
                                                    }"
                                                    ></TimePicker>
                                                </div>
                                            </div>
                                        </div>
                                        
                                    </template>
                                    <template v-else-if="current_view == 'months'">
                                        <div class="months-box content" @click.stop="false">
                                            <header class="header" >
                                                <Arrow to="left" class="deactive" :color="color_font_dark" size="12px"></Arrow>
                                                <span class="cp" @click="current_view = 'years'">{{ makeDate(picker?.date1, FORMATS.year) }}</span>
                                                <Arrow to="right"  class="deactive" :color="color_font_dark" size="12px"></Arrow>
                                            </header>
                                            <main class="main-months box">
                                                <template v-for="(monthShort, index) in monthShorts" :key="index">
                                                    <div 
                                                    :class="{
                                                        ['theme-' + theme]: true,
                                                        'active': makeDate(picker?.date1, FORMATS.monthShort) === monthShort
                                                        }" 
                                                    @click="fn.onClickMonth(index)">{{ monthShort }}</div>
                                                </template>
                                            </main>
                                            <Buttons :x="x"
                                            :defaults="defaults"
                                            @onCancel="fn.cancelPicker()"
                                            @onApply="fn.onClickApply()"
                                            @onToday="fn.onClickToday()"
                                            :applyBtn="false"
                                            ></Buttons>
                                        </div>
                                    </template>
                                    <template v-else-if="current_view == 'years'">
                                        <div class="months-box content" @click.stop="false">
                                            <header class="header" >
                                                <Arrow to="left" @click="fn.onClickPrev()" :color="color_font_dark" size="12px"></Arrow>
                                                <span>{{ years[0] }} - {{ years[years?.length - 1] }}</span>
                                                <Arrow to="right" @click="fn.onClickNext()" :color="color_font_dark" size="12px"></Arrow>
                                            </header>
                                            <main class="main-months box">
                                                <template v-for="(year, index) in years" :key="index">
                                                    <div 
                                                    :class="{
                                                        ['theme-' + theme]: true,
                                                        'active': new Date(picker.date1).getFullYear() == year
                                                        }" 
                                                    @click="fn.onClickYear(year)"> {{ year }}</div>
                                                </template>
                                            </main>
                                            <Buttons :x="x"
                                            :defaults="defaults"
                                            @onCancel="fn.cancelPicker()"
                                            @onApply="fn.onClickApply()"
                                            @onToday="fn.onClickToday()"
                                            :applyBtn="false"
                                            ></Buttons>
                                        </div>
                                    </template>
    
                                    <template v-if="calendarQuantity == 1">

                                        <div v-if="defaults?.allowRightSideTimePicker && defaults?.timePicker && windowInnerWidth_more_than_590" class="right-side-time-picker-area" >
                                                                                   
                                            <TimePicker ref="timePickerComponent" :justInitializeValue="justInitializeValue" :displayTime="!swither400pxWidth"
                                            :showingInRightSide="true"
                                            @close="fn.onCloseTimePicker" 
                                            @changeTime="fn.onOkTimePicker"
                                            >
                                            </TimePicker>
        
                                        </div>
                                    </template>
                                </template>
                                <template v-else >

                                    <!-- When
                                        =============== default.calendarQuantity > 1
                                        =============== default.calendarQuantity > 1
                                        =============== default.calendarQuantity > 1
                                        =============== default.calendarQuantity > 1
                                    -->
                                        
                                    
                                    <template v-if="current_view=='days'">                       
                                
                                        <div class="days-month-box content" @click.stop="false">
                                            <header class="header" >
                                                <Arrow to="left" @click="fn.onClickPrev()" :class="{deactive: true}" :color="color_font_dark" size="12px"></Arrow>
                                                <span :class="{cp: false}" @click="false">
                                                    {{ makeDate(addMonth(monthCeledarDays.filter(d => d.currentMonth)[0]?.date, x - 1), FORMATS.forHeading) }}
                                                </span>
                                                <Arrow to="right" @click="fn.onClickNext()" :class="{deactive: x !== calendarQuantity}" :color="color_font_dark" size="12px"></Arrow>
                                            </header>
                                            <!-- <Switcher v-if="defaults.rangePicker && !options.hideSwitcher" :disabled="onlyCustRange || defaults.rangeSelectionPattern"></Switcher> -->
                                            <main class="main-weekdays">
                                                <template v-for="(day, index) in weekDays" :key="index">
                                                    <div class="active fade-in">{{ day }}</div>            
                                                </template>
                                            </main>
                                            <main class="main-days box" :class="{'rangePicker': defaults.rangePicker}">
                                                <template v-for="(monthDay, index) in getMonthCalendarDays(addMonth(picker.date, x - 1))" :key="index">
                                                    <template v-if="monthDay && monthDay?.date">
                                                        <template v-if="defaults.rangePicker">
                                                            <div 
                                                            @click.stop="onlyCustRange ? false : fn.conditionalSelection(monthDay)"
                                                            @mouseenter="onlyCustRange ? false : hoverDate = monthDay.date"
                                                            class="fade-in"
                                                            :date="monthDay.date"
                                                            :class="{ 
                                                                'active':  skipHighlighterDefaultClassess == false && (picker.date1 === picker.date2) && (picker.date1 === monthDay.date),
                                                                'offset-date': !monthDay.currentMonth,
                                                                'start-date': skipHighlighterDefaultClassess == false && (monthDay.date === picker.date1) && (picker.date1 != picker.date2),
                                                                'end-date': skipHighlighterDefaultClassess == false && (monthDay.date === picker.date2) && (picker.date1 != picker.date2),
                                                                'date-in-selected-range': skipHighlighterDefaultClassess == false && fn.isInSelectedDate(monthDay),
                                                                'hover-date': fn.isHoverDate(monthDay),
                                                                ['not-in-minmax-date' + (hideDateOutOfMinMax ? ' hideDateOutOfMinMax' : '')]: !isInMinMaxDate(monthDay.date, defaults),
                                                                'date-allow-only-from-range': onlyCustRange,
                                                                ['theme-' + theme]: true,
                                                                ['highlight__' + isAvailableByDate(availables, makeDate, monthDay)?.['highlight']]: skipHighlighterDefaultClassess == true, /**higlighiligh default classes */
                                                            }">
                                                                {{ monthDay.day_index }}
                                                                <template v-if="isAvailableByDate(availables, makeDate, monthDay)?.['available']">
                                                                    <div class="availableInDates">{{ isAvailableByDate(availables, makeDate, monthDay)?.['available'] }}</div>
                                                                </template>
                                                            </div>
                                                        </template>
                                                        <template v-else>
    
                                                            <template v-if="isUsingRandomSelection">
                                                                <div 
                                                                    @click.stop="toggleRandomDates(monthDay.date)"
                                                                    @dblclick.stop="()=>{
                                                                        toggleRandomDates(monthDay.date);
                                                                        if(isInMinMaxDate(monthDay.date, defaults)){
                                                                            fn.onClickApply()
                                                                        }
                                                                    }"
                                                                    class="fade-in"
                                                                    @contextmenu="log(pickerValues.dates)"
                                                                    :class="{ 
                                                                        'active': skipHighlighterDefaultClassess == false && pickerValues.dates.includes(monthDay.date),
                                                                        'offset-date': !monthDay?.currentMonth,
                                                                        ['not-in-minmax-date' + (hideDateOutOfMinMax ? ' hideDateOutOfMinMax' : '')]: !isInMinMaxDate(monthDay.date, defaults),
                                                                        ['theme-' + theme]: true,
                                                                        ['highlight__' + isAvailableByDate(availables, makeDate, monthDay)?.['highlight']]: skipHighlighterDefaultClassess == true, /**higlighiligh default classes */
                                                                    }
                                                                    ">
                                                                        {{ monthDay?.day_index }}
                                                                        <template v-if="isAvailableByDate(availables, makeDate, monthDay)?.['available']">
                                                                            <div class="availableInDates">{{ isAvailableByDate(availables, makeDate, monthDay)?.['available'] }}</div>
                                                                        </template>
                                                                    </div> 
                                                            </template>
                                                            <template v-else>
                                                                <div 
                                                                @click.stop="fn.onClickDay(monthDay)"
                                                                @dblclick.stop="fn.onClickApply()"
                                                                class="fade-in"
                                                                :date="monthDay.date"
                                                                :pickerDate1="picker.date1"
                                                                :class="{ 
                                                                    'active': skipHighlighterDefaultClassess == false && picker.date1 == monthDay.date,
                                                                    ['not-in-minmax-date' + (hideDateOutOfMinMax ? ' hideDateOutOfMinMax' : '')]: !isInMinMaxDate(monthDay.date, defaults),
                                                                    'offset-date': !monthDay?.currentMonth,
                                                                    ['theme-' + theme]: true,
                                                                    ['highlight__' + isAvailableByDate(availables, makeDate, monthDay)?.['highlight']]: skipHighlighterDefaultClassess == true, /**higlighiligh default classes */
                                                                }
                                                                "                                                 
                                                                >
                                                                    {{ monthDay?.day_index }}
                                                                    <template v-if="isAvailableByDate(availables, makeDate, monthDay)?.['available']">
                                                                        <div class="availableInDates">{{ isAvailableByDate(availables, makeDate, monthDay)?.['available'] }}</div>
                                                                    </template>
                                                                </div>                                                    
                                                            </template>
                                                            
                                                        </template>
                                                    </template>
                                                </template>
                                            </main>                                
                                            <Buttons :x="x"
                                            :defaults="defaults"
                                            @onCancel="fn.cancelPicker()"
                                            @onApply="fn.onClickApply()"
                                            @onToday="fn.onClickToday()"
                                            ></Buttons>
                                            <Documentation v-if="showDocumentation" ></Documentation>
                                            <div v-if="defaults?.documentation" class="documentation-toggler" @click.stop="showDocumentation = !showDocumentation" >Documentation</div>
                                            
                                            <div v-if="openTimePicker==true" class="time-picker-display-area" @click.stop="openTimePicker=false">
                                                <div>
                                                    <TimePicker ref="timePickerComponent" :justInitializeValue="justInitializeValue" :displayTime="!swither400pxWidth"
                                                    :showingInRightSide="false"
                                                    :inDatePicker="true"
                                                    @close="()=>{
                                                        openTimePicker = false
                                                    }" 
                                                    @hidePopup="()=>{
                                                        openTimePicker = false
                                                    }" 
                                                    @changeTime="(data)=>{
                                                        delete data.inDatePicker;
                                                        fn.onOkTimePicker({...data, do_not_hide: true});
                                                    }"
                                                    ></TimePicker>
                                                </div>
                                            </div>
                                        </div>
                                        
                                    </template>
                                    <template v-else-if="current_view == 'months'">
                                        <div class="months-box content" @click.stop="false">
                                            <header class="header" >
                                                <Arrow to="left" @click="fn.onClickPrev()" class="deactive" :color="color_font_dark" size="12px"></Arrow>
                                                <span class="cp" @click="false">{{ makeDate(picker?.date1, FORMATS.month) }}</span>
                                                <Arrow to="right" class="deactive" :color="color_font_dark" size="12px"></Arrow>
                                            </header>
                                            <main class="main-months box">
                                                <template v-for="(monthShort, index) in monthShorts" :key="index">
                                                    <div 
                                                    :class="{
                                                        ['theme-' + theme]: true,
                                                        'active': makeDate(picker?.date1, FORMATS.monthShort) === monthShort
                                                        }" 
                                                    @click="fn.onClickMonth(index)">{{ monthShort }}</div>
                                                </template>
                                            </main>
                                            <Buttons :x="x"
                                            :defaults="defaults"
                                            @onCancel="fn.cancelPicker()"
                                            @onApply="fn.onClickApply()"
                                            @onToday="fn.onClickToday()"
                                            :applyBtn="false"
                                            ></Buttons>
                                        </div>
                                    </template>
                                    <template v-else-if="current_view == 'years'">
                                        <div class="months-box content" @click.stop="false">
                                            <header class="header" >
                                                <Arrow to="left" @click="fn.onClickPrev()"  :color="color_font_dark" size="12px"></Arrow>
                                                <span>{{ years[0] }} - {{ years[years?.length - 1] }}</span>
                                                <Arrow to="right" @click="fn.onClickNext()" :color="color_font_dark" size="12px"></Arrow>
                                            </header>
                                            <main class="main-months box">
                                                <template v-for="(year, index) in years" :key="index">
                                                    <div 
                                                    :class="{
                                                        ['theme-' + theme]: true,
                                                        'active': new Date(picker.date1).getFullYear() == year
                                                        }" 
                                                    @click="fn.onClickYear(year)"> {{ year }}</div>
                                                </template>
                                            </main>
                                            <Buttons :x="x"
                                            :defaults="defaults"
                                            @onCancel="fn.cancelPicker()"
                                            @onApply="fn.onClickApply()"
                                            @onToday="fn.onClickToday()"
                                            :applyBtn="false"
                                            ></Buttons>
                                        </div>
                                    </template>
    
                                    <div v-if="defaults?.allowRightSideTimePicker && defaults?.timePicker && windowInnerWidth_more_than_590" class="right-side-time-picker-area" >
                                        <template v-if="x == calendarQuantity">                                           
                                            <TimePicker ref="timePickerComponent" :justInitializeValue="justInitializeValue" :displayTime="!swither400pxWidth"
                                            :showingInRightSide="true"
                                            :multiCalendarLastItem="true"
                                            @close="fn.onCloseTimePicker" 
                                            @changeTime="fn.onOkTimePicker">
                                            </TimePicker>
                                        </template>
                                    </div>
                                        
                                </template>
                            </template>
                        </div>
                    </div>

                </div>
            </template>        
        </template>
    </div>



</template>


<style scoped>
.main-content-of-picker{
    background-color: v-bind(color_body_bg);
    border-radius: 6px;
}
.switcher-intop-of-calendar-and-timepicker{
    display: flex;
    justify-content: center;
    margin: 0px 20px 0px 20px;
    padding-top: 20px;
}
.switcher-intop-of-calendar-and-timepicker.using-range{
    margin-left: 160px;
}
.switcher-intop-of-calendar-and-timepicker > div.defined-width{
    width: 100%;
}
.switcher-intop-of-calendar-and-timepicker > div.defined-width.multi-calendar{
    width: 400px;
}
.calendar-one-more{
    background-color: v-bind(color_body_bg);
    border-radius: 6px;
}
.use-custom-range,
.has-timepicker-in-right-site
{
    display: flex;
    justify-content: flex-start;
    position: relative;
}
.has-timepicker-in-right-site.calendarQuantity-1
{
    justify-content: center;
    border-radius: 6px;
}
.has-timepicker-in-right-site
{
    align-items: flex-start;
    padding-right: 20px;
    padding-bottom: 0px;
    border-top-right-radius: 6px;
    border-bottom-right-radius: 6px;
    background-color: v-bind(color_body_bg);
}

.use-custom-range ul.range-list{
    padding: 10px 0px 20px 20px;
    width: 140px;
    border-top-left-radius: 6px;
    border-bottom-left-radius: 6px;
    background-color: v-bind(color_body_bg);
    padding-top: 33px;
    height: 460px;
    padding-right: 10px;
    overflow-y: auto;
}
.use-custom-range ul.range-list .range-title{
    margin-bottom: 10px;
    font-size: 14px;
    color: v-bind(color_font_dark);
}
.use-custom-range ul.range-list .range-alert{
    margin-bottom: 10px;
    font-size: 12px;
    color: #e14e19; /* redcolor */
    text-align: center;
    line-height: 12px;
    border: 1px solid #ff5c0017;
    border-radius: 5px;
    padding: 5px 4px;
    background-color: #ff5c0029;
}
.use-custom-range .range-toggler{
    display: none;
    transition: all 0.3s;
}
.use-custom-range ul.range-list li.range{
    padding: 5px 5px;
    color: v-bind(color_font_dark);
    border: 1px solid v-bind(color_font_dark_low);
    border-radius: 6px;
    margin-bottom: 10px;
    width: 100%;
    cursor: pointer;
}
.use-custom-range ul.range-list li.range:not(.out-of-min-max-date):hover,
.use-custom-range ul.range-list li.range:not(.out-of-min-max-date).active {
    border: 1px solid v-bind(color_primary_bg);
    background-color: v-bind(color_transparent_1);
}

.use-custom-range ul.range-list li.range.out-of-min-max-date {
    border: 1px solid #e14e19; /* redcolor */
    background-color: #e14e19; /* redcolor */
    cursor: not-allowed;
}




.content {
    display: grid;
    grid-template-rows: 40px 1fr;
    gap: 20px;
    padding: 20px;
    width: fit-content;
}


:has(.use-custom-range) .range-list ~ .content{
    border-top-left-radius: 0px;
    border-bottom-left-radius: 0px;
}

@media screen and (max-width: 700px) {
    .use-custom-range ul.range-list{
        position: absolute;
        z-index: 9;
        background-color: v-bind(color_body_bg);
        padding-right: 20px;
        border-right: 1px solid v-bind(color_primary_bg);
        border-top-right-radius: 6px;
        border-bottom-right-radius: 6px;
        box-shadow: 2px 0px 3px var(--color_transparent_1);
        transform: translateX(-100%);
        opacity: 0;
        width: 150px;
        pointer-events: none;
        transition: all 0.3s;
    }
    .use-custom-range ul.range-list.active{
        transform: translateX(0);
        opacity: 1;
        pointer-events: all;
    }

    .use-custom-range .range-toggler{
        background-color: v-bind(color_primary_bg);
        display: inline-table;
        position: absolute;
        top: 47%;
        left: -40px;
        width: 30px;
        height: 20px;
        z-index: 10;
        line-height: 20px;
        transform: rotate(-90deg);
        text-align: -webkit-match-parent;
        padding: 0px 6px;
        border-radius: 5px 5px 0 0;
        font-size: 15px;
        cursor: pointer;
    }
    .use-custom-range .range-toggler.active{
        left: 130px;       
        border-radius: 0 0 5px 5px;
    }

    .use-custom-range .range-list ~ .content{
        border-top-left-radius: 6px;
        border-bottom-left-radius: 6px;
    }
}



.header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    font-weight: 600;
    color: v-bind(color_font_dark);
}

.header i {
    padding: 16px;
    border-radius: 50%;
    color: v-bind(color_font_dark);
    font-size: 20px;
    cursor: pointer;
}

.header i:hover {
    /*background-color: #ECE0FD;*/
    background-color: v-bind(color_transparent_1);
}

.header span {
    font-size: 14px;
}

.main-months {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 16px;
}

.main-weekdays{
    font-size: 15px;
}
.main-weekdays,
.main-days {
    display: grid;
    grid-template-columns: repeat(7, 1fr);
    gap: 0px;
    row-gap: v-bind(get_row_gap);
    column-gap: v-bind(get_column_gap);
}
.main-weekdays>div{
    text-align: center;
    color: v-bind(color_font_dark);
}

.main-months>div {
    width: 82px;
    height: 40px;
    display: flex;
    align-items: center;
    justify-content: center;
    color: v-bind(color_font_dark_low);
    transition: all 300ms;
    font-size: 14px;
}
.main-months>div:not(.date-allow-only-from-range),
.main-days>div:not(.date-allow-only-from-range)
 {
    cursor: pointer;
}

.main-days>div {
    width: calc(39px + var(--adjustCalendarDayWidth));
    height: calc(36px + var(--adjustCalendarDayHeight));
    display: flex;
    position: relative;
    align-items: center;
    justify-content: center;
    color: v-bind(color_font_dark);
    transition: all 300ms;
    font-size: 15px;
}

.main-days>div > .availableInDates:not(:empty) {
    position: absolute;
    width: calc(100% - 4px);
    height: 16px;
    background: v-bind(color_transparent_2);
    color: v-bind(color_primary_bg);
    text-align: center;
    bottom: -17px;
    left: 2px;
    font-size: 10px;
    border-radius: 3px;
    font-weight: bold;
}
.main-days>div > .availableInDates:empty {
    display: none;
}
.main-months>div.offset-date:not(.start-date):not(.end-date):not(.date-in-selected-range),
.main-days>div.offset-date:not(.start-date):not(.end-date):not(.date-in-selected-range):not(.hideDateOutOfMinMax) {
    color: v-bind(color_date_disable) !important;
}

main.box>div:not(.active):not(.offset-date):not(.date-in-selected-range):not(.start-date):not(.end-date):not(.date-allow-only-from-range):hover
 {
    background-color: v-bind(color_transparent_1);
    color: v-bind(color_font_dark);
    border-radius: 3px;
}

div.hover-date {
    background-color: v-bind(color_transparent_1) !important;
    color: v-bind(color_font_dark);
    border-radius: 0px !important;
}

main.box>div:not(.offset-date),
main.box>div:not(.offset-date).active 
{
    border-radius: 4px;
}

main.box>div:not(.offset-date).active {
    background: v-bind(color_primary_bg);
    font-weight: 600;
    position: relative;
}

main.box>div:not(.offset-date).theme-light.active {
    color: v-bind(color_font_light) !important;
}

main.box>div:not(.offset-date).theme-dark.active {
    color: v-bind(color_font_dark) !important;
}

main.box>div.start-date {
    background: v-bind(color_primary_bg);
    border-radius: 8px 0px 0px 8px;
}

main.box>div.start-date.theme-light {
    color: v-bind(color_font_light) !important;
}

main.box>div.start-date.theme-dark {
    color: v-bind(color_font_dark) !important;
}

main.box>div.end-date {
    background: v-bind(color_primary_bg);
    border-radius: 0px 8px 8px 0px;
}

main.box>div.end-date.theme-light {
    color: v-bind(color_font_light) !important;
}

main.box>div.end-date.theme-dark {
    color: v-bind(color_font_dark) !important;
}

main.box>div.date-in-selected-range {
    background: v-bind(color_transparent_1);
    border-radius: 0px;
}

.buttons{
    display: flex;
    justify-content: end;
}
.buttons .btn-cancel, .btn-apply{
    padding: 6px 10px;
    border:none;
    text-align: center;
    border-radius: 4px;
}
.buttons .btn-cancel{
    color: v-bind(color_font_dark);
    background-color: v-bind(color_bg_grey);
}
.buttons.adjustment-weekday{
    flex-direction: column;
}
.buttons .btn-cancel:has(~.btn-apply){
    margin-right: 6px;
}
.buttons .btn-apply{
    color: v-bind(color_font_light);
    background-color: v-bind(color_primary_bg);
}
.deactive{
    visibility: hidden;
    pointer-events: none;
}
.highlight__red,
.highlight__green,
.highlight__yellow{
    border-radius: 50% !important;
}
.highlight__red.offset-date,
.highlight__green.offset-date,
.highlight__yellow.offset-date{
    opacity: 0.8;
}
.highlight__red{
    background-color: #e14e19; /* redcolor */
}
.highlight__green{
    background-color: #10b105; /* redcolor */
}
.highlight__yellow{
    background-color: #c49d1f; /* redcolor */
}
.not-in-minmax-date{
    text-decoration: line-through;
    cursor: no-drop !important;
}
.not-in-minmax-date.hideDateOutOfMinMax{
    opacity: 0.8 !important;
    color: transparent !important;
    border-radius: 4px;
    pointer-events: none;
    border: 1px solid v-bind(color_soft_border) !important;
    
}
div:has(>.time-picker-display-area){
    position: relative;
}
.time-picker-display-area{
    width: 100%;
    height: 100%;
    display: flex;
    justify-content: center;
    align-items: center;
    position: absolute;
    z-index: 9999999;
    background-color: #0000008a;
    backdrop-filter: blur(0px);
}
.time-picker-display-area{
    width: 100%;
    height: 100%;
    display: flex;
    justify-content: center;
    align-items: center;
    position: absolute;
    z-index: 9999999;
    background-color: #0000008a;
    -webkit-backdrop-filter: blur(0px);
    backdrop-filter: blur(0px);
}
.time-picker-display-area>div {
    animation: modalOpen .3s ease-out forwards;
    box-shadow: 0 4px 96px #0000004d;
}
@keyframes modalOpen {
  from {
    opacity: 0;
    transform: translate(0%, 60%) scale(0.8);
  }
  to {
    opacity: 1;
    transform: translate(0%, 0%) scale(1);
  }
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

.single-calendar{
    display: flex;
    justify-content: space-around;
    flex-wrap: nowrap;
}
.multi-calendar.scroll,
.multi-calendar.flex-start,
.multi-calendar.flex-end,
.multi-calendar.flex-center,
.multi-calendar.flex-around,
.multi-calendar.flex-between,
.multi-calendar.flex-evenly{
    display: flex;
    flex-wrap: wrap;
}

.multi-calendar.scroll{
    overflow-x: auto;
    border-radius: 6px;
    justify-content: space-around;
    flex-wrap: nowrap;
}
.multi-calendar.flex-start{
    justify-content: start;
}
.multi-calendar.flex-end{
    justify-content: end;
}
.multi-calendar.flex-center{
    justify-content: center;
}
.multi-calendar.flex-around{
    justify-content: space-around;
} 
.multi-calendar.flex-between{
    justify-content: space-between;
} 
.multi-calendar.flex-evenly{
    justify-content: space-evenly;
} 

.right-side-time-picker-area{
    margin-top: 34px;
    display: flex;
    justify-content: center;
    flex-direction: column;
    align-items: center;
}

</style>

<style>
.documentation-toggler{
    font-size: 10px;
    position: absolute;
    bottom: -19px;
    padding: 2px 6px;
    right: calc(50% - 46px);
    border-radius: 0px 0px 3px 3px;
    color: v-bind(color_font_dark);
    background-color: v-bind(color_body_bg);
    box-shadow: 0px 3px 3px #00000036;
    cursor: pointer;
    z-index: 9;
}
</style>