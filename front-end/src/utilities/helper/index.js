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
    device: function() {
        const getType = () => {
            if (/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)) {
                return 'mobile';
            }
            else if (/iPad/i.test(navigator.userAgent)) {
                return 'tablet';
            }
            else {
                return 'desktop';
            }
        }

        function DeviceType(){
            this.type = getType();
        }

        DeviceType.prototype.is = function (deviceType='') {
            return deviceType ? this.type === deviceType : false;
        }

        DeviceType.prototype.in = function (deviceTypes=[]) {
            if(deviceTypes && Array.isArray(deviceTypes) && deviceTypes?.length){
                return deviceTypes.includes(this.type);
            } else {
                return false;
            }
        }

        DeviceType.prototype.isMobile = function (extra=null) {
            return this.type === 'mobile';
        }

        DeviceType.prototype.isTable = function () {
            return this.type === 'tablet';
        }

        DeviceType.prototype.isDesktop = function () {
            return this.type === 'desktop';
        }

        return new DeviceType();        

    }, 
}

export default helper