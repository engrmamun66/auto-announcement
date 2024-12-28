import './assets/css/module.css';
import { createApp } from 'vue';
import { createPinia } from 'pinia';
import App from './App.vue';
import { send_css_in_header, minified_css } from './minified-css';
import { emitter, utils } from './import-hub';
import moment from 'moment/moment';
import { router } from './routes/index';

 
// send_css_in_header(minified_css);

globalThis.moment = moment;  

globalThis.printWarning = function(message='This is a warning', {size='22px'}={}){
    console.log(`%c ${message}`, `color:red;font-size:${size};background-color:yellow;padding:10px 20px 10px 10px;border-radius:5px;margin:10px 0px;font-family: system-ui;border:1px solid red`)
}

function makeCarcode({class_short, dakhela, year}, soundColName='sound1'){
    return ([class_short, dakhela, soundColName, year].join('-'))
}

function printDiv(divId, delay=0) {
    setTimeout(() => {
        const content = document.getElementById(divId).innerHTML;
        const printWindow = window.open('', '_blank');
        printWindow.document.open();
        printWindow.document.write(`
          <html>
            <head>
              <title>Print</title>
              <style>
                /* Add styles here for the printed content */
                body { font-family: Arial, sans-serif; margin: 20px; }
              </style>
            </head>
            <body>
              ${content}
            </body>
          </html>
        `);
        printWindow.document.close();
        printWindow.focus();
        printWindow.print();
        printWindow.close();
        
    }, delay);
}

function storage (name) {
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
}

async function mountTheApp(){
    try {
        const app = createApp(App)
        app.use(router)
        app.use(createPinia())
        let app_div = document.createElement('div');
        app_div.id = 'em-datetimepicker-doc';
        app_div.style.display = 'none';
        document.body.append(app_div);
        app
        .provide('http', utils.http)
        .provide('helper', utils.helper)
        .provide('cookie', utils.cookie)
        .provide('emitter', emitter)
        .provide('printDiv', printDiv)
        .provide('makeCarcode', makeCarcode)
        .provide('storage', storage)
        .mount('#em-datetimepicker-doc');
    } catch (error) {
        console.log({error});
    }
}

if(document.readyState === 'loading'){
    window.addEventListener("DOMContentLoaded", (e) => {
        mountTheApp();
    })
} else {
    mountTheApp();
}


globalThis.helper = utils.helper
