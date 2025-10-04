class Attendance {
    constructor(db) {
      this.tableName = "attendance";
      this.db = db;
    }
  
    // Add attendance
    add(req, res) {
        const { student_id, date, in_time, out_time, remarks } = req.body;
        if (!student_id || !date) {
          return res.status(400).send({ error: "student_id and date are required." });
        }
      
        // Step 1: count today's entries for this student
        const countQuery = `SELECT COUNT(*) as total FROM ${this.tableName} WHERE student_id = ? AND date = ?`;
      
        this.db.get(countQuery, [student_id, date], (err, row) => {
          if (err) return res.status(500).send({ error: err.message });
      
          const total = row.total;
      
          if (total === 0) {
            // First entry → IN
            const query = `
              INSERT INTO ${this.tableName} (student_id, date, status, in_time, remarks)
              VALUES (?, ?, 'in', ?, ?)
            `;
            this.db.run(query, [student_id, date, in_time || null, remarks || null], function (err) {
              if (err) return res.status(500).send({ error: err.message });
              res.send({ message: "In-time recorded.", id: this.lastID });
            });
      
          } else {
            // For second or more entries → OUT
            // Step 2: Delete all previous OUT entries for same student/date
            const deleteQuery = `
              DELETE FROM ${this.tableName} 
              WHERE student_id = ? AND date = ? AND status = 'out'
            `;
            this.db.run(deleteQuery, [student_id, date], (delErr) => {
              if (delErr) return res.status(500).send({ error: delErr.message });
      
              // Step 3: Insert new OUT entry
              const insertOutQuery = `
                INSERT INTO ${this.tableName} (student_id, date, status, out_time, remarks)
                VALUES (?, ?, 'out', ?, ?)
              `;
              this.db.run(insertOutQuery, [student_id, date, out_time || null, remarks || null], function (err) {
                if (err) return res.status(500).send({ error: err.message });
                res.send({ message: "Out-time recorded (previous out entries cleared).", id: this.lastID });
              });
            });
          }
        });
      }
      
  
    // Get attendance records
    list(req, res) {
      const { student_id, date } = req.query;
      let query = `SELECT * FROM ${this.tableName} WHERE 1=1`;
      let params = [];
  
      if (student_id) { query += " AND student_id = ?"; params.push(student_id); }
      if (date) { query += " AND date = ?"; params.push(date); }
  
      this.db.all(query, params, (err, rows) => {
        if (err) return res.status(500).send({ error: err.message });
        res.send(rows);
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
  