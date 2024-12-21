global.DIR = __dirname;
require('dotenv').config()
const PORT = process.env?.PORTT || 1221; 
const express = require('express')
const sqlite3 = require("sqlite3").verbose();
/**
 * Classes
*/
const classDB = require('./src/class-db')
const students = require('./src/class-students')
const DB = new classDB() 
const Students = new students(DB.db) 



const app = express();
app.use(express.json());

 
app.get("/api/students", (req, res) => {
  Students.getStudents(req)
});

 
app.get("/api/student/:id", (req, res) => {
  Students.getStudent(req)
});


app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});

