<script setup>
import {moment, clone} from './childs/grand-childs/helper';
import EmDateTimePicker from './EmDateTimePicker.vue'
import { ref, provide, reactive, computed, defineProps, watch, onMounted, useAttrs } from 'vue';
function makeDate(dateTime, format, {hour, minute}={}){
    if(!dateTime) return;
    if(dateTime instanceof Date){
        var date = dateTime;
    } else {
        var date = new Date(dateTime);
    }
    date.setHours(Number(hour ?? 0));
    date.setMinutes(Number(minute ?? 0));
    let details = { 
        date: date.getDate(),
        month: date.getMonth(),
        year: date.getFullYear(), 
        hour: date.getHours(),
        minute: date.getMinutes(),
        second: date.getSeconds(),
    };
    return moment().set(details).format(format);
}


let options = reactive({
    rangePicker: false,
    displayFormat: '',
    startDate: makeDate(new Date(), 'DD MMM, YYYY'),
    endDate: makeDate(new Date(), 'DD MMM, YYYY'),
    startTime: '08:30 AM',
    endTime: '09:30 AM',
    minDate: '',
    maxDate: '',
    adjustWeekday: 0,
    buttons: {
        todayBtn: 'Today',
        cancelBtn: 'Cancel',
        applyBtn: 'Apply',
    },
    // With Time Picker
    timePicker: false,
    onlyTimePicker: false,
    sticky: false,
    minuteStep: 5,
    use24Format: false,
    timePickerUi: 'standard',
    timePickerButtons: false,
    endTimeAutoValid: true,
    displayIn: 'bottom_left',
    theme: 'light',
    colors: {
        // Just change -----> "primary_bg" to adjust color according any theme color
        body_bg: '#ffffff',
        primary_bg: '#1d1b1b',      
    },
    autoOpen: false,
    invisible: false,
    isDisabled: false,
    tagName: 'input',
});

let options_default = clone(options);
options_default.displayIn = '';
let output = {};

function filterOnlyPassableOptions() {
    output = {};    
    Object.keys(options).forEach(key => {
        let item = options[key];
        let item_default = options_default[key];
        if((typeof item == 'object') && !Array.isArray(item)){
            output[key] = {};
            Object.keys(options[key]).forEach(_key => {        
                if(item_default[_key] != item[_key]){
                    output[key][_key] = options[key][_key];
                }
            })
            if(Object.keys(output[key])?.length == 0) delete output[key];
        } else {
            if(item_default != item){
                output[key] = item;
            }
        }
    })
    if(output.displayIn == 'modal') delete output.displayIn;
    return output;
}
let optionsForAttrs = computed(() => {
    return filterOnlyPassableOptions()    
})

let showPicker = ref(true);
let inputElement = ref(null);
let eventData = ref({});
let timeout = null;
watch(optionsForAttrs, (a, b)=>{
    clearTimeout(timeout);
    showPicker.value = false;    
    timeout = setTimeout(() => {
        showPicker.value = true;
    }, 400);
})


onMounted(() => {  
    filterOnlyPassableOptions()
})

 let availableInDates = [
    {
        "available": 45489,
        "date": "2024-02-1T00:00:00",
    },
    {
        "available": 45489,
        "date": "2024-02-3T01:00:00",
    },
]
</script>


<template>
    <div class="emdemo">
        <h1>Em Datetime Picker</h1>
       <div class="row">
            <div class="col-md-6 col-12 options-selection">

               

                <div class="form-check mb-2">
                    <input class="form-check-input" type="checkbox" id="rangePicker" v-model="options.rangePicker">
                    <label class="form-check-label" for="rangePicker">
                        rangePicker
                    </label>
                </div>                
                <div class="form-check mb-2">
                    <input class="form-check-input" type="checkbox" id="timePicker" v-model="options.timePicker">
                    <label class="form-check-label" for="timePicker">
                        timePicker
                    </label>
                </div>
                <div class="form-check mb-2">
                    <input class="form-check-input" type="checkbox" id="onlyTimePicker" v-model="options.onlyTimePicker">
                    <label class="form-check-label" for="onlyTimePicker">
                        onlyTimePicker
                    </label>
                </div>
                <div class="form-check mb-2">
                    <input class="form-check-input" type="checkbox" id="onlyTimePicker" v-model="options.sticky">
                    <label class="form-check-label" for="onlyTimePicker">
                        sticky
                    </label>
                </div>
                <div class="form-check mb-2">
                    <input class="form-check-input" type="checkbox" value="" id="use24Format" v-model="options.use24Format">
                    <label class="form-check-label" for="use24Format">
                        use24Format
                    </label>
                </div>
                <div class="form-check mb-2">
                    <input class="form-check-input" type="checkbox" value="" id="timePickerButtons" v-model="options.timePickerButtons">
                    <label class="form-check-label" for="timePickerButtons">
                        timePickerButtons
                    </label>
                </div>
                <div class="form-check mb-2">
                    <input class="form-check-input" type="checkbox" value="" id="endTimeAutoValid" v-model="options.endTimeAutoValid">
                    <label class="form-check-label" for="endTimeAutoValid">
                        endTimeAutoValid
                    </label>
                </div>
                <div class="form-check mb-2 options-selection">
                    <input class="form-check-input" type="checkbox" id="isDisabled" v-model="options.isDisabled">
                    <label class="form-check-label" for="isDisabled">
                        isDisabled
                    </label>
                </div>
                <div class="form-check mb-2 options-selection">
                    <input class="form-check-input" type="checkbox" id="autoOpen" v-model="options.autoOpen">
                    <label class="form-check-label" for="autoOpen">
                        Auto open
                    </label>
                </div>
                <div class="form-check mb-2 options-selection">
                    <input class="form-check-input" type="checkbox" id="invisible" v-model="options.invisible">
                    <label class="form-check-label" for="invisible">
                        invisible
                    </label>
                </div>


                

                <div class="form-group mb-2 d-flex justify-content-between align-items-center">
                    <label for="startDate">startDate</label>
                    <input type="text" class="form-control" id="startDate" v-model="options.startDate">
                </div>
                <div class="form-group mb-2 d-flex justify-content-between align-items-center">
                    <label for="endDate">endDate</label>
                    <input type="text" class="form-control" id="endDate" v-model="options.endDate">
                </div>

                <div class="form-group mb-2 d-flex justify-content-between align-items-center">
                    <label for="startDate">startTime</label>
                    <input type="text" class="form-control" id="startTime" v-model="options.startTime">
                </div>
                <div class="form-group mb-2 d-flex justify-content-between align-items-center">
                    <label for="endDate">endTime</label>
                    <input type="text" class="form-control" id="endTime" v-model="options.endTime">
                </div>

                <div class="form-group mb-2 d-flex justify-content-between align-items-center">
                    <label for="minDate">minDate</label>
                    <input type="text" class="form-control" id="minDate" v-model="options.minDate">
                </div>
                <div class="form-group mb-2 d-flex justify-content-between align-items-center">
                    <label for="maxDate">maxDate</label>
                    <input type="text" class="form-control" id="maxDate" v-model="options.maxDate">
                </div>
                <div class="form-group mb-2 d-flex justify-content-between align-items-center">
                    <label for="adjustWeekday">adjustWeekday</label>
                    <input type="number" min="0" class="form-control" id="adjustWeekday" v-model="options.adjustWeekday">
                </div>               
                <div class="form-group mb-2 d-flex justify-content-between align-items-center">
                    <label for="minuteStep">minuteStep</label>
                    <input type="number" min="1" class="form-control" id="minuteStep" v-model="options.minuteStep">
                </div>               
                <div class="form-group mb-2 d-flex justify-content-between align-items-center">
                    <label for="displayFormat">displayFormat</label>
                    <input type="text" class="form-control" id="displayFormat">
                </div> 
                <div class="form-group mb-2 d-flex justify-content-between align-items-center">
                    <label for="todayBtn">todayBtn</label>
                    <input type="text" class="form-control" id="todayBtn" v-model="options.buttons.todayBtn">
                </div>              
                <div class="form-group mb-2 d-flex justify-content-between align-items-center">
                    <label for="cancelBtn">cancelBtn</label>
                    <input type="text" class="form-control" id="cancelBtn" v-model="options.buttons.cancelBtn">
                </div>              
                <div class="form-group mb-2 d-flex justify-content-between align-items-center">
                    <label for="applyBtn">applyBtn</label>
                    <input type="text" class="form-control" id="applyBtn" v-model="options.buttons.applyBtn">
                </div>              
                <div class="form-group mb-2 d-flex justify-content-between align-items-center">
                    <label for="tag">tag</label>
                    <input type="text" class="form-control" id="tag" v-model="options.tagName">
                </div>              
                <div class="form-group mb-2 d-flex justify-content-between align-items-center">
                    <label for="timePickerUi">timePickerUi</label>             
                    <select class="form-control" id="timePickerUi" v-model="options.timePickerUi">
                        <option value="standard">standard</option>
                        <option value="classic">classic</option>
                    </select>
                </div>              
                
                             

            </div>
            <div class="col-md-6 col-6">
                <div class="options-selection mb-5">
                    <div class="form-group mb-2 d-flex justify-content-between align-items-center">
                        <label for="theme">theme</label>             
                        <select class="form-control" id="theme" v-model="options.theme">
                            <option value="light">light</option>
                            <option value="dark">dark</option>
                        </select>
                    </div> 
            
                        
                    <div class="form-group mb-2 d-flex justify-content-between align-items-center">
                        <label for="body_bg">body_bg</label> 
                        <input type="color" class="form-control" id="applyBtn" v-model="options.colors.body_bg">
                    </div>              
                    <div class="form-group mb-2 d-flex justify-content-between align-items-center">
                        <label for="primary_bg">primary_bg</label> 
                        <input type="color" class="form-control" id="applyBtn" v-model="options.colors.primary_bg">
                    </div>

                    <div class="form-group mb-2 d-flex justify-content-between align-items-center">
                        <label for="displayIn">displayIn</label>             
                        <select class="form-control" id="displayIn" v-model="options.displayIn">
                            <option value="modal">modal</option>
                            <option value="bottom_left">bottom_left</option>
                            <option value="bottom_right">bottom_right</option>
                            <option value="top_left">top_left</option>
                            <option value="top_right">top_right</option>
                            <option value="inline_left">inline_left</option>
                            <option value="inline_right">inline_right</option>
                            <option value="inline_center">inline_center</option>
                        </select>
                    </div>  

                </div>



                <div class="col-12">  
                    <div class="form-group mb-2">
                        <label for="inputElement"> <strong>Show output</strong> </label>
                        <template v-if="showPicker">
                            <EmDateTimePicker 
                            v-model="eventData" 
                            @change="(data)=>{eventData=data}" 
                            @nextPrevious="(data)=>{
                                console.log(data)
                            }"
                            :options="optionsForAttrs"
                            class="form-control"
                            for="for"
                            style="border: 3px solid #a9a469;"
                            :availableInDates="availableInDates"
                            ></EmDateTimePicker>
                        </template>
                    </div> 
                </div>
                <div class="col-12 mb-3">
                    <h3>All Options</h3>
<pre>{{ optionsForAttrs }}</pre>
                </div>
                <div class="col-12 mb-3">
                    <h3>Selected Value</h3>
<pre>{{ eventData }}</pre>
                </div>
            </div>
       </div>
    </div>
</template>

<style>
#em-datetimepicker-visual-demo:has(>div.emdemo){
    display: flex;
    justify-items: center;
    justify-content: center;
}
#em-datetimepicker-visual-demo > div.emdemo{
    max-width: 1000px;
}
:root { --em-primary-bg: #03915b; }
</style>

<style scoped>


.options-selection select,
.options-selection input[type=text],
.options-selection input[type=color],
.options-selection input[type=number]
{
    margin-left: 20px;
}
.options-selection label:has(~input[type=text]),
.options-selection label:has(~input[type=number]),
.options-selection label:has(~input[type=color]),
.options-selection label:has(~select)
{
    width: 200px;
}
</style>

