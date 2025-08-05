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
 
            const studentOfDevice = logs.at(-1);

            studentOfDevice.emp_code = studentOfDevice.deviceUserId
            studentOfDevice.punch_time = studentOfDevice.recordTime

            
            const dakhela = studentOfDevice?.emp_code;
            const punch_time = studentOfDevice?.punch_time ?? '';
            
            const start_time = moment().subtract(0, 'second').format('YYYY-MM-DD HH:mm:ss');
            let diff_secodns = moment().diff(punch_time, 'seconds')
            console.log('before::', moment().diff(punch_time, 'seconds'), 'seconds');

            if(diff_secodns < 40){
              if(global?.last_punch_time !== punch_time){
                global.last_punch_time = punch_time
                Students.getStudentByDakhela_and_sentToSocket(Number(dakhela), {
                    start_time,
                    studentOfDevice,
                    punch_time,
                });
              }
            } else {
              console.log('');
            }
            /** ============ END ============ */

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
          setTimeout(fetchData, 10);
          console.log('0000')
        } else {
          setTimeout(async()=>{
            let allconnected_IPs = await global.zkInstance.getAllConnectedIps();
            if (allconnected_IPs?.length){
              console.log({ allconnected_IPs })
              await global.zkInstance.clearAttendanceLog(device.deviceIp);
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
