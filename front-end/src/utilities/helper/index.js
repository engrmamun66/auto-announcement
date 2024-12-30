import moment from 'moment/moment';

const helper = { 
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
    miliseconds: function(time_24=''){
      
      let dateObj = new Date()
      
      if(time_24){
        let [hours, minutes] = time_24.split(":") 
        dateObj.setHours(parseInt(hours))
        dateObj.setMinutes(parseInt(minutes))
        dateObj.setSeconds(0)      
      }
      
      let miliseconds = dateObj.getTime()
      return miliseconds
    },
    formatTime: function(time_24){
      let dateObj = new Date()
      
      if(time_24){
        let [hours, minutes] = time_24.split(":") 
        dateObj.setHours(parseInt(hours))
        dateObj.setMinutes(parseInt(minutes))
        dateObj.setSeconds(0)      
      }

      return moment(dateObj).format('hh:mm A')
       
    }
}

export default helper