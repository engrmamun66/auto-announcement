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
  
    // Add attendance
    SHIFTS = [ 
      {
           start: '08:00',
           end: '08:00',
      }, 
      {
           start: '03:00',
           end: '05:00',
      } 
    ]

    /**
     * 
     * When each date (YYYY-MM-DD), will be maximum (shifts.length * 2)=4 entry, 
     * first check any entry is available or not, If no entry make a entry, 
     * each entry gap 5 minutes, check created TIMESTAMP column, if, 
     * last_entry_created_time <= 15 minutes, update existing entry, 
     * otherwise create a new entry with reversing in to out, out to in 
     * Note: for calculation time difference use moment js(imported already)
     */
    add(req, res) {
      const { student_id, date } = req.body;
      if (!student_id || !date) {
        return res.status(400).send({ error: "student_id and date are required." });
      }

      // let shifts = global.config.classes
    
      const shifts = [
        { start: "08:00", end: "08:00" },
        { start: "03:00", end: "05:00" }
      ];
      const maxEntries = shifts.length * 2; // 4 entries per day
    
      const selectQuery = `
        SELECT * FROM ${this.tableName}
        WHERE student_id = ? AND date = ?
        ORDER BY created DESC LIMIT 1
      `;
    
      this.db.get(selectQuery, [student_id, date], (err, lastRow) => {
        if (err) return res.status(500).send({ error: err.message });
    
        // Count entries for this date
        this.db.get(
          `SELECT COUNT(*) as cnt FROM ${this.tableName} WHERE student_id = ? AND date = ?`,
          [student_id, date],
          (err, result) => {
            if (err) return res.status(500).send({ error: err.message });
    
            const entryCount = result.cnt;
            if (entryCount >= maxEntries) {
              return res.status(400).send({ error: "Max attendance entries reached for today." });
            }
    
            const now = moment();
            let action = "in"; // default in/out flag
            let query, params;
    
            if (!lastRow) {
              // First entry → mark as IN
              query = `
                INSERT INTO ${this.tableName} (student_id, date, status, in_time)
                VALUES (?, ?, 'present', ?)
              `;
              params = [student_id, date, now.format("HH:mm:ss")];
            } else {
              const lastCreated = moment(lastRow.created);
              const diffMinutes = now.diff(lastCreated, "minutes");
    
              if (diffMinutes <= 15) {
                // Update last entry instead of new
                if (!lastRow.out_time) {
                  query = `UPDATE ${this.tableName} SET out_time=?, updated=CURRENT_TIMESTAMP WHERE id=?`;
                  params = [now.format("HH:mm:ss"), lastRow.id];
                  action = "out-update";
                } else {
                  query = `UPDATE ${this.tableName} SET remarks='Updated again', updated=CURRENT_TIMESTAMP WHERE id=?`;
                  params = [lastRow.id];
                  action = "remark-update";
                }
              } else {
                // Insert new entry, alternate in/out
                if (lastRow.in_time && !lastRow.out_time) {
                  query = `
                    UPDATE ${this.tableName} 
                    SET out_time=?, updated=CURRENT_TIMESTAMP
                    WHERE id=?
                  `;
                  params = [now.format("HH:mm:ss"), lastRow.id];
                  action = "out-new";
                } else {
                  query = `
                    INSERT INTO ${this.tableName} (student_id, date, status, in_time)
                    VALUES (?, ?, 'present', ?)
                  `;
                  params = [student_id, date, now.format("HH:mm:ss")];
                  action = "in-new";
                }
              }
            }
    
            this.db.run(query, params, function (err) {
              if (err) return res.status(500).send({ error: err.message });
              res.send({ message: "Attendance recorded.", action, changes: this.changes, id: this.lastID });
            });
          }
        );
      });
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
    
  
    // Update attendance
    update(req, res) {
      const { id, status, in_time, out_time, remarks } = req.body;
      if (!id) return res.status(400).send({ error: "ID required." });
  
      const query = `
        UPDATE ${this.tableName} 
        SET status=?, in_time=?, out_time=?, remarks=?, updated=CURRENT_TIMESTAMP
        WHERE id=?
      `;
  
      this.db.run(query, [status, in_time, out_time, remarks, id], function (err) {
        if (err) return res.status(500).send({ error: err.message });
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
  