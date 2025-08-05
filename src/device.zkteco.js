const moment = require('moment')
const ZKTeco = require("zkteco");
// DOC: https://www.npmjs.com/package/zkteco

const startWithDevices = async (Students, {connectOnly=false}={}) => {
  try {
    const devices = global.config.env?.DEVICES || []
    // const devices = [{ deviceIp: "192.168.68.113", devicePort: "4370", clear: false }];
    global.zkInstance = new ZKTeco(devices);

    await global.zkInstance.connectAll(); 

    let callCount = 0;
    let punchTimes = {}

    async function fetchData() {
      console.log("fetching...");
      try {
        callCount++;
        let foundSomeLogsFromAnyDevice = false;
        for (const device of devices) {
          const logs = await global.zkInstance.getAttendances(device.deviceIp);

          if (logs?.length) {
            foundSomeLogsFromAnyDevice = true;
            console.log(`${callCount}:logs`, logs?.length);


            /** =========== START ============ */
            /** After get log, send to fronend */

            // let latestLogs = logs.filter()
            let latestLogs = logs.slice(-10).filter(({ recordTime }) => {
              return (moment().diff(new Date(recordTime), 'seconds') < 60 && !punchTimes[recordTime]) 
            })
            // // Last punch only
            // latestLogs = [latestLogs?.[0]].filter(Boolean)
            
            console.log('latestLogs::', latestLogs.length)
            
            latestLogs.forEach(eachLog => {

              punchTimes[eachLog.recordTime] = 'true'

              eachLog.emp_code = eachLog.deviceUserId
              eachLog.punch_time = eachLog.recordTime
  
              
              const dakhela = eachLog?.emp_code;
              const punch_time = eachLog?.punch_time ?? '';
              
              const start_time = moment().subtract(0, 'second').format('YYYY-MM-DD HH:mm:ss');
            
              if(global?.last_punch_time !== punch_time){
                global.last_punch_time = punch_time
                Students.getStudentByDakhela_and_sentToSocket(Number(dakhela), {
                    start_time,
                    eachLog,
                    punch_time,
                });
              }
               
              /** ============ END ============ */

            })
            


            let CLEAN_POLICY = device?.clean ?? false
            if(CLEAN_POLICY){
              let max_quantity = CLEAN_POLICY
              if (logs.length > max_quantity) {
                console.log(`clearing data for ${device.deviceIp}....`);
                await global.zkInstance.clearAttendanceLog(device.deviceIp);
              }
            }
          } else {
            console.log(`No log found for IP: ${device.deviceIp}`);
          }
        }
        if (foundSomeLogsFromAnyDevice) {
          setTimeout(fetchData, 1000);
        } else {
          setTimeout(async()=>{
            let allconnected_IPs = await global.zkInstance.getAllConnectedIps();
            if (allconnected_IPs?.length){
              for (const device of devices) {
                await global.zkInstance.clearAttendanceLog(device.deviceIp);
              }
            }
            await global.zkInstance.connectAll(); 
            await fetchData()
          }, 2000);
        }
      } catch (error) {
        console.log("startWithDevices__error::", error);
      }
    }

    fetchData();
  
    // await zkInstance.disconnect();

  } catch (e) {
    console.error(e);
  }
};

module.exports = {startWithDevices};
