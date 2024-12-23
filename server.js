global.DIR = __dirname;
require('dotenv').config()
const PORT = process.env?.PORT;
const cors = require('cors'); 
const express = require('express')
const sqlite3 = require("sqlite3").verbose();
const multer = require("multer");
const upload = multer({ dest: DIR + '/public/temp' });
 

/**
 * Classes
*/
const classDB = require('./src/class-db')
const students = require('./src/class-students');
const utils = require('./src/utls');
const DB = new classDB() 
const Students = new students(DB.db) 



const app = express();
app.use(express.json());
app.use(express.static('public'));
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


['/api'].forEach(prefix => {  
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

   
})
 

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});

