<script>
// https://fullcalendar.io/docs
// Stable Versions installation command: 
// npm install @fullcalendar/core@6 @fullcalendar/vue3@6 @fullcalendar/daygrid@6 @fullcalendar/interaction@6

import moment from 'moment/moment';
import FullCalendar from '@fullcalendar/vue3'
import dayGridPlugin from '@fullcalendar/daygrid'
import interactionPlugin from '@fullcalendar/interaction'

import RightBar from './Rightbar.vue'

export default {
  components: {
    RightBar,
    FullCalendar // make the <FullCalendar> tag available
  },
  data() {
    return {
      showRightbar: false,
      calendarOptions: {
        themeSystem: 'bootstrap5',
        plugins: [ dayGridPlugin, interactionPlugin ],        
        initialView: 'dayGridMonth', // values: dayGridMonth | dayGridDay 

        weekends: true,
        dateClick: this.handleDateClick, 
        headerToolbar: {
          left: 'myCustomButton',
          center: 'title',
          right: 'today prev,next'
        },
        dayCellContent: this.renderDayCellContent,
        eventContent: this.renderEventContent,
        eventClick: ({ event }) => {
          console.log({event});
        },
        datesSet: (data) => {
          console.log('datesSet', {data});
        },
        events: [
            {
              id: 'a',
              title: 'my event',
              start: moment().format('YYYY-MM-DD'),
              end: moment().add(4, 'days').format('YYYY-MM-DD'),
              backgroundColor: 'green',
              borderColor: 'green',
              isMirror: true,
            },
            {
              id: 'b',
              title: 'my event 2',
              start: moment().format('YYYY-MM-DD'),
              end: moment().add(6, 'days').format('YYYY-MM-DD'),
            },
          ],
          customButtons: {
            myCustomButton: {
              text: 'Add Vacation', 
              click: function() {
                this.$emit('add-vacation')
              }
            }
          },
      },
    }
  },
  methods: {
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
      console.log(arg);
      return { html: '<b class="ps-2">' + arg.event.title + '</b>' }
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
</style>