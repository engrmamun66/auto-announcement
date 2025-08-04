const moment = require('moment')

const SECONDS = global.config.env.DATA_FETCH_INTERVAL_IN_SECOND || 1

const USERNAME = global.config.env.BIO_TIME_APP_USERNAME
const PASSWORD = global.config.env.BIO_TIME_APP_PASSWORD
const DEVICE_API_BASE_URL = global.config.env.DEVICE_API_BASE_URL
const DEVICE_NAMES = global.config.env.DEVICE_NAMES || ['Device 2']

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
            console.error(`MamError:: ZKTeco Device is not connected with "${DEVICE_API_BASE_URL}"`)
        });
}
 
async function getLastPunchData(Students) {
    if (!global.DEVICE_TOKEN) return;

    DEVICE_NAMES.forEach(async (device_name) => {

        const myHeaders = new Headers();
        myHeaders.append("Content-Type", "application/json");
        myHeaders.append("Authorization", `JWT ${global.DEVICE_TOKEN}`);

        const requestOptions = {
            method: "GET",
            headers: myHeaders,
            redirect: "follow"
        };

        const back_seconds = 10;
        const start_time = moment().subtract(back_seconds, 'second').format('YYYY-MM-DD HH:mm:ss');
        const start_time_ampm = moment().subtract(back_seconds, 'second').format('hh:mm:ss A');
        const limit = 100;

    

        try {
            const response = await fetch(
                `${DEVICE_API_BASE_URL}/iclock/api/transactions/?page=1&page_size=${limit}&start_time=${start_time}&end_time=&terminal_alias=${device_name}`,
                requestOptions
            );
            const text = await response.text();
            const result = JSON.parse(text);
            const data = result?.data || [];
    
            if (data.length === 0) {
                console.log(`Student not found (device::${device_name}) ` + start_time_ampm);
            } else {
                console.log(`Wao:: Student found (device::${device_name}) ` + start_time_ampm);
            }
    
            const studentOfDevice = data.at(-1);
            const dakhela = studentOfDevice?.emp_code;
            const punch_time = studentOfDevice?.punch_time ?? '';
    
            Students.getStudentByDakhela_and_sentToSocket(Number(dakhela), {
                start_time,
                studentOfDevice,
                punch_time,
            });
    
        } catch (error) {
            console.error(`data face error from device(${device_name})::`, error);
        }
    })

}



module.exports = {
    getToken,
}