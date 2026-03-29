import moment from 'moment/moment';
import { useRoute, useRouter } from "vue-router";

const helper = { 
    log: console.log,
    goto: function(payload){
      let route = null
      let router = null
      try {
        route = useRoute()
        router = useRouter()
      } catch (e) {}

      if (!router && globalThis.__app_router) {
        router = globalThis.__app_router
        route = router?.currentRoute?.value || null
      }

      if (!router) return
      let dev = route?.query?.dev === 'true'
      if(dev) payload.query = { ...(payload.query || {}), dev: true} 
      router.push(payload)
    },
    listGroupBy: function (array, property) {
      if (!array?.length || !property) return {};
      return array.reduce((result, obj) => {
        const key = obj[property];
        if (!result[key]) {
          result[key] = [];
        }
        result[key].push(obj);
        return result;
      }, {});
    },
    randomBetween: function (min, max) {
        return Math.floor(Math.random() * (max - min + 1) + min)
    }, 
    copyToClipboard: function(text='', {el=null}={}) {
      if(text){
        const textarea = document.createElement("textarea");
        textarea.value = text;
        textarea.style.position = "fixed";
        textarea.style.left = "-9999px";
        document.body.appendChild(textarea);
        textarea.select();
        try {
            document.execCommand("copy");
        } catch (err) {
            console.error("Failed to copy text", err);
        }
        document.body.removeChild(textarea);
        if(el && el instanceof HTMLElement){
          el.setAttribute('tooltip', 'copied');
          setTimeout(() => {
            el.setAttribute('tooltip', 'copy');          
          }, 1000);
        }
      }
    },
    localStorage: function (name, __defaultValue=undefined) {
      return {
        get value() {
          if (typeof process == "undefined") {
            var process = { client: true };
          }
          if (process.client && globalThis.localStorage) {
            let data = globalThis.localStorage.getItem(name);
            if(!data) return __defaultValue

            let parts = data.split('::')
            let type = 'string'
            if(parts.length > 1){
              type = parts[0]
              data = parts.slice(1).join('')
            }


            if (
              (data && data?.startsWith("{") && data?.endsWith("}")) ||
              (data?.startsWith("[") && data?.endsWith("]"))
            ) {
              data = JSON.parse(data);
            }
            if(type == 'boolean'){
              return data === 'true' ? true : false
            }
            else if(type == 'number'){
              return Number(data)
            }
            else  {
              return data;
            }
          }
        },
        set value(value) {

          let type = typeof value
          if (typeof process == "undefined") {
            var process = { client: true };
          }
          if (process.client && globalThis.localStorage) {
            if(value === null || value === ''){
              localStorage.removeItem(name)
            } else {
              if (value && typeof value === "object") {
                value = JSON.stringify(value);
              }
              let prefix = `${type}::`
              localStorage.setItem(name, prefix + value);
            }
          }
        },
      };
    }, 
    time_in_miliseconds: function(time_24=''){
      let [hours, minutes] = time_24.split(":")      
      
      let time_current= new Date().getTime()// - new Date().getMilliseconds()

      let dateObj = new Date()
      
      dateObj.setHours(parseInt(hours))
      dateObj.setMinutes(parseInt(minutes))
      dateObj.setSeconds(0)
      
      let time_future = dateObj.getTime()
      let miliseconds = Math.ceil(time_future - time_current)
      if(time_future > time_current){
          return miliseconds;
      } else {
          return 0
      } 
    }, 
    clone: function (data, { remove = [], add = {}, only = [] } = {}) {
      data = JSON.parse(JSON.stringify(data));
  
      if (data && typeof data === "object" && Array.isArray(data) === false) {
        // Delete keys
        if (remove?.length && Array.isArray(remove)) {
          remove.forEach((key) => {
            if (data.hasOwnProperty(key)) {
              delete data[key];
            }
          });
        }
  
        // keep only
        if (only?.length && Array.isArray(only)) {
          const new_data = {};
          only.forEach((key) => {
            if (data.hasOwnProperty(key)) {
              new_data[key] = data[key];
            }
          });
          data = new_data;
        }
  
        return { ...data, ...add };
      } else {
        return data;
      }
    },
    delay: function (callback, time = 0, ...args) {
      setTimeout(() => {
        callback(...args);
      }, time);
    },
    // with Time
    // with Time
    // with Time
    // with Time
    miliseconds: function (time_24 = '') {
      let momentObject = moment();

      if (time_24) {
        time_24 = moment(time_24, ['HH:mm', 'hh:mm A'], true).format('HH:mm')
        const [hours, minutes] = time_24.split(":").map(Number);

        if (!isNaN(hours) && !isNaN(minutes)) {
          momentObject.hour(hours);
          momentObject.minute(minutes);
          momentObject.second(0);
          momentObject.millisecond(0);
        }
      }

      return momentObject.valueOf(); // returns timestamp in milliseconds
    }
    ,
    formatTime: function(time_24){
      if(/^\d{2}:\d{2}$/.test(time_24)){
        return moment(time_24, 'HH:mm').format('hh:mm A')
      } else {
        return moment(time_24, 'hh:mm A').format('hh:mm A')
      }
    },
    ms_to_hour_minute: function (milliseconds = 23434) {
      const totalSeconds = Math.floor(milliseconds / 1000); // Convert milliseconds to seconds
      const totalMinutes = Math.floor(totalSeconds / 60); // Convert seconds to minutes
      const hours = Math.floor(totalMinutes / 60); // Get the total hours
      const minutes = totalMinutes % 60; // Get the remaining minutes
      const seconds = totalSeconds % 60; // Get the remaining seconds
    
      let str = [];
      if (hours) str.push(hours + 'h');
      if (minutes) str.push(minutes + 'm');
      if (seconds) str.push(seconds + 's');
    
      return str.join(' ');
    },
    ucfirst: (str) => {
      if(!str) return ''
      str = String(str);
      return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase()
    },
    wordForm: function (word, number) {
      if (number >= -1 && number <= 1) return word;
      else return `${word}s`;
    },
    enToBnDate: function(dateText='', {bold=false}={}){
      dateText = String(dateText)
      let lang = {
        '0': '০',
        '1': '১',
        '2': '২',
        '3': '৩',
        '4': '৪',
        '5': '৫',
        '6': '৬',
        '7': '৭',
        '8': '৮',
        '9': '৯',
        January: 'জানুয়ারি',
        February: 'ফেব্রুয়ারি', 
        March: 'মার্চ', 
        April: 'এপ্রিল', 
        May: 'মে', 
        June: 'জুন', 
        July: 'জুলাই', 
        August: 'আগস্ট', 
        September: 'সেপ্টেম্বর', 
        October: 'অক্টোবর', 
        November: 'নভেম্বর', 
        December: 'ডিসেম্বর',
        Sunday: 'রবিবার',
        Monday: 'সোমবার',
        Tuesday: 'মঙ্গলবার',
        Wednesday: 'বুধবার',
        Thursday: 'বৃহস্পতিবার',
        Friday: 'শুক্রবার',
        Saturday: 'শনিবার',
        day: 'দিন',
        days: 'দিন',
      }
      if(bold){
        dateText = Array.from(dateText).map(letter => lang?.[letter] ? `<strong class="bloder-text">${lang?.[letter]}</strong>` : letter).join('')
        dateText = dateText.split(' ').map(word => {
          let trimmedWord = word.replace(/,$/g, '')
          let end_comma = /,$/g.test(word) ? ',' : ''
          return lang?.[trimmedWord] ? `<stong class="bloder-text">${lang?.[trimmedWord]}${end_comma}</stong>` : word
        }).join(' ')
      } else {
        dateText = Array.from(dateText).map(letter => lang?.[letter] ? lang?.[letter] : letter).join('')
        dateText = dateText.split(' ').map(word => {
          let trimmedWord = word.replace(/,$/g, '')
          let end_comma = /,$/g.test(word) ? ',' : ''
          return lang?.[trimmedWord] ? (lang?.[trimmedWord] + end_comma) : word
        }).join(' ')
      }
      return dateText

    },
    getShifts: function(classes, class_short, as_message){
      let shifts = classes.find(cls => cls.class_short == class_short)?.shifts || []
      if(as_message){
        return shifts.map(s => s.start + ' - ' + s.end).join(', ')
      } else {
        return shifts
      }
    },
    uniqueArray(arr) {
      return [...new Set(arr)];
    },
    // ====================================================== //
    // ================= With Full Calendar ================= //
    // ====================================================== //

    createDateRange(
      startDate = moment().startOf('month').subtract(10, 'days').format('YYYY-MM-DD'), 
      endDate = moment().endOf('month').add(10, 'days').format('YYYY-MM-DD')) {
      const start = moment(startDate);
      const end = moment(endDate);
      const range = [];

      while (start.isSameOrBefore(end)) {
        range.push(start.format('YYYY-MM-DD'));
        start.add(1, 'day');
      }
      return range;
    },
    createWeekdayEvent(date=moment().format('YYYY-MM-DD')) { 
      return ({
        title: 'Weekend',
        start: date,
        allDay: true,
        display: 'background', // "auto" | "block" | "background" | "inverse-background" | "none"
        classNames: ['calendar-weekday-bg'],
        editable: false,
        overlap: false,
        constraint: 'meetingSlot', // this is group ID as my widh=
        constraint: { start: '2025-10-10', end: '2025-10-20' },
        __isWeekend: true,
      })
    },
    createVacationEvent(start_date, end_date, vacations, reason, {backgroundColor='#e74a3b', class__short=null, student=null}={}){
      let class_shorts = vacations.map(v => v.class_short) 
      let unique_class_shorts = helper.uniqueArray(class_shorts)
      let event = {
        title: reason,
        start: start_date,
        end: moment(end_date).add(1, 'day').format('YYYY-MM-DD'), // 1 din na barale calndar e shesh din ta dekhabe na
        allDay: true,
        display: 'block',
        editable: false,
        overlap: true,
        constraint: reason, // this is group ID as my widh=
        backgroundColor,
        // Extra data
        tooltip: reason + ` For (${unique_class_shorts?.length} class${unique_class_shorts.length > 1 ? 'es' : ''})`,
        vacations: vacations || [],
      }
      if(class__short){
        event.title = reason + ` - ${class__short}`
        event.tooltip = reason + ` For (${class__short})`
      }
      if(student?.name){
        event.title = reason
        event.tooltip = reason + ` For (${student?.name})`
      }
      return event
       
    },
    // =============== End With Full Calendar =============== //
    // ====================================================== //

     
}

export default helper
 
