const ZKLib = require('node-zklib');

const startWithDevices = async () => {
  let zkInstance = new ZKLib('192.168.68.102', 4370, 10000, 4000);

  try {
    await zkInstance.createSocket(); // connect to device
    // console.log(await zkInstance.getInfo()); // get device info

    // const users = await zkInstance.getUsers();
    // console.log(users); 

    
    // var logs = await zkInstance.getAttendances();
    // console.log('logs', logs.data.length);
    
    // await zkInstance.clearAttendanceLog();

    let callCount = 0

    async function fetchData(){
        try {
            callCount ++
            var logs = await zkInstance.getAttendances();
            if(!logs.err){
                console.clear()
                console.log(`${callCount}:logs`, logs.data.length);
                await zkInstance.clearAttendanceLog();
                await fetchData()
            }
        } catch (error) {
            
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