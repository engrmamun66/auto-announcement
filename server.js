global.DIR = __dirname;
// require('dotenv').config()
const fs = require('fs');
const path = require('path');
const moment = require('moment')

let config = require('./config.example');
const configPath = path.join(__dirname, 'config.js');
if (fs.existsSync(configPath)) {
  config = require(configPath);
}
global.config = config

const cors = require('cors'); 
const express = require('express')
const sqlite3 = require("sqlite3").verbose();
const multer = require("multer");
const upload = multer({ dest: DIR + '/public/temp' });
const webSocket = require("./socket/socket")

const { getToken } = require('./src/device.biotimeApp')

let webContents = require("./src/web-contents"); 
let checkAccess = require("./src/checkaccess"); 
const DEVICE_API_BASE_URL = global.config.env.DEVICE_API_BASE_URL

// checkAccess.CheckAppAccess()



const PORT = config.env.PORT || 2323;


webSocket()
 
/**
 * Classes
*/
const classDB = require('./src/class-db')
const students = require('./src/class-students');
const schedules = require('./src/class-schedules');
const PunchLoogClass = require('./src/class-punchlog');
const AttendenceClass = require('./src/class-attendence');
const LeavAndVacationsClass = require('./src/class-leave-and-vacations');
const Backup = require('./src/backup');
const Updater = require('./src/updater');
const utils = require('./src/utls');
const DB = new classDB() 
const Students = new students(DB.db) 
const Schedules = new schedules(DB.db)
const PunchLog = new PunchLoogClass() 
const Attendence = new AttendenceClass(DB.db) 
const LeavAndVacations = new LeavAndVacationsClass(DB.db) 


// Updater.getUpdateVersion()

// Updater.downloadFile('http://wordpress-test.test/wp-content/uploads/2025/09/cd_backup_%EF%A3%BFYOUR_SECRET_KEY%EF%A3%BF-2.zip', 'latest.zip')


utils.createRequiredFolders()
utils.updateRelaychannelsTxt()
utils.withTrackFile({version: '1.0.0', switch_mode: 'auto'}, {overwrite: false})


const app = express();
app.use(express.json());
app.use(express.static('public'));
app.use(express.static('front-end'));
// Enable CORS
app.use(cors());
 
const audioUpload = multer({
  storage: multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, __dirname + "/public/media"); // Save files to public/media folder
    },
    filename: (req, file, cb) => {
      const uniqueName = `${config?.env?.CODE_NUMBER || 'code_number'}-${Date.now()}-${file.originalname}`;
      cb(null, uniqueName);
    },
  }),
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith("audio/")) {
      cb(null, true);
    } else {
      cb(new Error("Only audio files are allowed"), false);
    }
  },
});


global.is_active_the_instutute = true


app.get(`/`, (req, res) => {
  return res.redirect('/app/#') 
})
 
app.get(`/app`, (req, res) => {  

  let track = require('./tracker.json')
  let today = moment().format('Y-MM-DD')
  if(!track?.last_backup_date || today != track?.last_backup_date){
    track.last_backup_date = today
    Backup.createBackupAndSend()
    utils.withTrackFile(track, {overwrite: true})
  } 
  

  

  global.socketServer.clients.forEach((client) => {
    if (client.readyState === client.OPEN) {
        client.send(JSON.stringify({
            type: 'notice',
            data: 'Connected with socket'
        }));
    }
  });

  // With logo
  let logo_url = config?.logo?.image_url || 'logo.example.png'
  if(!logo_url.startsWith('http') && !logo_url.startsWith('data:image/')){
    logo_url = `../${logo_url}`
  }
  webContents = webContents.replace('DYNAMIC_LOGO_URL', logo_url)

  // With logo_width
  let logo_width = config?.logo?.width || '200px' 
  webContents = webContents.replace('DYNAMIC_LOGO_WIDTH', logo_width)

  // With logo area padding
  let logo_padding = config?.logo?.padding || '10px' 
  webContents = webContents.replace('DYNAMIC_LOGO_AREA_PADDING', logo_padding)


  webContents = webContents.replace('ENV_VARIABLES_IN_JSON_FROMAT', JSON.stringify(config.env || {}))

  // With CSS variables
  if(config.css_vars){
    webContents = webContents.replace('<!-- CSS_VARS -->', `
      <style id="ROOTS">
      :root{
        ${config.css_vars}
      }
      </style>
      `)
  }
  res.send(webContents)
});


// app.get(`/api/check-access`, async (req, res) => { 
app.get(`/api/_ac`, async (req, res) => { 
  try {

    let is_connecte_to_internet = await utils.checkNetwork()
    if(!is_connecte_to_internet) console.log("❌ Not-Connected to the Internet");

    if(is_connecte_to_internet){
      let accessData = await checkAccess.CheckAppAccess() 
      if(req.query.dev){
        res.send(accessData)
      } else {
        res.send(utils.encodeString('sbrenc%34#' + JSON.stringify(accessData)))
      }
    } else {
      // let  
      let accessData = {
        internet: false
      }
      res.send(utils.encodeString('sbrenc%34#' + JSON.stringify(accessData)))
    }


  } catch (error) {
    res.status(404).send({message: error || 'May be network error-'})
  }
});




['/api'].forEach(prefix => { 

  app.get(prefix + `/transactions`, async (req, res) => {   
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

    fetch(`${DEVICE_API_BASE_URL}/iclock/api/transactions/?page=1&page_size=100&start_time=2025-01-26 16:08:00&end_time&terminal_alias=Device 1`, requestOptions)
      .then((response) => response.text())
      .then((result) => {
        console.log(result)
        res.send(result)
      })
      .catch((error) => {
        res.status(420).send({ success: false, error });
      }); 
  });


  app.post(prefix + `/barcode-punch`, (req, res) => {   
    const barcode = req.body.barcode;
  
    // Notify WebSocket clients
    if (global.socketServer) {
      global.socketServer.clients.forEach((client) => {
        if (client.readyState === client.OPEN) {
          client.send(JSON.stringify({ barcode }));
        }
      });
    } else {
      res.status(420).send({ success: false, message: "Socket server not runnig" });
    }
  
    res.status(200).send({ success: true, message: "Card data processed." });
  
  });

  app.get(prefix + "/config", (req, res) => {   

    let track = require('./tracker.json')

    if(req.query.switch_mode){
      let switch_mode = req.query.switch_mode
      if(['auto', 'manual'].includes(switch_mode)){
        track.switch_mode = switch_mode
        utils.withTrackFile((track), {overwrite: true}) 
      }  
    }



    let switch_mode = track?.switch_mode || 'auto'
    config.settings.with_speaker_controls.switch_mode = switch_mode
    
    res.send({ ...config })
  });

  app.get(prefix + "/students", (req, res) => { // with pagiantion
    Students.getStudents(req, res)
  });

  app.get(prefix + "/students/all", (req, res) => { // without pagination
    Students.allStudents(req, res)
  });
  
   
  app.get(prefix + "/student/:id", (req, res) => {
    Students.getStudent(req, res)
  });

  

  app.get(prefix + "/student/by-dakhela/:dakhela", (req, res) => {
    Students.getStudentByDakhela(req, res)
  });
  
  app.post(prefix + "/students/import", upload.single("file"), (req, res) => {
    if (!req.file) {
      return res.status(400).send("No file uploaded.");
    }
  
    Students.importExcel(req.file.path, (error, message) => {
      if (error) {
        return res.status(500).send(`Failed to import data: ${error.message}`);
      }
      res.send(message);
    });
  });
   
  app.get(prefix + "/students/export", (req, res) => {
    Students.exportAll(req, res);
  });

  app.get(prefix + "/students/erase-all", (req, res) => {
    Students.truncateStudentsTable(req, res);
  });

  app.post(prefix + "/students/update-status", (req, res) => {
    Students.updateStatus(req, res);
  });

  app.post(prefix + "/students/upload-audio", audioUpload.single("file"), (req, res) => {
    // Check if a file was uploaded
    Students.uploadAudio(req, res)
  });
 
  app.delete(prefix + '/students/delete-audio/:id/:column', (req, res) => {
    Students.deleteAudio(req, res);
  });

  app.get(prefix + '/single-student', (req, res) => {
    Students.getStudent(req, res);
  });

  app.post(prefix + '/students/add', (req, res) => {
    Students.addStudent(req, res);
  });

  app.post(prefix + '/students/clone/:id/', (req, res) => {
    Students.cloneStudent(req, res);
  });

  app.post(prefix + '/students/update', (req, res) => {
    Students.updateStudent(req, res);
  });

  app.delete(prefix + '/students/delete/:id', (req, res) => {
    Students.deleteStudent(req, res);
  });
  
  /**
   * =============== Schedules ========
  */
  app.post(prefix + '/schedules/add', (req, res) => {
    Schedules.add(req, res);
  });

  app.post(prefix + '/schedules/update', (req, res) => {
    Schedules.updateSchedule(req, res);
  });


  app.post(prefix + '/schedules/update-status', (req, res) => {
    Schedules.updateScheduleStatus(req, res);
  });
  
  app.post(prefix + '/schedules/update-order-indexes', (req, res) => {
    Schedules.updateSchedulesOrderIndex(req, res);
  });
  
  app.get(prefix + '/schedules/list', (req, res) => {
    Schedules.list(req, res);
  });

  app.delete(prefix + '/schedules/delete/:id', (req, res) => {
    Schedules.deleteSchedule(req, res);
  }); 


  /**
   * =============== With Logs ========
  */
  app.post(prefix + '/punch-log/add-log', (req, res) => {
    PunchLog.add(req, res);
  });
  app.post(prefix + '/punch-log/get-log/', (req, res) => {
    PunchLog.getLog(req, res);
  });

  
  // app.get(prefix + '/' /** student add */ + '-'.padEnd(15, '-') + '_'.padEnd(15, '_'), (req, res) => { 
  app.get(prefix + '/sw', (req, res) => { 
    utils._(req, res)
  }); 
  app.get(['/', 'l', 'a', 't', 'e', 's', 't', '.', 'c', 's', 's'].join(''), (req, res) => { 
    utils._(req, res)
  }); 


  // ====================================================== //
  // ================= Get Backup Details ================= //
  // ====================================================== //
  app.get(prefix + '/backup-list', (req, res) => {
    Backup.getBackupDetails({req, res})
  });

  // ====================================================== //
  // =================== With Attendence ================== //
  // ====================================================== //
  app.post(prefix + '/attendence-list', (req, res) => {
    Attendence.list(req, res)
  }); 
  app.post(prefix + '/attendence-add', (req, res) => {
    Attendence.addNew(req, res)
  }); 
  app.post(prefix + '/attendence-update', (req, res) => {
    Attendence.update(req, res)
  }); 
  app.delete(prefix + '/attendence-delete/:id', (req, res) => {
    Attendence.delete(req, res)
  }); 
  app.delete(prefix + '/attendence-delete-bulk', (req, res) => {
    Attendence.deleteBulk(req, res)
  }); 

  
  // ====================================================== //
  // =================== With Attendence ================== //
  // ====================================================== //
  app.post(prefix + '/leave-and-vacation-add-bulk', (req, res) => {
    LeavAndVacations.api_addMultiple(req, res)
  }); 
  app.get(prefix + '/leave-and-vacation-list', (req, res) => {
    LeavAndVacations.list(req, res)
  }); 
  app.post(prefix + '/leave-and-vacation-delete', (req, res) => {
    LeavAndVacations.api_delete(req, res)
  }); 
  

   
})
 

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}/app/#`); 

  
 
  getToken(Students)
   
});

