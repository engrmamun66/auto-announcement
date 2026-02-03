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
            data: rows,
            pagination: { page_no, total, limit, totalPages },
          });
        });
      });
    }


    /**
     * 
     * ==========================+
     * ==========================+
     * ==========================+
     * ==========================+
     * ==========================+
     * ==========================+
     * ==========================+
     */

    getAttendanceReports(req, res) {
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
      `;

      
      const dataParams = [...params];
    
      this.db.all(dataQuery, dataParams, (err, rows) => {
        if (err) return res.status(500).send({ error: err.message });

        if (action === 'classwise_data') {
          return res.send({
            data: this.modify_data_by_action(rows, action, req),
          });
        }

        const payload = req.body || {};
        const weekends = Array.isArray(payload.weekends) ? payload.weekends : [];
        const leaveData = Array.isArray(payload.leaveData) ? payload.leaveData : [];
        const total_days = Number(payload.total_days || 0);
        let all__students = Array.isArray(payload.all__students) ? payload.all__students : [];

        if (!all__students.length) {
          const studentMap = {};
          rows.forEach((row) => {
            if (!row?.student_id) return;
            const key = `${row.student_id}-${row.class_short || ''}`;
            if (!studentMap[key]) {
              studentMap[key] = { dakhela: row.student_id, class_short: row.class_short || null };
            }
          });
          all__students = Object.values(studentMap);
        }

        let date_duration = utils.createDateRange(start_date, end_date);
        if (total_days > 0 && total_days < date_duration.length) {
          date_duration = date_duration.slice(0, total_days);
        }

        const dateMeta = date_duration.map((date) => ({
          date,
          monthKey: moment(date).startOf('month').format('YYYY-MM-01'),
        }));

        const monthMeta = {};
        dateMeta.forEach(({ date, monthKey }) => {
          if (!monthMeta[monthKey]) {
            monthMeta[monthKey] = {
              month: moment(date).format('MMMM'),
              month_year: moment(date).format('MMM YY'),
              year: moment(date).format('YYYY'),
              month_index: Number(moment(date).format('MM')),
              total_days: 0,
            };
          }
          monthMeta[monthKey].total_days += 1;
        });

        const weekend_leaves = date_duration.filter(date => weekends.includes(moment(date).format('dddd')));
        const weekendSet = new Set(weekend_leaves);
        const classLevelVacations = leaveData.filter(
          leave => leave?.type === 'vacation' && leave?.class_short
        );
        const leaveData_group_by_date = utils.listGroupBy(classLevelVacations, 'date');

        const attendanceByStudentDate = {};
        rows.forEach((att) => {
          if (!att?.student_id || !att?.date) return;
          const sid = att.student_id;
          if (!attendanceByStudentDate[sid]) attendanceByStudentDate[sid] = {};
          if (!attendanceByStudentDate[sid][att.date]) attendanceByStudentDate[sid][att.date] = [];
          attendanceByStudentDate[sid][att.date].push(att);
        });

        const classConfigMap = {};
        const classFirstShift = {};
        (global.config?.classes || []).forEach((cls) => {
          classConfigMap[cls.class_short] = cls;
          const firstShift = cls?.shifts?.[0];
          if (firstShift?.start && firstShift?.end) {
            classFirstShift[cls.class_short] = `${firstShift.start} - ${firstShift.end}`;
          }
        });

        const classStudentCounts = {};
        all__students.forEach((student) => {
          const cls = student?.class_short;
          if (!cls) return;
          classStudentCounts[cls] = (classStudentCounts[cls] || 0) + 1;
        });

        const initReport = (class_short, class_name, total_days_for_range, presentable_days_for_range = 0) => ({
          class_short,
          class_name: class_name || '',
          total_students: classStudentCounts[class_short] || 0,
          total_days: total_days_for_range,
          total_presentable_days: presentable_days_for_range,
          total_present: 0,
          total_in: 0,
          total_absent: 0,
          present_percent: 0,
        });

        const classWise = {};
        const classPresentableDays = {};
        const isClassHoliday = (date, class_short) => {
          if (weekendSet.has(date)) return true;
          const leaves = leaveData_group_by_date[date] || [];
          return leaves.some(leave => leave.class_short === '_all_' || leave.class_short === class_short);
        };

        (global.config?.classes || []).forEach((cls) => {
          classPresentableDays[cls.class_short] = {};
          Object.keys(monthMeta).forEach((monthKey) => {
            let count = 0;
            dateMeta.forEach(({ date, monthKey: mk }) => {
              if (mk !== monthKey) return;
              if (!isClassHoliday(date, cls.class_short)) count += 1;
            });
            classPresentableDays[cls.class_short][monthKey] = count;
          });
        });

        (global.config?.classes || []).forEach((cls) => {
          classWise[cls.class_short] = {};
          Object.keys(monthMeta).forEach((monthKey) => {
            classWise[cls.class_short][monthKey] = initReport(
              cls.class_short,
              cls.class_name,
              monthMeta[monthKey].total_days,
              classPresentableDays?.[cls.class_short]?.[monthKey] || 0
            );
          });
        });

        all__students.forEach((student) => {
          const { dakhela, class_short } = student || {};
          if (!class_short) return;

          if (!classWise[class_short]) {
            const cls = classConfigMap[class_short] || {};
            classWise[class_short] = {};
            Object.keys(monthMeta).forEach((monthKey) => {
              classWise[class_short][monthKey] = initReport(
                class_short,
                cls.class_name || '',
                monthMeta[monthKey].total_days,
                classPresentableDays?.[class_short]?.[monthKey] || 0
              );
            });
          }

          const firstShiftDuration = classFirstShift[class_short] || null;

          dateMeta.forEach(({ date, monthKey }) => {
            const is_presentable_day = !isClassHoliday(date, class_short);

            let is_present = false;
            if (is_presentable_day) {
              const dayAttendance = attendanceByStudentDate?.[dakhela]?.[date] || [];
              if (firstShiftDuration) {
                is_present = dayAttendance.some(att => att.shift_duration === firstShiftDuration);
              } else {
                is_present = dayAttendance.length > 0;
              }
            }

            const reportItem = classWise[class_short][monthKey];
            if (is_presentable_day && is_present) reportItem.total_present += 1;
          });
        });

        Object.keys(classWise).forEach((cls) => {
          Object.keys(classWise[cls]).forEach((monthKey) => {
            const item = classWise[cls][monthKey];
            const denom = item.total_students * item.total_presentable_days;
            item.total_in = item.total_present;
            item.total_absent = Math.max(0, denom - item.total_present);
            item.present_percent = denom > 0 ? Number(((item.total_present / denom) * 100).toFixed(2)) : 0;
          });

          const className = classConfigMap[cls]?.class_name || classWise[cls][Object.keys(classWise[cls])[0]]?.class_name || '';
          const allReport = initReport(cls, className, 0, 0);
          Object.keys(classWise[cls]).forEach((monthKey) => {
            const item = classWise[cls][monthKey];
            allReport.total_days += item.total_days;
            allReport.total_presentable_days += item.total_presentable_days;
            allReport.total_present += item.total_present;
            allReport.total_in = allReport.total_present;
          });
          const allDenom = allReport.total_students * allReport.total_presentable_days;
          allReport.total_absent = Math.max(0, allDenom - allReport.total_present);
          allReport.present_percent = allDenom > 0
            ? Number(((allReport.total_present / allDenom) * 100).toFixed(2))
            : 0;
          classWise[cls]['total'] = allReport;
        });

        const classRanking = Object.keys(classWise).sort((a, b) => {
          const aVal = classWise[a]?.total?.present_percent || 0;
          const bVal = classWise[b]?.total?.present_percent || 0;
          return bVal - aVal;
        });

        res.send({ data: { classWise, classRanking } });
      });
    }


    modify_data_by_action(attendanceList, action, req){

      
      if(!action) return attendanceList
      else {
        if(action === 'classwise_data'){
          let { start_date, end_date } = req.query 
          let date_duration = utils.createDateRange(start_date, end_date)
          let { leaveData, weekends, all__students, class_short: class___short, total_days } = req.body 
          let weekend_leaves = date_duration.filter(date => weekends.includes(moment(date).format('dddd')))
          let leaveData_excluded_weekends = leaveData.filter(leave => !weekend_leaves.includes(leave.date))
          let leaveData_group_by_date = utils.listGroupBy(leaveData_excluded_weekends, 'date')
 

          let attendanceGroup = utils.listGroupBy(attendanceList, 'student_id')

          let DATA = []
          

          all__students.forEach((student, i) => {
            let { dakhela, class_short } = student

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
              let class_vacations = _leaves.filter(
                leave => leave.type === 'vacation' && (leave.class_short == '_all_' || leave.class_short == class_short)
              )
              let student_leaves = _leaves.filter(
                leave => leave.type === 'leave' && leave.student_id == dakhela
              )
              let day_leaves = [...class_vacations, ...student_leaves]

              let is_leave_day = student_leaves.length > 0
              let is_weekend = weekend_leaves.includes(date)
              let is_presentable_day = !(is_weekend || class_vacations.length > 0)
              let is_present = is_presentable_day ? Boolean(shiftInfo?.[0]?.is_present) : false
              let is_preset_all_shifts = is_presentable_day ? shiftInfo.every(shift => shift.is_present) : false
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
            
          }) 

          fs.writeFileSync('./_samples/DATA.json', JSON.stringify(DATA, null, 2));

          return { 
            attendance: DATA, 
            report: {
              
            }
          }
        }
      }


    }


    

    /**
     * ==================================
     * ==================================
     * ==================================
     * ==================================
     * ==================================
     * ==================================
     * ==================================
     * ==================================
     * ==================================
     */


    getAttendanceReportsForSingleClass(req, res){
      const {
        start_date,
        end_date,
      } = req.query;

      const payload = req.body || {};
      const weekends = Array.isArray(payload.weekends) ? payload.weekends : [];
      const leaveData = Array.isArray(payload.leaveData) ? payload.leaveData : [];
      const total_days = Number(payload.total_days || 0);
      const class_students = Array.isArray(payload.class_students) ? payload.class_students : [];

      if (!class_students.length) {
        return res.send({ data: { class_short: null, class_name: '', total_days: 0, total_presentable_days: 0, students: [] } });
      }

      const class_short = class_students[0]?.class_short || null;
      const class_name = (global.config?.classes || []).find(c => c.class_short === class_short)?.class_name || '';

      const student_ids = class_students.map(s => Number(s.dakhela)).filter(Boolean);

      let date_duration = utils.createDateRange(start_date, end_date);
      if (total_days > 0 && total_days < date_duration.length) {
        date_duration = date_duration.slice(0, total_days);
      }

      const weekend_leaves = date_duration.filter(date => weekends.includes(moment(date).format('dddd')));
      const weekendSet = new Set(weekend_leaves);
      const classLevelVacations = leaveData.filter(
        leave => leave?.type === 'vacation' && leave?.class_short
      );
      const leaveData_group_by_date = utils.listGroupBy(classLevelVacations, 'date');

      const isClassHoliday = (date) => {
        if (weekendSet.has(date)) return true;
        const leaves = leaveData_group_by_date[date] || [];
        return leaves.some(leave => leave.class_short === '_all_' || leave.class_short === class_short);
      };

      const total_presentable_days = date_duration.reduce((sum, date) => {
        return sum + (isClassHoliday(date) ? 0 : 1);
      }, 0);

      const monthMeta = {};
      date_duration.forEach((date) => {
        const monthKey = moment(date).startOf('month').format('YYYY-MM-01');
        if (!monthMeta[monthKey]) {
          monthMeta[monthKey] = { total_days: 0, total_presentable_days: 0 };
        }
        monthMeta[monthKey].total_days += 1;
        if (!isClassHoliday(date)) monthMeta[monthKey].total_presentable_days += 1;
      });

      const whereParts = [];
      const params = [];
      if (student_ids.length) {
        whereParts.push(`a.student_id IN (${student_ids.map(() => "?").join(",")})`);
        params.push(...student_ids);
      }
      if (start_date && end_date) {
        whereParts.push("a.date BETWEEN ? AND ?");
        params.push(start_date, end_date);
      }

      const whereClause = whereParts.length ? "WHERE " + whereParts.join(" AND ") : "";

      const dataQuery = `
        SELECT a.*, s.class_short, s.name AS student_name
        FROM ${this.tableName} a 
        LEFT JOIN students s ON a.student_id = s.dakhela
        ${whereClause} 
      `;

      this.db.all(dataQuery, params, (err, rows) => {
        if (err) return res.status(500).send({ error: err.message });

        const attendanceByStudentDate = {};
        rows.forEach((att) => {
          if (!att?.student_id || !att?.date) return;
          const sid = att.student_id;
          if (!attendanceByStudentDate[sid]) attendanceByStudentDate[sid] = {};
          if (!attendanceByStudentDate[sid][att.date]) attendanceByStudentDate[sid][att.date] = [];
          attendanceByStudentDate[sid][att.date].push(att);
        });

        const classFirstShift = {};
        (global.config?.classes || []).forEach((cls) => {
          const firstShift = cls?.shifts?.[0];
          if (firstShift?.start && firstShift?.end) {
            classFirstShift[cls.class_short] = `${firstShift.start} - ${firstShift.end}`;
          }
        });

        const firstShiftDuration = classFirstShift[class_short] || null;

        const students = class_students.map((student) => {
          const dakhela = Number(student?.dakhela);
          let total_present = 0;
          const monthly = {};
          Object.keys(monthMeta).forEach((monthKey) => {
            monthly[monthKey] = {
              total_days: monthMeta[monthKey].total_days,
              total_presentable_days: monthMeta[monthKey].total_presentable_days,
              total_present: 0,
              total_absent: 0,
              present_percent: 0,
            };
          });

          date_duration.forEach((date) => {
            const is_presentable_day = !isClassHoliday(date);
            if (!is_presentable_day) return;

            const dayAttendance = attendanceByStudentDate?.[dakhela]?.[date] || [];
            let is_present = false;
            if (firstShiftDuration) {
              is_present = dayAttendance.some(att => att.shift_duration === firstShiftDuration);
            } else {
              is_present = dayAttendance.length > 0;
            }

            if (is_present) total_present += 1;

            const monthKey = moment(date).startOf('month').format('YYYY-MM-01');
            const monthItem = monthly[monthKey];
            if (monthItem && is_present) monthItem.total_present += 1;
          });

          Object.keys(monthly).forEach((monthKey) => {
            const item = monthly[monthKey];
            const denom = item.total_presentable_days;
            item.total_absent = Math.max(0, denom - item.total_present);
            item.present_percent = denom > 0
              ? Number(((item.total_present / denom) * 100).toFixed(2))
              : 0;
          });

          const denom = total_presentable_days;
          const total_absent = Math.max(0, denom - total_present);
          const present_percent = denom > 0 ? Number(((total_present / denom) * 100).toFixed(2)) : 0;

          return {
            id: student?.id || null,
            name: student?.name || null,
            dakhela,
            class_short,
            total_days: date_duration.length,
            total_presentable_days,
            total_present,
            total_in: total_present,
            total_absent,
            present_percent,
            monthly,
          };
        });

        res.send({
          data: {
            class_short,
            class_name,
            total_days: date_duration.length,
            total_presentable_days,
            students,
          }
        });
      });
    }





  }
  
  module.exports = Attendance;

  
  
