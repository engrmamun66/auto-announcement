// const sqlite3 = require("sqlite3").verbose();
const xlsx = require("xlsx");
const multer = require("multer");
const upload = multer({ dest: DIR + "/public" });
const fs = require("fs");
const path = require("path");
const moment = require('moment')
const utils = require('./utls')

class Schedules { 

 

  constructor(db) {
    this.tableName = "schedules";
    this.db = db;
  }


  add(req, res){
    const { type, title, start_time, end_time, classes /** comma separated */ } = req.body;  
 
  
    if (!type || !start_time || !end_time || !classes) {
      res.status(400).send({ error: "All fields (type, start_time, end_time, classes) are required." });
      return;
    }

    if(!title) title = `${start_time} - ${end_time}`
  
    const tableName = this.tableName;
  
    const query = `
      INSERT INTO ${tableName} (type, title, start_time, end_time, classes)
      VALUES (?, ?, ?, ?, ?)
    `;
  
    const params = [type, title, start_time, end_time, classes];
  
    const db = this.db; // Capture `this.db` reference
  
    db.run(query, params, function (err) {
      if (err) {
        res.status(500).send({ error: err.message });
        return;
      }
  
      const selectQuery = `SELECT * FROM ${tableName} WHERE id = ?`;
      const studentId = this.lastID; // `this` here refers to the `RunResult` object.
  
      db.get(selectQuery, [studentId], (err, row) => {
        if (err) {
          res.status(500).send({ error: "Error fetching the newly added student." });
          return;
        }
  
        if (!row) {
          res.status(404).send({ error: "Student not found after insertion." });
          return;
        }
  
        res.send({
          message: "Student added successfully.",
          data: row, // Full row of the newly added student
        });
      });
    });
  }

   
  
  
  
}

module.exports = Schedules;
