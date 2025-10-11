<script>
// https://fullcalendar.io/docs
import moment from 'moment/moment';
import FullCalendar from '@fullcalendar/vue3'
import dayGridPlugin from '@fullcalendar/daygrid'
import interactionPlugin from '@fullcalendar/interaction'

export default {
  components: {
    FullCalendar // make the <FullCalendar> tag available
  },
  data() {
    return {
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
              text: 'custom!', 
              click: function() {
                alert('clicked the custom button!');
              }
            }
          },
      }
    }
  },
  methods: {
    handleDateClick: function(data) {
      let date__ = data.dateStr
      console.log({date__})
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
      if(arg.isFuture){
        return {html: ''}
      } else {
        html_array.push('<div class="fc-daygrid-day-events">Hello</div>')
      }
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
</template>