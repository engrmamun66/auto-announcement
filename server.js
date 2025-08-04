global.DIR = __dirname;
// require('dotenv').config()
const fs = require('fs');
const path = require('path');

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
const { startWithDevices } = require('./src/device.zkteco')

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
const utils = require('./src/utls');
const DB = new classDB() 
const Students = new students(DB.db) 
const Schedules = new schedules(DB.db)
const PunchLog = new PunchLoogClass() 


utils.create_access_DOT_apikey()
utils.createRequiredFolders()




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
      const uniqueName = `${Date.now()}-${file.originalname}`;
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

  setTimeout(() => {
    global.socketServer.clients.forEach((client) => {
      console.log('asdfdf=====');
      if (client.readyState === client.OPEN) {
          client.send(JSON.stringify({
              type: 'notice',
              data: 'Connected with socket'
          }));
      }
    });
  }, 200);

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
      <style>
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
  let accessData = await checkAccess.CheckAppAccess()
  if(req.query.dev){
    res.send(accessData)
  } else {
    res.send(utils.encodeString('sbrenc%34#' + JSON.stringify(accessData)))
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

  // app.post(prefix + `/card-punch`, (req, res) => {   
  //   if (global.socketServer) {
  //     Students.getStudentByCardNumber(req, res)      
  //   } else {
  //     res.status(420).send({ success: false, message: "Socket server not runnig" });
  //   }  
  // });

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
 
   
})
 

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}/app/#`); 

  // send to socket  
  if(global.config?.mode === 'with-ips'){
    startWithDevices(Students)
  } 
  else {
    getToken(Students)
  } 
});

