const moment = require('moment')
const ZKTeco = require("zkteco");
// DOC: https://www.npmjs.com/package/zkteco
const devicePort = "4370"

const startWithDevices = async (Students) => {
  try {
    const device_ips = global.config.env?.DEVICE_IPS || []
    // const devices = [{ deviceIp: "192.168.68.102", devicePort: "4370" }];
    const devices = device_ips.map(deviceIp => ({deviceIp, devicePort}))
    let zkInstance = new ZKTeco(devices);

    await zkInstance.connectAll();

    let callCount = 0;

    async function fetchData() {
      console.log("fetching...");
      try {
        callCount++;
        let foundSomeLogsFromAnyDevice = false;
        for (const device of devices) {
          const logs = await zkInstance.getAttendances(device.deviceIp);

          if (logs?.length) {
            foundSomeLogsFromAnyDevice = true;
            console.log(`${callCount}:logs`, logs?.length);


            /** =========== START ============ */
            /** After get log, send to fronend */
 
            const studentOfDevice = logs.at(-1);

            studentOfDevice.emp_code = studentOfDevice.deviceUserId
            studentOfDevice.punch_time = studentOfDevice.recordTime
            
            const dakhela = studentOfDevice?.emp_code;
            const punch_time = studentOfDevice?.punch_time ?? '';
            const back_seconds = 10;
            const start_time = moment().subtract(back_seconds, 'second').format('YYYY-MM-DD HH:mm:ss');
    
            Students.getStudentByDakhela_and_sentToSocket(Number(dakhela), {
                start_time,
                studentOfDevice,
                punch_time,
            });
            /** ============ END ============ */

            let CLEAN_POLICY = global.config.env?.CLEAN_POLICY?.[device.deviceIp] || global.config.env?.CLEAN_POLICY?.['clean'] || false
            if(CLEAN_POLICY){
              let max_quantity = CLEAN_POLICY
              if (logs.length > max_quantity) {
                console.log(`clearing data for ${device.deviceIp}....`);
                // await zkInstance.clearAttendanceLog(device.deviceIp);
              }
            }
          } else {
            console.log(`No log found for IP: ${device.deviceIp}`);
          }
        }
        if (foundSomeLogsFromAnyDevice) {
          await fetchData();
        } else {
          setTimeout(fetchData, 2000);
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
