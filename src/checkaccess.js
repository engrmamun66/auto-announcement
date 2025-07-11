const fs = require('fs');
const path = require('path');

let access_api_key = require('./../access-apikey.example');
const googleSheetApiKey = path.join(__dirname, './../access-apikey');
if (fs.existsSync(googleSheetApiKey)) {
    access_api_key = require(googleSheetApiKey);
}
global.config = config