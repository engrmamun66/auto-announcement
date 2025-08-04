const ZKTeco = require("zkteco");
// DOC: https://www.npmjs.com/package/zkteco

const startWithDevices = async (Students) => {
  try {
    // const devices = ["192.168.68.102", "192.168.68.101"];
    const devices = [{ deviceIp: "192.168.68.102", devicePort: "4370" }];
    let zkInstance = new ZKTeco(devices);

    await zkInstance.connectAll();

    let callCount = 0;

    async function fetchData() {
      console.log("calling====");
      try {
        callCount++;
        let foundSomeLogsFromAnyDevice = false;
        for (const device of devices) {
          const logs = await zkInstance.getAttendances(device.deviceIp);

          if (logs?.length) {
            foundSomeLogsFromAnyDevice = true;
            console.log(`${callCount}:logs`, logs?.length);
            // if (logs.length > 4) {
            //   callCount = 0;
            //   console.log("clearing data....");
            //   await zkInstance.clearAttendanceLog(device.deviceIp);
            // }
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
        console.log("error>>", error);
      }
    }
    fetchData();

    // zkInstance.getRealTimeLogs(realtimedata => {
    //   console.log({realtimedata});
    // });

    // await zkInstance.disconnect();
  } catch (e) {
    console.error(e);
  }
};

module.exports = startWithDevices;
