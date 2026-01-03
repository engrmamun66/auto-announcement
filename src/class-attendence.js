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
        action = '',
      } = req.query;

      const payload = req.body
    
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
    
      
    
      // data query
      let dataQuery = `
        SELECT a.*, s.class_short, s.name AS student_name
        FROM ${this.tableName} a 
        LEFT JOIN students s ON a.student_id = s.dakhela
        ${whereClause} 
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
            data: this.modify_data_by_action(rows, action, req),
            pagination: { page_no, total, limit, totalPages },
          });
        });
      });
    }


    modify_data_by_action(attendanceList, action, req){

      
      if(!action) return attendanceList
      else {
        if(action === 'classwise_data'){
          let { start_date, end_date } = req.query 
          let date_duration = utils.createDateRange(start_date, end_date)
          let { leaveData, weekends, classwise_students, class_short: class___short } = req.body 
          let weekend_leaves = date_duration.filter(date => weekends.includes(moment(date).format('dddd')))
          let leaveData_excluded_weekends = leaveData.filter(leave => !weekend_leaves.includes(leave.date))
          let leaveData_group_by_date = utils.listGroupBy(leaveData_excluded_weekends, 'date')
 

          let attendanceGroup = utils.listGroupBy(attendanceList, 'student_id')

          let DATA = []
          

          classwise_students.forEach((student, i) => {
            let { dakhela, class_short } = student

            if(class_short == class___short){
              let student_attendance = attendanceGroup?.[dakhela] || []
              // let class_vacations = utils.
  
              let _targetStd = global.config.classes.find(eachClass => eachClass.class_short == class_short) || {}
              let class_name = _targetStd?.class_name || ''
              let student_shifts = _targetStd?.shifts || []
          
              // Calucating Every Single Date for a student
              let date_wise_report = date_duration.map((date, j) => {
  
                let date_wide_attendace = student_attendance.filter(att => att.date === date)
                let attendance = null
  
                let shiftInfo = student_shifts.map(shift => {
                  let duration_text  = `${shift.start} - ${shift.end}`
                  let find = date_wide_attendace.find(att => att.shift_duration === duration_text)
                  shift['is_present'] = Boolean(find)
                  shift['attendance'] = find || null
                  if(!attendance){
                    attendance = find || null
                  }
                  return shift
                })
  
                let _leaves = leaveData_group_by_date[date] || []
                let day_leaves = _leaves.filter(leave => (leave.student_id == dakhela || leave.class_short == '_all_' || leave.class_short == class_short))
                
                let is_leave_day = day_leaves.length > 0
                let is_weekend = weekend_leaves.includes(date)
                let is_leave_or_weekend_day = is_leave_day || is_weekend
  
                let is_presentable_day = is_leave_or_weekend_day === false
                let is_present = (!is_presentable_day || shiftInfo?.[0]?.is_present) ? true : false
                let is_preset_all_shifts = !is_presentable_day || shiftInfo.every(shift => shift.is_present)
                let let_in_minute = shiftInfo[0]?.attendance?.late_in_minute || 0

                let data = {
                  date,
                  month: moment(date).format('MMMM'),
                  month_year: moment(date).format('MMM YY'),
                  dakhela,
                  class_short,
                  class_name,
                  shiftInfo, 
                  is_weekend,
                  is_leave_day,
                  is_present,
                  is_preset_all_shifts,
                  in_out_count: day_leaves.length,
                  day_leaves,
                  let_in_minute, 
                  is_presentable_day,
                  student_name: attendance?.student_name || null,
                  class_short: attendance?.class_short || null,
                } 
  
                data['_leaves'] = _leaves 
  
                return data
  
              })  
              
             
              date_wise_report.sort((a, b) => (a.serial) - b.serial); 
              DATA.push(date_wise_report) 
            } //===
            
          }) 

          // let class_attendance_data = attendanceList.filter(att => att.class_short == class___short)
           
          return { 
            attendance: DATA, 
          }
        }
      }


    }


    






  }
  
  module.exports = Attendance;

  
  