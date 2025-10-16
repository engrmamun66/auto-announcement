<script>
// https://fullcalendar.io/docs
// Stable Versions installation command: 
// npm install @fullcalendar/core@6 @fullcalendar/vue3@6 @fullcalendar/daygrid@6 @fullcalendar/interaction@6

import moment from 'moment/moment';
import FullCalendar from '@fullcalendar/vue3'
import dayGridPlugin from '@fullcalendar/daygrid'
import interactionPlugin from '@fullcalendar/interaction'
import helper from './../utilities/helper/index'
import { inject, ref, reactive, onMounted, onBeforeUnmount, computed, watch } from "vue";
let CONFIG = inject('CONFIG')

export default {
  components: { 
    FullCalendar // make the <FullCalendar> tag available
  },
  emits: ['initAndNextPrev', 'advacation', 'delete', 'viewDetails'],
  props: {
    modelValue: {
      type: Object,
      default: () => ({}),
    },
    events: {
      type: Array,
      default: () => [],
    },
    weekends: {
      type: Array,
      default: () => [],
    },
    targetStudent: {
      type: [Object, null],
      default: () => null,
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
        eventClick: (eventData) => {
          let target = eventData.jsEvent.target
          if(target.hasAttribute('deleteicon')){
            this.$emit('delete', eventData.event.extendedProps)
          } else {
            if(eventData.event.extendedProps?.vacations?.length){
              this.$emit('viewDetails', eventData.event.extendedProps)
            }  
          }
        },
        datesSet: (eventData) => {
          let start_date = moment(eventData.start).format('YYYY-MM-DD')
          let end_date = moment(eventData.end).format('YYYY-MM-DD')
          let date_range = { start_date, end_date }
          this.$emit('initAndNextPrev', date_range)
        },
        events: this.$props.events, 
        customButtons: {
          myCustomButton: {
            text: 'Add New Vacation', 
            click: ()=>{
              this.$emit('advacation', 'this.$props')
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
      let date = data.dateStr
      let target = data.jsEvent.target
      if(target.hasAttribute('plusicon')){
        this.$emit('advacation', {date, target})
      }
    },
    toggleWeekends: function() {
      this.calendarOptions.weekends = !this.calendarOptions.weekends // toggle the boolean!
    },
    renderDayCellContent: function(arg) {
      
      let html_array = ['<div class="fc-daygrid-day-number">' + arg.dayNumberText + '</div>']
      let weekends = this.$props.weekends
      let day_fullname = moment(arg.date).format('dddd')
      if(!weekends.includes(day_fullname)){
        html_array.push(`
          <div>
            <span class="badge add-vacation-badge cp" tooltip="Add New" plusicon="true" >+</span>
          </div>
        `)
      }
      return {html: html_array.join('')}
    },
    renderEventContent: function(arg) {
      let tooltip = arg.event.extendedProps.tooltip
      let htmlArray = []
      htmlArray.push(`<div class="cal-day-event-item" >`)
      htmlArray.push(`<span class="event-transh-icon" deleteicon><i class='bx bxs-trash' deleteicon></i></span>`)
      htmlArray.push(`<span class="textcontent" tooltip="${tooltip || ''}" flow="top">${arg.event.title}</span>  `)
      htmlArray.push('</div>')
      return { html: htmlArray.join('') }
    },
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
 
.calendar-weekday-bg {
  background-color: #f3828b !important;  
}

.fc .fc-daygrid-day-bg .fc-bg-event{
  overflow: hidden;
}
.fc-event-main{
  cursor: pointer;
}
.fc-event-main{
  /* overflow-x: hidden; */
}
.cal-day-event-item{
  padding: 0px 5px;
  padding-left: 5px;
  transition: all 0.3s ease;
} 
 
.cal-day-event-item .event-transh-icon{
  position: absolute;
  pointer-events: none;
  pointer-events: none;
  left: -5px;
  pointer-events: none; 
  left: -5px;
  opacity: 0;
  transition: all 0.3s ease;
  cursor: pointer;
  padding: 0px 2px;
  color: rgb(221, 80, 10);
  background-color: white;
  border-radius: 3px;
  margin-right: 3px;
  left: 0px;
}
.cal-day-event-item:hover .event-transh-icon{
  position: relative;
  pointer-events: all;
  opacity: 1;
} 
.calendar-weekday-bg .event-transh-icon{
  display: none !important;
}
.add-vacation-badge{
  font-size: 14px;
  color: #8d8b8b;
  cursor: pointer;
  border: 1px solid #c8c8c8;
  line-height: 8px;
  padding-bottom: 5px;
}
</style>