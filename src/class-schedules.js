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

  
  deleteSchedule(req, res) {

    const { db, tableName } = this; // Capture `this.db` reference
    const { id } = req.params;

    if (!id) {
      res.status(400).send({ error: "ID is required to delete a schedule." });
      return;
    }

    const query = `DELETE FROM ${tableName} WHERE id = ?`;

    db.run(query, [id], function (err) {
      if (err) {
        res.status(500).send({ error: "Error deleting the schedule." });
        return;
      }

      if (this.changes === 0) {
        res.status(404).send({ message: "No schedule found with the provided ID." });
        return;
      }

      res.send({ 
        message: "Delete successful",
        deletedId: id, 
      });
    });
  }



  list(req, res){ 

    const {db, tableName} = this; // Capture `this.db` reference  
    const selectQuery = `SELECT * FROM ${tableName} WHERE 1=1`;

    db.all(selectQuery, [], (err, data) => {
      if (err) {
        res.status(500).send({ error: "Error fetching the newly added student." });
        return;
      } 

      // data.push({
      //     "id": 6,
      //     "type": 1,
      //     "title": "Night",
      //     "start_time": "19:30",
      //     "end_time": "23:59",
      //     "classes": "[{\"class_name\":\"Play\",\"class_short\":\"play\",\"isActive\":true},{\"class_name\":\"Nursery\",\"class_short\":\"nursery\",\"isActive\":true},{\"class_name\":\"KG\",\"class_short\":\"kg\",\"isActive\":true},{\"class_name\":\"One/Saffe Awal\",\"class_short\":\"one\",\"isActive\":true},{\"class_name\":\"Two/Saffe Sani\",\"class_short\":\"two\",\"isActive\":true},{\"class_name\":\"Three/Saffe Sales\",\"class_short\":\"three\",\"isActive\":true},{\"class_name\":\"Four/Saffe Rabe\",\"class_short\":\"four\",\"isActive\":true},{\"class_name\":\"Ibtedaiyah\",\"class_short\":\"five\",\"isActive\":true},{\"class_name\":\"Mutawassitah Awal / Mizan\",\"class_short\":\"mizan\",\"isActive\":true},{\"class_name\":\"Mutawassitah Sani / Nahbemir\",\"class_short\":\"nahbemir\",\"isActive\":true},{\"class_name\":\"Mutawassitah Sales\",\"class_short\":\"kuduri\",\"isActive\":true},{\"class_name\":\"Sanabiya Awal/Shorhebekaya\",\"class_short\":\"shorhebekaya\",\"isActive\":true},{\"class_name\":\"Sanabiya Sani\",\"class_short\":\"meskat1\",\"isActive\":true},{\"class_name\":\"Hifz\",\"class_short\":\"hifz\",\"isActive\":true},{\"class_name\":\"Pre Hifz\",\"class_short\":\"pre_hifz\",\"isActive\":true},{\"class_name\":\"Fozilat\",\"class_short\":\"meskat2\",\"isActive\":true}]",
      //     "created": "2024-12-30 15:02:42"
      // })

      res.send({ 
        data: data, // Full row of the newly added student
      });
    });

  } 

  
  
  
}

module.exports = Schedules;
