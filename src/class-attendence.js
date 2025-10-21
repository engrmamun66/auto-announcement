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
     ___list(req, res) {
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

 
    list(req, res) {
      const MAX_LIMIT = 1000;
      const page_no = Math.max(1, parseInt(req.query.page_no) || 1);
      let limit = Math.min(parseInt(req.query.limit) || 100, MAX_LIMIT);
      const offset = (page_no - 1) * limit;
    
      const {
        student_ids,
        class_shorts,
        start_date,
        end_date,
        date,
        sort_by = "date",
        sort_direction = "ASC",
        group_by = null
      } = req.query;
    
      const whereParts = [];
      const params = [];
    
      // student_ids (array or comma-separated)
      if (student_ids) {
        const ids = Array.isArray(student_ids)
          ? student_ids.map(Number).filter(Boolean)
          : String(student_ids).split(",").map(Number).filter(Boolean);
        if (ids.length) {
          whereParts.push(`a.student_id IN (${ids.map(() => "?").join(",")})`);
          params.push(...ids);
        }
      }
    
      // class_shorts (array or comma-separated)
      if (class_shorts) {
        const shorts = Array.isArray(class_shorts)
          ? class_shorts
          : String(class_shorts).split(",").map(s => s.trim()).filter(Boolean);
        if (shorts.length) {
          whereParts.push(`s.class_short IN (${shorts.map(() => "?").join(",")})`);
          params.push(...shorts);
        }
      }
    
      // date or range
      if (start_date && end_date) {
        whereParts.push("a.date BETWEEN ? AND ?");
        params.push(start_date, end_date);
      } else if (date) {
        whereParts.push("a.date = ?");
        params.push(date);
      }
    
      const whereClause = whereParts.length ? "WHERE " + whereParts.join(" AND ") : "";
    
      // safe sorting
      const allowedSortBy = ["date", "in_time", "out_time", "created"];
      const allowedSortDir = ["ASC", "DESC"];
      const orderBy = allowedSortBy.includes(sort_by) ? sort_by : "date";
      const direction = allowedSortDir.includes(sort_direction.toUpperCase()) ? sort_direction.toUpperCase() : "ASC";
    
      // optional group_by
      const allowedGroupBy = ["student_id", "date"]; // class_short is from students table, so it can't be used directly in GROUP BY a.class_short
      // const groupBy = allowedGroupBy.includes(group_by) ? `GROUP BY a.${group_by}` : "";
      const groupBy = ''
    
      // data query
      const dataQuery = `
        SELECT a.*, s.class_short, s.name AS student_name
        FROM ${this.tableName} a 
        LEFT JOIN students s ON a.student_id = s.dakhela
        ${whereClause}
        ${groupBy}
        ORDER BY a.${orderBy} ${direction}
        LIMIT ? OFFSET ?
      `;
      const dataParams = [...params, limit, offset];
    
      this.db.all(dataQuery, dataParams, (err, rows) => {
        if (err) return res.status(500).send({ error: err.message });
    
        const countQuery = `
          SELECT COUNT(*) AS total
          FROM ${this.tableName} a
          LEFT JOIN students s ON a.student_id = s.dakhela
          ${whereClause}
        `;
        this.db.get(countQuery, params, (err, result) => {
          if (err) return res.status(500).send({ error: err.message });
    
          const total = result?.total || 0;
          const totalPages = Math.max(1, Math.ceil(total / limit));
    
          res.send({
            data: rows,
            pagination: { page_no, total, limit, totalPages },
          });
        });
      });
    }
      
    
    
  
    addNew(req, res) {
      const { student_id, date, in_time, out_time, status = 'present', remarks, late_in_minute = 0, device_index = 1, shift_duration = '', shift_count = 1, shift_number = 1 } = req.body;
    
      if (!student_id || !date) {
        return res.status(400).send({ error: "student_id and date are required." });
      }
    
      const query = `
        INSERT INTO ${this.tableName} 
          (student_id, date, in_time, out_time, status, remarks, late_in_minute, device_index, shift_duration, shift_count, shift_number)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
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
        shift_number,
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
      const { id, status, in_time, out_time, remarks, late_in_minute, device_index, shift_duration, shift_count, shift_number } = req.body;
      if (!id) return res.status(400).send({ error: "ID required." });
    
      const query = `
        UPDATE ${this.tableName} 
        SET status=?, in_time=?, out_time=?, remarks=?, late_in_minute=?, device_index=?, shift_duration=?, shift_count=?, shift_number=?, created=CURRENT_TIMESTAMP
        WHERE id=?
      `;
    
      this.db.run(query, [status, in_time, out_time, remarks, late_in_minute, device_index, shift_duration, shift_count, shift_number, id], function (err) {
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


    // Delete attendance
    deleteBulk(req, res) {

      const { student_ids, start_date, end_date } = req.query;
      if (!student_ids || !start_date || !end_date) {
        return res.status(400).send({ error: "student_ids, start_date, and end_date are required for bulk deletion." });
      }

      const ids = Array.isArray(student_ids)
        ? student_ids.map(Number).filter(Boolean)
        : String(student_ids).split(",").map(Number).filter(Boolean);

      if (ids.length === 0) {
        return res.status(400).send({ error: "No valid student IDs provided." });
      }

      const placeholders = ids.map(() => '?').join(',');
      const query = `DELETE FROM ${this.tableName} WHERE student_id IN (${placeholders}) AND date BETWEEN ? AND ?`;
      const params = [...ids, start_date, end_date];

      this.db.run(query, params, function (err) {
        if (err) {
          return res.status(500).send({ error: err.message });
        }
        res.send({ message: `Deleted ${this.changes} attendance records.`, deletedCount: this.changes });
      });
 
    }
  }
  
  module.exports = Attendance;
  