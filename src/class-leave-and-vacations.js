
class LeaveAndVacations {
    constructor(db) {
      this.tableName = "class_holidays";
      this.db = db;
    }
  
    // Add holiday
    add(req, res) {
      const { class_id, holiday_date, type, reason } = req.body;
      if (!class_id || !holiday_date || !type) {
        return res.status(400).send({ error: "class_id, holiday_date and type are required." });
      }
  
      const query = `
        INSERT INTO ${this.tableName} (class_id, holiday_date, type, reason)
        VALUES (?, ?, ?, ?)
      `;
  
      this.db.run(query, [class_id, holiday_date, type, reason || null], function (err) {
        if (err) return res.status(500).send({ error: err.message });
        res.send({ message: "Holiday added.", id: this.lastID });
      });
    }
  
    // List holidays
    list(req, res) {
      const { class_id } = req.query;
      let query = `SELECT * FROM ${this.tableName} WHERE 1=1`;
      let params = [];
  
      if (class_id) { query += " AND class_id=?"; params.push(class_id); }
  
      this.db.all(query, params, (err, rows) => {
        if (err) return res.status(500).send({ error: err.message });
        res.send(rows);
      });
    }
  
    // Update holiday
    update(req, res) {
      const { id, holiday_date, type, reason } = req.body;
      if (!id) return res.status(400).send({ error: "ID required." });
  
      const query = `
        UPDATE ${this.tableName} 
        SET holiday_date=?, type=?, reason=?, updated=CURRENT_TIMESTAMP
        WHERE id=?
      `;
  
      this.db.run(query, [holiday_date, type, reason, id], function (err) {
        if (err) return res.status(500).send({ error: err.message });
        res.send({ message: "Holiday updated.", changes: this.changes });
      });
    }
  
    // Delete holiday
    delete(req, res) {
      const { id } = req.params;
      if (!id) return res.status(400).send({ error: "ID required." });
  
      const query = `DELETE FROM ${this.tableName} WHERE id = ?`;
      this.db.run(query, [id], function (err) {
        if (err) return res.status(500).send({ error: err.message });
        res.send({ message: "Holiday deleted.", deleted: this.changes });
      });
    }
  }
  
  module.exports = LeaveAndVacations;
  