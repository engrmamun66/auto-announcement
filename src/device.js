const moment = require('moment')

const USERNAME = process.env.BIO_TIME_APP_USERNAME
const PASSWORD = process.env.BIO_TIME_APP_PASSWORD
const DEVICE_API_BASE_URL = process.env.DEVICE_API_BASE_URL

let interval = null
 
function getToken() {
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
                    getTransaction()
                }, 2000);


            }
        })
        .catch((error) => {
            console.error(error)
        });
}
 
function getTransaction() {

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
    let start_time = moment().subtract(2, 'second').format('YYYY-MM-DD hh:mm:ss') // 
    let limit = 10000
 
    
    fetch(`${DEVICE_API_BASE_URL}/iclock/api/transactions/?page=1&page_size=${limit}&start_time=${start_time}&end_time=`, requestOptions)
        .then(async (response) => await response.text())
        .then((result) => {
            result = JSON.parse(result)
            let data = result.data || []
            let reversed = data.toReversed()  
            reversed.length = 10                    
              
            global.socketServer.clients.forEach((client) => {
                if (client.readyState === client.OPEN) {
                    client.send(JSON.stringify({
                        type: 'attendence',
                        start_time,
                        data: reversed,
                    }));
                }
            }); 

        })
        .catch((error) => {
            console.error(error)
        });
}



module.exports = {
    getToken,
}