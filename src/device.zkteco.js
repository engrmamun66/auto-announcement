const ZKTeco = require('zkteco');
// DOC: https://www.npmjs.com/package/zkteco

const startWithDevices = async (Students) => { 

  try { 
    const deviceIp = "192.168.68.102";  
    const ips = ["192.168.68.102"];
    const devices = [{ deviceIp: "192.168.68.102", devicePort: "4370" }];  
    // let zkInstance = new ZKTeco(ips);
    let zkInstance = new ZKTeco(devices);
 
    await zkInstance.connectAll(); 


    let callCount = 0

    async function fetchData(){
        console.log('calling====');
        try {
            callCount ++
            const logs = await zkInstance.getAttendances(deviceIp); 
 
            if(logs?.length){
                console.clear()
                console.log(`${callCount}:logs`, logs?.length);
                if(logs.length > 4){
                    console.log('clearing data....');
                    await zkInstance.clearAttendanceLog(deviceIp);
                    callCount = 0
                }
                await fetchData()
              } else {
                console.log('No log found', {logs});
                setTimeout(fetchData, 2000);
              } 
        } catch (error) {
            console.log('error>>', error);
        }
    }
    fetchData()

    

   
    
  

    // zkInstance.getRealTimeLogs(realtimedata => {
    //   console.log({realtimedata});
    // });

    // await zkInstance.disconnect();
  } catch (e) {
    console.error(e);
  }
};


module.exports = startWithDevices