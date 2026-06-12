// const sqlite3 = require("sqlite3").verbose();
const xlsx = require("xlsx");
const multer = require("multer");
const upload = multer({ dest: DIR + "/public" });
const fs = require("fs");
const path = require("path");
const moment = require('moment')
const utils = require('./utls')
const { formatDate, formatTimeWithPeriod } = require('./utils') 

class Attendance {
    constructor(db) {
      this.tableName = "attendance";
      this.db = db;
    }

    writeClasswiseSample(data = []) {
      const sampleDir = path.join(global.DIR || path.join(__dirname, '..'), '_samples');

      if (!fs.existsSync(sampleDir)) return;

      try {
        fs.writeFileSync(path.join(sampleDir, 'DATA.json'), JSON.stringify(data, null, 2));
      } catch (error) {
        console.error('Unable to write classwise sample data:', error.message);
      }
    }

    getAttendancePresetCountBy() {
      const preset = global.config?.settings?.attendance?.preset_count_by;
      return typeof preset === "string" && preset.trim()
        ? preset.trim()
        : "if_present_in_first_shift";
    }

    getClassConfig(class_short = '') {
      return (global.config?.classes || []).find(eachClass => eachClass?.class_short == class_short) || {};
    }

    getClassShiftDurations(class_short = '') {
      const classConfig = this.getClassConfig(class_short);
      const shifts = Array.isArray(classConfig?.shifts) ? classConfig.shifts : [];

      return shifts
        .map((shift) => {
          if (!shift?.start || !shift?.end) return null;
          return `${shift.start} - ${shift.end}`;
        })
        .filter(Boolean);
    }

    getPresentShiftNumbers(dayAttendance = [], class_short = '') {
      const rows = Array.isArray(dayAttendance) ? dayAttendance : [];
      const shiftDurations = this.getClassShiftDurations(class_short);
      const presentShiftNumbers = new Set();

      rows.forEach((att) => {
        if (!att) return;

        const durationText = typeof att.shift_duration === "string" ? att.shift_duration.trim() : "";
        let shiftIndex = durationText ? shiftDurations.findIndex(duration => duration === durationText) : -1;

        if (shiftIndex === -1) {
          const shiftNumber = Number(att.shift_number);
          if (Number.isInteger(shiftNumber) && shiftNumber > 0) {
            shiftIndex = shiftNumber - 1;
          }
        }

        if (shiftIndex >= 0) {
          presentShiftNumbers.add(shiftIndex + 1);
        }
      });

      return Array.from(presentShiftNumbers).sort((a, b) => a - b);
    }

    isPresentByPreset(dayAttendance = [], class_short = '', presetOverride = null) {
      const rows = Array.isArray(dayAttendance) ? dayAttendance : [];
      if (!rows.length) return false;

      const shiftDurations = this.getClassShiftDurations(class_short);
      if (!shiftDurations.length) {
        return rows.length > 0;
      }

      const presentShiftNumbers = this.getPresentShiftNumbers(rows, class_short);
      const totalShifts = shiftDurations.length;
      const presentShiftSet = new Set(presentShiftNumbers);
      const preset = String(presetOverride || this.getAttendancePresetCountBy()).trim();

      if (preset === 'if_present_in_last_shift' || preset === 'if_prent_in_last_shift') {
        return presentShiftSet.has(totalShifts);
      }

      if (preset === 'if_present_in_all_shifts') {
        return totalShifts > 0 && presentShiftNumbers.length >= totalShifts;
      }

      if (preset === 'if_prent_in_both_shift') {
        if (totalShifts === 1) return presentShiftSet.has(1);
        return presentShiftSet.has(1) && presentShiftSet.has(totalShifts);
      }

      const minimumMatch = preset.match(/^if_present_minimum_(?:\{)?(\d+)(?:\})?_shift$/);
      if (minimumMatch) {
        const minimumRequired = Math.max(1, Math.min(totalShifts, Number(minimumMatch[1]) || 1));
        return presentShiftNumbers.length >= minimumRequired;
      }

      const specificShiftMatch = preset.match(/^if_present_in_\[(.+)\]$/);
      if (specificShiftMatch) {
        const requiredShiftNumbers = specificShiftMatch[1]
          .split(',')
          .map(item => Number(String(item).trim()))
          .filter(number => Number.isInteger(number) && number > 0 && number <= totalShifts);

        if (!requiredShiftNumbers.length) {
          return presentShiftSet.has(1);
        }

        return requiredShiftNumbers.every(number => presentShiftSet.has(number));
      }

      return presentShiftSet.has(1);
    }

    isPresentInAllConfiguredShifts(dayAttendance = [], class_short = '') {
      return this.isPresentByPreset(dayAttendance, class_short, 'if_present_in_all_shifts');
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
      const Sms = this.Sms;

      db.run(query, params, function (err) {
        if (err) return res.status(500).send({ error: err.message });

        const insertedId = this.lastID;
        db.get(`SELECT * FROM attendance WHERE id = ?`, [insertedId], (err, row) => {
          if (err) return res.status(500).send({ error: err.message });

          // Send SMS if enabled
          const skipSms = req.query?.skipSms === 'true';
          if (row && row.student_id && row.date && !skipSms) {
            db.get(`SELECT * FROM students WHERE dakhela = ?`, [row.student_id], (err, student) => {
              if (!err && student && student.phone_number) {
                const smsConfig = global.config?.settings?.sms;
                if (smsConfig?.enabled && Sms) {
                  let shouldSendSms = false;
                  let template = null;
                  let time = null;

                  // Identify if check-in or check-out
                  if (row.in_time && smsConfig?.send_on_in) {
                    shouldSendSms = true;
                    template = smsConfig?.in_message_template;
                    time = row.in_time;
                  } else if (row.out_time && smsConfig?.send_on_out) {
                    shouldSendSms = true;
                    template = smsConfig?.out_message_template;
                    time = row.out_time;
                  }

                  if (shouldSendSms && template) {
                    const formattedTime = formatTimeWithPeriod(time || '');
                    const message = template
                      .replace(/{name}/g, student.name?.split('||')[0] || 'Student')
                      .replace(/{class}/g, student.class || 'N/F')
                      .replace(/{date}/g, formatDate(row.date || ''))
                      .replace(/{time}/g, formattedTime)
                    Sms._sendSmsInternal([student.phone_number], message).catch(err => {
                      console.error('SMS send error:', err.message);
                    });
                  }
                }
              }
            });
          }

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
      const { student_id, date, shift_duration } = req.body || {};

      // Delete all records for shift (handles both IN and OUT times)
      if (student_id && date && shift_duration) {
        const query = `DELETE FROM ${this.tableName} WHERE student_id = ? AND date = ? AND shift_duration = ?`;
        this.db.run(query, [student_id, date, shift_duration], function (err) {
          if (err) return res.status(500).send({ error: err.message });
          res.send({ message: "Attendance deleted.", deleted: this.changes });
        });
      } else if (id) {
        // Fallback: delete by ID only
        const query = `DELETE FROM ${this.tableName} WHERE id = ?`;
        this.db.run(query, [id], function (err) {
          if (err) return res.status(500).send({ error: err.message });
          res.send({ message: "Attendance deleted.", deleted: this.changes });
        });
      } else {
        return res.status(400).send({ error: "ID or shift details required." });
      }
    }


    // Delete attendance
    deleteBulk(req, res) {
      const { ids } = req.body;

      if (!ids || !Array.isArray(ids) || ids.length === 0) {
        return res.status(400).send({ error: "ids array is required for bulk deletion." });
      }

      const recordIds = ids.map(Number).filter(Boolean);
      if (recordIds.length === 0) {
        return res.status(400).send({ error: "No valid record IDs provided." });
      }

      const placeholders = recordIds.map(() => '?').join(',');
      const query = `DELETE FROM ${this.tableName} WHERE id IN (${placeholders})`;
      const params = recordIds;

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
        (global.config?.classes || []).forEach((cls) => {
          classConfigMap[cls.class_short] = cls;
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

          dateMeta.forEach(({ date, monthKey }) => {
            const is_presentable_day = !isClassHoliday(date, class_short);

            let is_present = false;
            if (is_presentable_day) {
              const dayAttendance = attendanceByStudentDate?.[dakhela]?.[date] || [];
              is_present = this.isPresentByPreset(dayAttendance, class_short);
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


    isPresentByShiftTime(dayAttendance = [], shiftTime = '') {
      const rows = Array.isArray(dayAttendance) ? dayAttendance : [];
      if (!rows.length || !shiftTime) return false;

      const shiftMoment = moment(shiftTime, 'HH:mm');
      if (!shiftMoment.isValid()) return false;

      // Check if any punch record exists at or after the shift start time
      return rows.some(att => {
        const inTime = att?.in_time ? moment(att.in_time, 'HH:mm') : null;
        return inTime && inTime.isValid() && inTime.isSameOrAfter(shiftMoment);
      });
    }

    modify_data_by_action(attendanceList, action, req){


      if(!action) return attendanceList
      else {
        if(action === 'classwise_data'){
          let { start_date, end_date, selectedShiftTime } = req.query
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

            let _targetStd = this.getClassConfig(class_short)
            let class_name = _targetStd?.class_name || ''
            let student_shifts = Array.isArray(_targetStd?.shifts) ? _targetStd.shifts : []
        
            // Calucating Every Single Date for a student
            let date_wise_report = date_duration.map((date, j) => {

              let date_wide_attendace = student_attendance.filter(att => att.date === date)
              let attendance = null

              let shiftInfo = student_shifts.map(shift => {
                let duration_text  = `${shift.start} - ${shift.end}`
                // Get all records for this shift (may have separate IN/OUT records)
                let shiftRecords = date_wide_attendace.filter(att => att.shift_duration === duration_text)
                // Merge IN and OUT times from multiple records
                let merged = null
                if (shiftRecords.length > 0) {
                  merged = { ...shiftRecords[0] }
                  // Combine in_time and out_time from all records
                  shiftRecords.forEach(record => {
                    if (record.in_time) merged.in_time = record.in_time
                    if (record.out_time) merged.out_time = record.out_time
                  })
                }
                let shiftItem = {
                  ...shift,
                  is_present: Boolean(merged),
                  attendance: merged,
                }
                if(!attendance){
                  attendance = merged || null
                }
                return shiftItem
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
              let is_present = false
              if (is_presentable_day) {
                if (selectedShiftTime) {
                  is_present = this.isPresentByShiftTime(date_wide_attendace, selectedShiftTime)
                } else {
                  is_present = this.isPresentByPreset(date_wide_attendace, class_short)
                }
              }
              let is_preset_all_shifts = is_presentable_day ? this.isPresentInAllConfiguredShifts(date_wide_attendace, class_short) : false
              let let_in_minute = shiftInfo[0]?.attendance?.late_in_minute || 0
              let in_out_count = date_wide_attendace.reduce((total, att) => {
                return total + (att?.in_time ? 1 : 0) + (att?.out_time ? 1 : 0)
              }, 0)

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
                in_out_count,
                day_leaves,
                let_in_minute, 
                is_presentable_day,
                student_name: attendance?.student_name || student?.name || null,
              } 

              data['_leaves'] = _leaves 

              return data

            })  
            
           
            date_wise_report.sort((a, b) => (a.serial) - b.serial); 
            DATA.push(date_wise_report)  
            
          }) 

          this.writeClasswiseSample(DATA);

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
            const is_present = this.isPresentByPreset(dayAttendance, class_short);

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

  
  
