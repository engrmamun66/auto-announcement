const fs = require('fs');
const path = require('path');
const utils = require('./utls')

let access_api_key = require('./../access-apikey.example');
const googleSheetApiKey = path.join(__dirname, './../access-apikey');
if (fs.existsSync(googleSheetApiKey)) {
    access_api_key = require(googleSheetApiKey);
}
 
 


module.exports = {
    async CheckAppAccess(extraData={}){ 
        try {
          const response = await fetch(access_api_key, {
            method: "POST",
            headers: {
              "Content-Type": "application/json"
            },
            body: JSON.stringify({
                secret_key: global.config.env.SECRET_KEY,
                ...extraData
            })
          });
      
          const result = await response.json(); 
          let data = result.data
          delete data.secret_key
          globalThis.myAppStatus = data
          const { latest_api_url } = data

          let content = `module.exports = '${latest_api_url}'`
          fs.writeFileSync(path.join(__dirname, '../access.apikey.js'), content)
       
          return data;
        } catch (error) {
          console.error("Fetch error:", error);
          return { success: false, error: error.message };
        }
    }
}