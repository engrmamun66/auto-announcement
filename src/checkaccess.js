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
          let data = result.data
          globalThis.myAppStatus = data
          return data;
        } catch (error) {
          console.error("Fetch error:", error);
          return { success: false, error: error.message };
        }
    }
}