const fs = require('fs');
const path = require('path');
const utils = require('./utls') 
const moment = require('moment')
const classDB = require('./class-db')
const DB = new classDB() 

// const googleSheetApiKey = path.join(__dirname, './../access-apikey');
// if (fs.existsSync(googleSheetApiKey)) {
//     access_api_key = require(googleSheetApiKey) || access_api_key;
// }
let access_api_key = 'https://script.google.com/macros/s/AKfycbxB9NH2EcezdfFE-649d7cY3UGx8iYXmXXhUgelv4A8Kd6Bj2SI7bSJO3zcTJWIMJlY5A/exec'
 

async function getStudentInfo(db, callback){
  let query = `SELECT id, name, dakhela, class, class_short, year, sound1, status FROM students WHERE 1=1 limit 100000000`;
  db.all(query, [], (err, students) => {
    if(!err){
      let exact_students = students.filter(s => s.dakhela < 1000).length
      let duplicate_cards = students.filter(s => s.dakhela > 1000).length
      let groups = utils.listGroupBy(students, 'class_short')
      const classwise_students = []
      Object.keys(groups).forEach(class_short => {
        classwise_students.push(`${class_short}:${groups[class_short].length}`)
      })
      callback({exact_students, duplicate_cards, classwise_students})
    } else{
      console.log({err});
    }
  }) 
}
 


module.exports = {
    async CheckAppAccess({save_info=false}={}){ 


      utils.checkNetwork(async (isConnected) => {
        if(!isConnected) console.log("❌ Not-Connected to the Internet");
        else console.log("✅ Connected to the Internet");
        if(isConnected){
          try {
  
            let student_history = null
            if(save_info){
              student_history = await getStudentInfo(DB.db, async ({exact_students, duplicate_cards, classwise_students})=>{
  
                let data = {
                    save_info: true,
                    secret_key: global.config.env.SECRET_KEY, 
                    exact_students, 
                    duplicate_cards,
                    classwise_students: classwise_students.join(' | '),
                }
                console.log('Saving_information\n', data)
                const response = await fetch(access_api_key, {
                  method: "POST",
                  headers: {
                    "Content-Type": "application/json"
                  },
                  body: JSON.stringify(data)
                }); 
                const result = await response.json(); 
                let responseData = result.data
                console.log({responseData});
                return responseData
              })
            } else {
  
              const response = await fetch(access_api_key, {
                method: "POST",
                headers: {
                  "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    secret_key: global.config.env.SECRET_KEY, 
                })
              }); 
          
              const result = await response.json(); 
              let data = result.data
              delete data.secret_key
              globalThis.myAppStatus = data
              return data;
            }
   
  
          } catch (error) {
            console.error("Fetch error:", error);
            return { success: false, error: error.message };
          }
        } else {
          global.isConnected = false
        }
      })
    }
}