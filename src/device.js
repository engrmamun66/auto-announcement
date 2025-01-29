const moment = require('moment')

const SECONDS = 1

const USERNAME = process.env.BIO_TIME_APP_USERNAME
const PASSWORD = process.env.BIO_TIME_APP_PASSWORD
const DEVICE_API_BASE_URL = process.env.DEVICE_API_BASE_URL

let interval = null
 
function getToken(Students) {
    const myHeaders = new Headers();
    myHeaders.append("Content-Type", "application/json");

    const raw = JSON.stringify({
        "username": USERNAME,
        "password": PASSWORD,
    });

    const requestOptions = {
        method: "POST",
        headers: myHeaders,
        body: raw,
        redirect: "follow"
    };

    fetch(`${DEVICE_API_BASE_URL}/jwt-api-token-auth/`, requestOptions)
        .then(async (response) => await response.text())
        .then((result) => {
            global.DEVICE_TOKEN = JSON.parse(result).token
            if(global.DEVICE_TOKEN){
                
                global.socketServer.clients.forEach((client) => {
                    if (client.readyState === client.OPEN) {
                        client.send(JSON.stringify({
                            type: 'notice',
                            data: 'Token fetched'
                        }));
                    }
                });

                clearInterval(interval)
                interval = setInterval(() => {
                    getLastPunchData(Students)
                }, (SECONDS * 1000));


            }
        })
        .catch((error) => {
            console.error(error)
        });
}
 
function getLastPunchData(Students) {

    if (!global.DEVICE_TOKEN) return

    const myHeaders = new Headers();
    myHeaders.append("Content-Type", "application/json");
    myHeaders.append("Authorization", `JWT ${global.DEVICE_TOKEN}`);
   

    const requestOptions = {
        method: "GET",
        headers: myHeaders,
        redirect: "follow"
    };

    // let time = '2025-01-26 16:08:00'   
    let start_time = moment().subtract(SECONDS, 'second').format('YYYY-MM-DD HH:mm:ss') // two seconds before
    let start_time_ampm = moment().subtract(SECONDS, 'second').format('hh:mm:ss A') // two seconds before
    let limit = 100
 
    
    fetch(`${DEVICE_API_BASE_URL}/iclock/api/transactions/?page=1&page_size=${limit}&start_time=${start_time}&end_time=&terminal_alias=Device 2`, requestOptions)
    // fetch(`${DEVICE_API_BASE_URL}/iclock/api/transactions/?page=1&page_size=${limit}&start_time=${start_time}&end_time=&terminal_alias=`, requestOptions)
        .then(async (response) => await response.text())
        .then((result) => {
            result = JSON.parse(result)            
            let data = result?.data || []      
            
            
            if (data.length == 0){
                console.log('Student not found ' + start_time_ampm)
            }        

            let studentOfDevice = data.at(-1)
            let dakhela = studentOfDevice?.emp_code// ?? 104
            let punch_time = studentOfDevice?.punch_time ?? '' 
            
            Students.getStudentByDakhela_and_sentToSocket(dakhela, { start_time, studentOfDevice, punch_time, studentOfDevice })

          

        })
        .catch((error) => {
            console.error(error)
        });
}



module.exports = {
    getToken,
}