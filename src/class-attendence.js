// const sqlite3 = require("sqlite3").verbose();
const xlsx = require("xlsx");
const multer = require("multer");
const upload = multer({ dest: DIR + "/public" });
const fs = require("fs");
const path = require("path");
const moment = require('moment')
const utils = require('./utls') 

class Attendance {
    constructor(db) {
      this.tableName = "attendance";
      this.db = db;
    }

     // Get attendance records
     list(req, res) {
      const page_no = parseInt(req.query.page_no) || 1;
      const limit = parseInt(req.query.limit) || 100;
      const offset = (page_no - 1) * limit;
    
      const { student_id, date } = req.query;
      let query = `SELECT * FROM ${this.tableName} WHERE 1=1`;
      let params = [];
    
      if (student_id) { query += " AND student_id = ?"; params.push(student_id); }
      if (date) { query += " AND date = ?"; params.push(date); }
    
      // Add pagination
      query += ` LIMIT ? OFFSET ?`;
      params.push(limit, offset);
    
      this.db.all(query, params, (err, rows) => {
        if (err) return res.status(500).send({ error: err.message });
    
        // Count query for pagination metadata
        let countQuery = `SELECT COUNT(*) as total FROM ${this.tableName} WHERE 1=1`;
        let countParams = [];
        if (student_id) { countQuery += " AND student_id = ?"; countParams.push(student_id); }
        if (date) { countQuery += " AND date = ?"; countParams.push(date); }
    
        this.db.get(countQuery, countParams, (err, result) => {
          if (err) return res.status(500).send({ error: err.message });
    
          const total = result.total;
          const totalPages = Math.ceil(total / limit);
    
          res.send({
            data: rows,
            pagination: {
              page_no,
              total,
              limit,
              totalPages,
            },
          });
        });
      });
    }
    
  
    addNew(req, res) {
      const { student_id, date, in_time, out_time, status = 'present', remarks, late_in_minute = 0, device_index = 1, shift_duration = '', shift_count = 1 } = req.body;
    
      if (!student_id || !date) {
        return res.status(400).send({ error: "student_id and date are required." });
      }
    
      const query = `
        INSERT INTO ${this.tableName} 
          (student_id, date, in_time, out_time, status, remarks, late_in_minute, device_index, shift_duration, shift_count)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `;
    
      const params = [
        student_id,
        date,
        in_time || null,
        out_time || null,
        status,
        remarks || null,
        late_in_minute,
        device_index,
        shift_duration,
        shift_count,
      ];
    
      const db = this.db;
    
      db.run(query, params, function (err) {
        if (err) return res.status(500).send({ error: err.message });
    
        const insertedId = this.lastID;
        db.get(`SELECT * FROM attendance WHERE id = ?`, [insertedId], (err, row) => {
          if (err) return res.status(500).send({ error: err.message });
          res.send({
            message: "Row inserted successfully.",
            data: row
          });
        });
      });
    }
    
   
  
    // Update attendance
    update(req, res) {
      const { id, status, in_time, out_time, remarks, late_in_minute, device_index, shift_duration, shift_count } = req.body;
      if (!id) return res.status(400).send({ error: "ID required." });
    
      const query = `
        UPDATE ${this.tableName} 
        SET status=?, in_time=?, out_time=?, remarks=?, late_in_minute=?, device_index=?, shift_duration=?, shift_count=?, created=CURRENT_TIMESTAMP
        WHERE id=?
      `;
    
      this.db.run(query, [status, in_time, out_time, remarks, late_in_minute, device_index, shift_duration, shift_count, id], function (err) {
        if (err) return res.status(500).send({ error: err.message });
    
        if (this.changes === 0) {
          return res.status(404).send({ error: "No attendance row found with that ID." });
        }
    
        res.send({ message: "Attendance updated.", changes: this.changes });
      });
    }
    
  
    // Delete attendance
    delete(req, res) {
      const { id } = req.params;
      if (!id) return res.status(400).send({ error: "ID required." });
  
      const query = `DELETE FROM ${this.tableName} WHERE id = ?`;
      this.db.run(query, [id], function (err) {
        if (err) return res.status(500).send({ error: err.message });
        res.send({ message: "Attendance deleted.", deleted: this.changes });
      });
    }
  }
  
  module.exports = Attendance;
  