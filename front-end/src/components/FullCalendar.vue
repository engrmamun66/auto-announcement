<script lang="ts">
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
        eventChange: function (arg) {

        },
        headerToolbar: {
          start: "Hello",
          center: "title",
          end: "dayGridMonth",
        },
        dayCellContent: this.renderDayCellContent,
        eventContent: this.renderEventContent,
        events: [
            {
              id: 'a',
              title: 'my event',
              start: moment().format('YYYY-MM-DD'),
              end: moment().add(32, 'days').format('YYYY-MM-DD'),
            }
          ]
      }
    }
  },
  methods: {
    handleDateClick: function(arg) {
      alert('date click! ' + arg.dateStr)
    },
    toggleWeekends: function() {
      this.calendarOptions.weekends = !this.calendarOptions.weekends // toggle the boolean!
    },
    renderDayCellContent: function(arg) {
      return { html: '<div class="fc-daygrid-day-number">' + arg.dayNumberText + '</div><div class="fc-daygrid-day-events">--</div>' }
    },
    renderEventContent: function(arg) {
      return { html: '<b>' + arg.event.title + '</b>' }
    }
  }
}
</script>
<template>
   <button @click="toggleWeekends">toggle weekends</button>
  <FullCalendar :options="calendarOptions" />
</template>