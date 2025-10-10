<template>
  <input
    ref="inputElement"
    type="text"
    class="form-control cb-input"
    :style="inputStyles"
    :disabled="isDisabled"
    v-bind="$attrs"
    @click="$emit('click', $event)"
  />
</template>

<script setup>
import { ref, watch, onMounted, defineEmits, useAttrs, computed, inject, getCurrentInstance } from "vue";
let moment = inject('moment')

let props = defineProps({
  modelValue: {
    default: "",
    requird: false,
  },
  modelValueType: {
    default: "object",
    requird: true,
  },
  invisible: {
    default: false,
    requird: false,
  },
  isDisabled: {
    default: false,
    requird: false,
  },
  fireNextPrevOnMount: {
    default: false,
    requird: false,
  },
  est_valid_dates: {
    default: [
      /**
       * {
       *  start: 'YYY-MM-DD',
       *  end: 'YYY-MM-DD',
       * }
       * ...
       */
    ],
    requird: false,
  },
});

let emits = defineEmits(["update:modelValue", "change", "nextPrev", "opening", "changeTime", 'click', 'initialized']);

let inputElement = ref(null);

let inputStyles = computed(() => {
  let styles = [];
  if (props.invisible) {
    styles.push("height:0px");
    styles.push("opacity:0");
    styles.push("padding:0");
    styles.push("border:none");
  }

  return styles.join(";");
});


function makeDatesObject(start = '2025-04-15', end = '2025-04-15') {
  const dateArray = {}; // Array to store the dates
  let currentDate = moment(start); // Start date
  const endDate = moment(end); // End date

  while (currentDate.isSameOrBefore(endDate)) {
      dateArray[currentDate.format('YYYY-MM-DD')] = true
      currentDate.add(1, 'day'); 
  }
  return dateArray;
}


function setHolidays () {

    let invalidDate = []

    /**
     * setHolidays
     */
    const holidays = JSON.parse(localStorage.getItem('rentmy_contents'))?.site_specific?.confg?.holidays;  
    if (Array.isArray(holidays) && holidays.length){
        invalidDate.push({
            recurring: {
                repeat: "weekly",
                weekDays: holidays.join(","),
            }, 
        });
    } 


    /**
     * set specific_holidays 
     */
    const specific_holidays = JSON.parse(localStorage.getItem('rentmy_contents'))?.site_specific?.confg?.specific_holidays;  
    if (Array.isArray(specific_holidays) && specific_holidays.length){
      specific_holidays.forEach(duration => {
        invalidDate.push({
            start: duration.start_date,
            end: duration.end_date,
        });
      })
    } 
 
 
    let { est_valid_dates } = props
    let nearest_valid_date = null
    if(est_valid_dates?.length){

      let validDates = {} 

      est_valid_dates.forEach(({start_date, end_date}) => { 
        // sel
        if(!nearest_valid_date) nearest_valid_date = start_date
        else if (new Date(nearest_valid_date) > new Date(start_date)){
          nearest_valid_date = start_date;
        }


        validDates = {...validDates, ...makeDatesObject(start_date, end_date)}

        // select neares date

      })

      let minDate = moment().subtract(2, 'years').format('YYYY-MM-DD')
      let maxDate = moment().add(99, 'years').format('YYYY-MM-DD')

       Object.keys(makeDatesObject(minDate, maxDate)).forEach(date => {
        if(validDates.hasOwnProperty(date) === false){
          invalidDate.push(date)
        } 
       })
    }

    if(inputElement.value && invalidDate.length){
        // inputElement.value.emDateTimePicker("clear_inactive_dates", null);
        inputElement.value.emDateTimePicker("set_inactive_dates", invalidDate);
        if(nearest_valid_date){
          // inputElement.value.emDateTimePicker("set_date", nearest_valid_date);
          setTimeout(() => {
            // inputElement.value.triggerEvent("change_date");
          }, 1000);
        }
    }
}

let all_attrs = useAttrs()

onMounted(() => {
  inputElement.value.addEventListener("click", () => {
    setHolidays()
    inputElement.value.emDateTimePicker(
      "set_available_in_dates",
      props.availableList
    );
  });
  inputElement.value
    .emDateTimePicker({
      ...useAttrs(),
    })
    .onEvent("initialized", (data) => {
      emits('initialized', data)
      if(props.fireNextPrevOnMount){
        setTimeout(() => {
          inputElement.value.triggerEvent('next')
        }, 100);
        setTimeout(() => {
          inputElement.value.triggerEvent('prev')
        }, 200);
      }
    })
    .onEvent("open", (data) => {
      emits('opening', true)
    })
    .onEvent("change_date", (data) => {
      emits("change", data);

      if (props.modelValueType === "string") {
        emits(
          "update:modelValue",
          `${data.startDateTime} - ${data.endDateTime}`
        );
      } else {
        emits("update:modelValue", data);
      }
    })
    .onEvent("change_time", (data) => {
      
      if (props.modelValueType === "string") {
        let time_text = all_attrs?.rangePicker ? `${data.startTime_12F} - ${data.endTime_12F}` :  data.startTime_12F
        emits( "update:modelValue", time_text );
      } else {
        emits("update:modelValue", data);
      }
      emits("changeTime", data);
    })
    .onEvent("next_prev", ({ startDateOfMonth, endDateOfMonth, startDateOfCalendar, endDateOfCalendar }) => {
      emits("nextPrev", {
        start_date: startDateOfMonth,
        end_date: endDateOfMonth,
      });

      setHolidays({startDateOfCalendar, endDateOfCalendar}) 

    });
});

defineExpose({
  target: inputElement.value,
  toggle: function () {
    inputElement.value.click();
  },
  setDate: function (...args) {
    inputElement.value.emDateTimePicker("set_date", ...args);
  },
  setDateTime: function (...args) { 
      inputElement.value.emDateTimePicker("set_date_time", ...args); 
  },
  setTime: function (...args) {
    inputElement.value.emDateTimePicker("set_time", ...args);
  },
  triggerChange: function (eventName = "change_date") {
    inputElement.value.triggerEvent(eventName);
  },
  setAvailableDates: function (data) {
    if (!data || !data?.length) return;
    inputElement.value.emDateTimePicker("set_available_in_dates", data);
  },
  updateOptions: function (options) {
    inputElement.value.emDateTimePicker("update_options", options);
  },
  clearPicker: function () {
    inputElement.value.emDateTimePicker("clear");
  },
  setHolidays: setHolidays,
});
</script>
