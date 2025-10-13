import moment from 'moment/moment';

const helper = { 
    log: console.log,
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
    localStorage: function (name) {
        return {
          get value() {
            if (typeof process == "undefined") {
              var process = { client: true };
            }
            if (process.client && globalThis.localStorage) {
              let data = globalThis.localStorage.getItem(name);
              if (
                (data && data?.startsWith("{") && data?.endsWith("}")) ||
                (data?.startsWith("[") && data?.endsWith("]"))
              ) {
                data = JSON.parse(data);
              }
              if(data === 'true') return true
              if(data === 'false') return false
              return data;
            }
          },
          set value(value) {
            if (typeof process == "undefined") {
              var process = { client: true };
            }
            if (process.client) {
              if (value && typeof value === "object") {
                value = JSON.stringify(value);
              }
              localStorage.setItem(name, value);
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
      let dateObj = new Date()
      
      if(time_24){
        let [hours, minutes] = time_24.split(":") 
        dateObj.setHours(parseInt(hours))
        dateObj.setMinutes(parseInt(minutes))
        dateObj.setSeconds(0)      
      }

      return moment(dateObj).format('hh:mm A')
       
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
      let shifts = classes.find(cls => cls.class_short == class_short)?.shifts
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
      })
    },
    createVacationEvent(date, vacations, reason, classes=[], {backgroundColor}){
      if(vacations.length === 1){
        let vacation = vacations[0]
        return ({
          title: vacation.reason,
          start: vacation.date,
          allDay: true,
          display: 'block',
          classNames: ['calendar-vacation-bg'],
          editable: false,
          overlap: false,
          constraint: reason, // this is group ID as my widh=
          vacations,
        })
      } else{



        let class_shorts = vacations.map(v => v.class_short) 
        return ({
          title: reason,
          start: date,
          end: date,
          allDay: true,
          display: 'block',
          // classNames: ['calendar-vacation-bg'],
          editable: false,
          overlap: false,
          constraint: reason, // this is group ID as my widh=
          backgroundColor,
          // Extra data
          tooltip: reason + ` For (${class_shorts?.length} class${class_shorts.length > 1 ? 'es' : ''})`,
          vacations,
        })
      }
    },
    // =============== End With Full Calendar =============== //
    // ====================================================== //

     
}

export default helper
 