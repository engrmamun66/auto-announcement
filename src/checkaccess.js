const fs = require('fs');
const path = require('path');
const utils = require('./utls')

let access_api_key = require('./../access-apikey.example');
const googleSheetApiKey = path.join(__dirname, './../access-apikey');
if (fs.existsSync(googleSheetApiKey)) {
    access_api_key = require(googleSheetApiKey);
}
 
 


module.exports = {
    async CheckAppAccess(){ 
        try {
          const response = await fetch(access_api_key, {
            method: "POST",
            headers: {
              "Content-Type": "application/json"
            },
            body: JSON.stringify({
                secret_key: global.config.env.SECRET_KEY
            })
          });
      
          const result = await response.json();
          /**
           * data example
           * =============================
            secret_key: 'YOUR_SECRET_KEY',
            prefix: 'developer',
            institute_name: 'Developer Institute',
            activation_last_date: '2025-07-17T18:00:00.000Z',
            alert_message1: 'Alert Message 1',
            alert_message2: 'Alert Message 2',
            deactivation_message: 'Deactivation message',
            is_active: true,
            latest_api_url: ''
           */
          let data = result.data
          globalThis.myApp = data
          return data;
        } catch (error) {
          console.error("Fetch error:", error);
          return { success: false, error: error.message };
        }
    }
}