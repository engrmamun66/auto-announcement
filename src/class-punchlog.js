// const sqlite3 = require("sqlite3").verbose();
const xlsx = require("xlsx");
const multer = require("multer");
const upload = multer({ dest: DIR + "/public" });
const fs = require("fs");
const path = require("path");
const moment = require('moment')
const utils = require('./utls')
 

class PunchLog { 

  punch_log_filename = 'database/' + global.config.env?.PUNCH_LOG_FILENAME || 'punch.log.json'
 
  constructor() { 
    this.createFile()
  }

  createFile(){  
    const filePath = path.join(global.DIR, this.punch_log_filename)

    if (!fs.existsSync(filePath)) {
      fs.writeFileSync(filePath, JSON.stringify([]));
      console.log('File created.');
    } 
    
  }

  _allowedDates(){
    const log_backup_days = global.config?.settings?.log_backup_days || 7
    let dateArray = Array.from({length: log_backup_days}).map((item, i)=> moment().add(i, 'day').format('Y-MM-DD'))
    return dateArray
  }


  add(req, res){ 

    const filePath = path.join(global.DIR, this.punch_log_filename) 
    if (fs.existsSync(filePath)) {
      let logs = require(filePath) || [];
      const { student } = req.body
      if(student){
        if(!logs) logs = []
        logs.unshift(student)

        let date_array = this._allowedDates()

        logs = logs.filter(item => {
          let punch_date = moment(item.punch_exact_time_text).format('Y-MM-DD')
          return date_array.includes(punch_date)
        })

        const punch_log_indent = global.config?.settings?.punch_log_indent || 0

        fs.writeFileSync(filePath, JSON.stringify(logs, null, punch_log_indent));
        return res.send({message: 'log saved'})
      }
    } 
    return res.status(500).send({message: 'log saved'})
  }

  getLog(req, res){ 

    const filePath = path.join(global.DIR, 'database/punch.log.json') 
    if (fs.existsSync(filePath)) {
      let logs = require(filePath) || [];
      const { student, date /*Y-MM-DD*/ } = req.body
      let { sound1, dakhela } = student
      sound1 = sound1.split('/').at(-1)  
 
      let filterData = logs.filter(item => {
        let item_sound1 = item.sound1.split('/').at(-1)
        let result = (item_sound1 == sound1 || item.dakhela == dakhela) 
        return result
      })

      return res.send({data: filterData})
   
    } 
    res.status(500).send({message: 'Log file not found'}) 
  }
 
  
  
  
  
}

module.exports = PunchLog;
