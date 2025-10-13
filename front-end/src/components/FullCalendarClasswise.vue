<script>
// https://fullcalendar.io/docs
// Stable Versions installation command: 
// npm install @fullcalendar/core@6 @fullcalendar/vue3@6 @fullcalendar/daygrid@6 @fullcalendar/interaction@6

import moment from 'moment/moment';
import FullCalendar from '@fullcalendar/vue3'
import dayGridPlugin from '@fullcalendar/daygrid'
import interactionPlugin from '@fullcalendar/interaction'
import { inject, ref, reactive, onMounted, onBeforeUnmount, computed, watch } from "vue";
import helper from './../utilities/helper/index'

export default {
  components: { 
    FullCalendar // make the <FullCalendar> tag available
  },
  emits: ['initAndNextPrev', 'add-vacation'],
  props: {
    modelValue: {
      type: Object,
      default: () => ({}),
    },
    events: {
      type: Array,
      default: () => [
        {
          id: 'a',
          title: 'loading...',
          start: moment().startOf('month').format('YYYY-MM-DD'),
          end: moment().endOf('month').format('YYYY-MM-DD'),
          backgroundColor: 'green',
          borderColor: 'green',
          isMirror: true,
        }
      ],
    },
  },
  data() {
    return {
      calendarOptions: {
        plugins: [ dayGridPlugin, interactionPlugin ],        
        initialView: 'dayGridMonth', // values: dayGridMonth | dayGridDay 
        weekends: true,
        headerToolbar: {
          left: 'myCustomButton',
          center: 'title',
          right: 'today prev,next'
        },
        dayCellContent: this.renderDayCellContent,
        eventContent: this.renderEventContent,
        dateClick: this.handleDateClick, 
        eventClick: ({ event }) => {
          console.log({event});
        },
        datesSet: (data) => {
          // It will call initially and every next/previous click
          let date_range = { start_date: moment(data.start).format('YYYY-MM-DD'), end_date: moment(data.end).format('YYYY-MM-DD') }
          this.$emit('initAndNextPrev', date_range)
        },
        events: this.$props.events, 
        customButtons: {
          myCustomButton: {
            text: 'Add New Vacation', 
            click: ()=>{
              this.$emit('add-vacation', 'this.$props')
            }
          }
        },
      },
    }
  },
  watch: {
    events: {
      handler(newVal) {
        if(!this.isFirstTime){
          this.isFirstTime = true
          this.viewLoading()
        }else{
          this.calendarOptions.events = newVal
        }
      },
      deep: true,
      immediate: true
    }
  },
  methods: {
    viewLoading: function() {
      let dateArray =  helper.createDateRange(moment().startOf('month').format('YYYY-MM-DD'), moment().endOf('month').format('YYYY-MM-DD'), 'day')
      let _events = []
      dateArray.forEach((date)=>{
        _events.push({
          id: 'a',
          title: `<span class="spinner-border text-secondary ms-1 fs-6" style="--bs-spinner-width: 20px;--bs-spinner-height:20px;--bs-spinner-border-width: 2px;"></span>`,
          start: date,
          end: date,
          backgroundColor: '#b5666600',
          borderColor: 'transparent',
          textColor: 'black',
          isMirror: false,
          is___custom: true
        })
      })
      this.calendarOptions.events = _events
    },
    handleDateClick: function(data) {
      let date__ = data.dateStr
      console.log({date__, data})
      console.log(data.jsEvent.target.outerHTML)
    },
    toggleWeekends: function() {
      this.calendarOptions.weekends = !this.calendarOptions.weekends // toggle the boolean!
    },
    renderDayCellContent: function(arg) {
      /** 
       * Available properties in arg:
        "date" : ddate object of the day cell
        "view" : the current view object
        "dow" : day of week, 0=Sun, 1=Mon, ..., 6=Sat
        "isDisabled" : boolean
        "isOther" : boolean
        "isToday": boolean
        "isPast": boolean
        "isFuture": boolean
        "isMonthStart": boolean
        "dayNumberText": string (localized) day number of the cell
       */
      let html_array = ['<div class="fc-daygrid-day-number">' + arg.dayNumberText + '</div>']
      html_array.push(`
        <div>
          <span class="badge bg-secondary cp" tooltip="Add Event" >+</span>
        </div>
      `)
      return {html: html_array.join('')}
    },
    renderEventContent: function(arg) {
      /**
       * Available properties in arg:
       * ============================
        {
          "event": {
            "allDay": true,
            "title": "my event",
            "start": "2025-10-11",
            "end": "2025-10-15",
            "id": "a"
          },
          "view": {},
          "timeText": "",
          "textColor": "",
          "backgroundColor": "",
          "borderColor": "",
          "isDraggable": false,
          "isStartResizable": false,
          "isEndResizable": false,
          "isMirror": false,
          "isStart": false,
          "isEnd": true,
          "isPast": false,
          "isFuture": false,
          "isToday": true,
          "isSelected": false,
          "isDragging": false,
          "isResizing": false
        }
       */
      console.log('arg.event.tooltip', arg.event.extendedProps.tooltip);
      let tooltip = arg.event.extendedProps.tooltip
      return { html: `<b class="ps-2" tooltip="${tooltip || ''}">` + arg.event.title + '</b>' }
    }
  }
}
</script>
<template>
  <FullCalendar :options="calendarOptions" />
  <RightBar v-if="showRightbar" ref="rightbar" @unmount="showRightbar = false"></RightBar>
</template>


<style>
.fc .fc-toolbar {
    align-items: center !important;
    background-color: white;
    padding: 6px;
}
.fc .fc-button { 
    padding: 3px 5px !important; 
}
.fc .fc-toolbar-title {
    font-size: 20px !important; 
}
.fc .fc-today-button,
.fc .fc-button {
  text-transform: capitalize;
}
.fc .fc-toolbar.fc-header-toolbar {
    margin-bottom: 0px;
}
.calendar-weekend-bg{
  background-color: #e28e95db !important;  
}
.calendar-vacation-bg{
  background-color: #f3828b !important;  
}
.fc .fc-daygrid-day-bg .fc-bg-event{
  overflow: hidden;
}
</style>