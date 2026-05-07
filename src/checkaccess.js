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

const SAVE_INFO_THROTTLE_MS = 60000
const ACCESS_THROTTLE_MS = 15000
let lastAccessCheckAt = 0
let lastSaveInfoAt = 0
let accessInFlight = false
let saveInfoInFlight = false
let lastAccessResult = null
let lastSaveInfoResult = null

function getStudentInfo(db){
  return new Promise((resolve, reject) => {
    let query = `SELECT id, name, dakhela, class, class_short, year, sound1, status FROM students WHERE 1=1 limit 100000000`;
    db.all(query, [], (err, students) => {
      if (err) {
        return reject(err)
      }
      let exact_students = students.filter(s => s.dakhela < 1000).length
      let duplicate_cards = students.filter(s => s.dakhela > 1000).length
      let groups = utils.listGroupBy(students, 'class_short')
      const classwise_students = []
      Object.keys(groups).forEach(class_short => {
        classwise_students.push(`${class_short}:${groups[class_short].length}`)
      })
      resolve({exact_students, duplicate_cards, classwise_students})
    }) 
  })
}

async function parseJsonResponse(response){
  const contentType = response.headers.get('content-type') || ''
  if (contentType.includes('application/json')) {
    return await response.json()
  }
  const text = await response.text()
  const error = new Error(`Non-JSON response (${response.status})`)
  error.status = response.status
  error.bodySnippet = text.slice(0, 200)
  throw error
}
 

module.exports = {
    async CheckAppAccess({save_info=false}={}){ 

      try {

        const now = Date.now()
        if(save_info){
          if (saveInfoInFlight) {
            return { skipped: true, reason: 'in_flight' }
          }
          if (now - lastSaveInfoAt < SAVE_INFO_THROTTLE_MS) {
            return { skipped: true, reason: 'throttled', lastSaveInfoAt }
          }

          saveInfoInFlight = true
          try {
            const {exact_students, duplicate_cards, classwise_students} = await getStudentInfo(DB.db)
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
            const result = await parseJsonResponse(response)
            let responseData = result?.data || result
            lastSaveInfoAt = Date.now()
            lastSaveInfoResult = responseData
            console.log({responseData});
            return responseData
          } catch (error) {
            console.error("Fetch error:", error);
            return { success: false, error: error.message, status: error.status, bodySnippet: error.bodySnippet };
          } finally {
            saveInfoInFlight = false
          }
        } else {
          if (accessInFlight) {
            return lastAccessResult || { skipped: true, reason: 'in_flight' }
          }
          if (now - lastAccessCheckAt < ACCESS_THROTTLE_MS) {
            return lastAccessResult || { skipped: true, reason: 'throttled', lastAccessCheckAt }
          }

          accessInFlight = true
          try {
            const response = await fetch(access_api_key, {
              method: "POST",
              headers: {
                "Content-Type": "application/json"
              },
              body: JSON.stringify({
                  secret_key: global.config.env.SECRET_KEY, 
                  time: new Date().getTime()
              })
            }); 
        
            const result = await parseJsonResponse(response)
            let data = result?.data || result
            if (data?.secret_key) delete data.secret_key
            globalThis.myAppStatus = data
            lastAccessCheckAt = Date.now()
            lastAccessResult = data
            return data;
          } catch (error) {
            console.error("Fetch error:", error);
            return lastAccessResult || { success: false, error: error.message, status: error.status, bodySnippet: error.bodySnippet };
          } finally {
            accessInFlight = false
          }
        }


      } catch (error) {
        console.error("Fetch error:", error);
        return { success: false, error: error.message };
      } 
    }
}
