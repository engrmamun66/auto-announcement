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
const students = require('./src/class-students')
const DB = new classDB() 
const Students = new students(DB.db) 



const app = express();
app.use(express.json());
app.use(express.static('public'));
// Enable CORS
app.use(cors());


['/api'].forEach(prefix => {
  
  app.get(prefix + "/students", (req, res) => {
    Students.getStudents(req, res)
  });
  
   
  app.get(prefix + "/student/:id", (req, res) => {
    Students.getStudent(req, res)
  });
  
  app.post(prefix + "/student/import-students", upload.single("file"), (req, res) => {
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
   
})
 


app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});

