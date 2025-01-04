// const sqlite3 = require("sqlite3").verbose();
const xlsx = require("xlsx");
const multer = require("multer");
const upload = multer({ dest: DIR + "/public" });
const fs = require("fs");
const path = require("path");
const moment = require('moment')
const utils = require('./utls')
const { classes } = require('./../config')

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


      /**  */ 

      if(false){
        
        data = []

        let play = classes.find(c =>  c.class_name === 'Play')  
        let nursery = classes.find(c =>  c.class_name === 'Nursery')  
        let one = classes.find(c =>  c.class_name === 'One/Saffe Awal')  
        
  
        data.push({
            "id": 6,
            "type": 1,
            "title": " puch test",
            "start_time": "18:10",
            "end_time": "23:00",
            "classes": JSON.stringify([ play, nursery ]), 
        }) 
        data.push({
            "id": 6,
            "type": 2,
            "title": " call test - 2",
            "start_time": "15:48",
            "end_time": "15:49",
            "classes": JSON.stringify([ play ]), 
        }) 
        data.push({
            "id": 6,
            "type": 2,
            "title": " call test - 1",
            "start_time": "15:50",
            "end_time": "15:51",
            "classes": JSON.stringify([ nursery ]), 
        }) 

      }


      data.forEach(item => {
        item.classes = JSON.parse(item.classes)
        item['class_names'] = item.classes.map(c => c.class_name)
        item['class_shorts'] = item.classes.map(c => c.class_short)        
      });

      res.send({ 
        data: data, // Full row of the newly added student
      });
    });

  } 

  
  
  
}

module.exports = Schedules;
