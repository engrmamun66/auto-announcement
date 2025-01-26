global.DIR = __dirname;
require('dotenv').config()
const PORT = process.env?.PORT;
const cors = require('cors'); 
const express = require('express')
const sqlite3 = require("sqlite3").verbose();
const multer = require("multer");
const upload = multer({ dest: DIR + '/public/temp' });
const config = require("./config");
const webContents = require("./web-contents"); 
const webSocket = require("./socket/socket")
const { getToken } = require('./src/device')


webSocket()
 
/**
 * Classes
*/
const classDB = require('./src/class-db')
const students = require('./src/class-students');
const schedules = require('./src/class-schedules');
const utils = require('./src/utls');
const DB = new classDB() 
const Students = new students(DB.db) 
const Schedules = new schedules(DB.db) 


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


const WEB_ROUTE = 'app' 

app.get(`/${WEB_ROUTE}`, (req, res) => { 
  getToken()
  res.send(webContents)
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

    let = fetch(`${DEVICE_API_BASE_URL}/iclock/api/transactions/?page=1&page_size=100&start_time=2025-01-26 16:08:00&end_time&terminal_alias=Device 1`, requestOptions)
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

  app.get(prefix + "/students", (req, res) => {
    Students.getStudents(req, res)
  });
  
   
  app.get(prefix + "/student/:id", (req, res) => {
    Students.getStudent(req, res)
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
  
  app.get(prefix + '/schedules/list', (req, res) => {
    Schedules.list(req, res);
  });

  app.delete(prefix + '/schedules/delete/:id', (req, res) => {
    Schedules.deleteSchedule(req, res);
  });
 
   
})
 

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}/app/#`); 

  // send to socket  
  getToken()


});

