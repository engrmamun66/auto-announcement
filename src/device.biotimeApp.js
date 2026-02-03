const moment = require('moment')

const SECONDS = global.config.env.DATA_FETCH_INTERVAL_IN_SECOND || 1
const BACK_SECONDS = global.config.env.DATA_FETCH_BACK_SECONDS || 10

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
            global.DEVICE_TOKEN = JSON.parse(result).token || ''
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
            } else {
                console.log(`>> I hope BioTime app username or password is wrong.`);
            }
        })
        .catch((error) => {
            console.error(`MamError:: ZKTeco Device is not connected with "${DEVICE_API_BASE_URL}"`)

            // Just Fake request
            let students_ids = [
                91,
                92,
                93,
                94,
                95,
                96,

                91,
                92,
                93,
                94,
                95,
                96,
            ]
            students_ids.forEach((students_id, i) => {
                // setTimeout(()=> fake_getLastPunchData(Students, students_id, moment().subtract(1, 'seconds').format('Y-MM-DD HH:mm:ss')), 1000 * (i + 1))
            })
        });
}
 
async function getLastPunchData(Students) {
    if (!global.DEVICE_TOKEN) return;

    DEVICE_NAMES.forEach(async (device_name, device_index) => {

        const myHeaders = new Headers();
        myHeaders.append("Content-Type", "application/json");
        myHeaders.append("Authorization", `JWT ${global.DEVICE_TOKEN}`);

        const requestOptions = {
            method: "GET",
            headers: myHeaders,
            redirect: "follow"
        };

        const start_time = moment().subtract(BACK_SECONDS, 'second').format('YYYY-MM-DD HH:mm:ss');
        const start_time_ampm = moment().subtract(BACK_SECONDS, 'second').format('hh:mm:ss A');
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
                device_index,
            });
    
        } catch (error) {
            console.error(`data face error from device(${device_name})::`, error);
        }
    })

}



const TEST_TRANSACTION_DATA = [
    {
      "id": 1,
      "emp_code": "1209",
      "punch_time": "2019-03-04 09:50:00",
      "punch_state": "0",
      "verify_type": 1,
      "work_code": null,
      "terminal_sn": "",
      "terminal_alias": null,
      "area_alias": null,
      "longitude": null,
      "latitude": null,
      "gps_location": "",
      "mobile": null,
      "source": 0,
      "purpose": 1,
      "crc": null,
      "is_attendance": 1,
      "reserved": null,
      "upload_time": "2019-03-04 09:50:00",
      "sync_status": 1,
      "sync_time": null,
      "emp": null,
      "terminal": null
    },
    {
      "id": 2,
      "emp_code": "1228",
      "punch_time": "2019-03-04 18:10:00",
      "punch_state": "0",
      "verify_type": 1,
      "work_code": null,
      "terminal_sn": "",
      "terminal_alias": null,
      "area_alias": null,
      "longitude": null,
      "latitude": null,
      "gps_location": "",
      "mobile": null,
      "source": 0,
      "purpose": 1,
      "crc": null,
      "is_attendance": 1,
      "reserved": null,
      "upload_time": "2019-03-04 18:10:00",
      "sync_status": 1,
      "sync_time": null,
      "emp": null,
      "terminal": null
    }
    // … more entries …
  ];


async function getBulkPunces(req) {
    // if (!global.DEVICE_TOKEN) return []
    if (!global.DEVICE_TOKEN) return TEST_TRANSACTION_DATA

    
    const myHeaders = new Headers();
    myHeaders.append("Content-Type", "application/json");
    myHeaders.append("Authorization", `JWT ${global.DEVICE_TOKEN}`);

    const requestOptions = {
        method: "GET",
        headers: myHeaders,
        redirect: "follow"
    };

    // const start_time = moment().subtract(BACK_SECONDS, 'second').format('YYYY-MM-DD HH:mm:ss');
    const start_time = req.query.start_time;
    const end_time = req.query.end_time; 
    const limit = 3000; 

    try {
        const response = await fetch(
            `${DEVICE_API_BASE_URL}/iclock/api/transactions/?page=1&page_size=${limit}&start_time=${start_time}&end_time=${end_time}`,
            requestOptions
        );
        const text = await response.text();
        const result = JSON.parse(text);
        const data = result?.data || []; 
        return data || []

    } catch (error) {
        console.error(`data face error`, error);
        return []
    }

}


function fake_getLastPunchData(Students, dakhela, punch_time, device_index=0){ 

    const start_time = moment().subtract(BACK_SECONDS, 'second').format('YYYY-MM-DD HH:mm:ss')

    Students.getStudentByDakhela_and_sentToSocket(Number(dakhela), {
        start_time,
        studentOfDevice: null,
        punch_time,
        device_index,
    });
}



module.exports = {
    getToken,
    getBulkPunces,
}