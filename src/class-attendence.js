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
    
    /**
     Example of SHIFTS = [ 
       {
            start: '08:00',
            end: '08:00',
       }, 
       {
            start: '03:00',
            end: '05:00',
       } 
     ]
     * 
     * When each date (YYYY-MM-DD), will be maximum (shifts.length * 2)=4 entry, 
     * first check any entry is available or not, If no entry make a entry, 
     * each entry gap 5 minutes, check created TIMESTAMP column, if, 
     * last_entry_created_time <= 15 minutes, update existing entry, 
     * otherwise create a new entry with reversing in to out, out to in 
     * Note: for calculation time difference use moment js(imported already)
     */
     add(req, res) {
      const { student_id, date, class_short, class_name, branch_id = 1 } = req.body;
      if (!student_id || !date) {
        return res.status(400).send({ error: "student_id and date are required." });
      }
    
      const db = this.db; // <-- use this.db (capture it)
      let shifts = global.config.classes.find(cls => cls.class_short == class_short)?.shifts;
      if (!shifts) {
        return res.status(400).send({ error: `shift not found for [${class_name}]` });
      }

      const maxEntries = shifts.length * 2; // for 1 shift 2 entry max, for 2 shifts 4 entry max
    
      const selectQuery = `
        SELECT * FROM ${this.tableName}
        WHERE student_id = ? AND date = ?
        ORDER BY created DESC LIMIT 1
      `;
    
      db.get(selectQuery, [student_id, date], (err, lastRow) => {
        if (err) return res.status(500).send({ error: err.message });
    
        // Count entries for this date
        db.get(
          `SELECT COUNT(*) as cnt FROM ${this.tableName} WHERE student_id = ? AND date = ?`,
          [student_id, date],
          (err, result) => {
            if (err) return res.status(500).send({ error: err.message, 'tableName': this.tableName });
    
            const entryCount = result.cnt;
            const now = moment();
            let action = "in";
            let query, params;

            // calculate late_in_minute (only for first IN entry of the day)
            let late_in_minute = 0;
            if (!lastRow) {
              const firstShift = shifts[0];
              if (firstShift?.start) {
                const shiftStart = moment(`${date} ${firstShift.start}`, "YYYY-MM-DD HH:mm");
                if (now.isAfter(shiftStart)) {
                  late_in_minute = now.diff(shiftStart, "minutes");
                }
              }
            }

            if (entryCount >= maxEntries) {
    
              // Instead of blocking → update created timestamp of last row
              if (!lastRow) {
                // Defensive: if somehow count >= max but lastRow missing, fallback to updating latest by student/date
                query = `UPDATE ${this.tableName} SET created=CURRENT_TIMESTAMP, updated=CURRENT_TIMESTAMP WHERE student_id=? AND date=? ORDER BY created DESC LIMIT 1`;
                params = [student_id, date];
              } else {
                query = `UPDATE ${this.tableName} SET created=CURRENT_TIMESTAMP, updated=CURRENT_TIMESTAMP WHERE id=?`;
                params = [lastRow.id];
              }
              action = "max-reached-update";
              return res.send({action})
            } else if (!lastRow) {
              // First entry → mark as IN
              query = `
              INSERT INTO ${this.tableName} 
              (student_id, date, status, in_time, late_in_minute, branch_id)
              VALUES (?, ?, 'present', ?, ?, ?)
              `;
              params = [student_id, date, now.format("HH:mm:ss"), late_in_minute, branch_id];
              
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
                    INSERT INTO ${this.tableName} 
                      (student_id, date, status, in_time, branch_id)
                    VALUES (?, ?, 'present', ?, ?)
                  `;
                  params = [student_id, date, now.format("HH:mm:ss"), branch_id];
                  action = "in-new";
                }
              }
            }
    
            db.run(query, params,  (err) => {

              if (err) return res.status(500).send({ error: err.message });
    
              // Determine which row to fetch:
              // - if last operation was INSERT, this.lastID is the new id
              // - if it was UPDATE, use lastRow.id
              const insertedId = this.lastID || (lastRow && lastRow.id);
    
              if (insertedId) {
                // fetch by id
                const fetchQuery = `SELECT * FROM ${this.tableName} WHERE id = ?`;
                db.get(fetchQuery, [insertedId], (err, row) => {
                  if (err) return res.status(500).send({ error: err.message });
                  return res.send({ message: "Attendance recorded.", action, data: row });
                });
              } else {
                // fallback: fetch latest row for student/date
                const fetchQuery = `SELECT * FROM ${this.tableName} WHERE student_id = ? AND date = ? ORDER BY created DESC LIMIT 1`;
                db.get(fetchQuery, [student_id, date], (err, row) => {
                  if (err) return res.status(500).send({ error: err.message });
                  return res.send({ message: "Attendance recorded.", action, data: row });
                });
              }
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
  