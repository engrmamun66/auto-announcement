class LeaveAndVacations {
  constructor(db) {
    this.tableName = "leave_and_vacation"; // fixed table name
    this.db = db;
  }

  api_addMultiple(req, res){
    const records = req.body.records || [];
    this.addMultiple(records, (err, result) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      res.json(result);
    });
  }

 




  

  // ➕ Add multiple records at once
  addMultiple(records = [], callback) {
    if (!records.length) return callback?.(null, { message: "No records to insert." });

    const placeholders = records
      .map(() => "(?, ?, ?, ?, ?, ?)")
      .join(", ");

    const values = [];
    for (const r of records) {
      values.push(
        r.type || "leave",
        r.class_short || "ALL",
        r.student_id || null,
        r.date,
        r.reason || null,
        r.identity_string || null
      );
    }

    const sql = `
      INSERT INTO ${this.tableName} 
      (type, class_short, student_id, date, reason, identity_string)
      VALUES ${placeholders};
    `;

    this.db.run(sql, values, function (err) {
      if (err) return callback?.(err);
      callback?.(null, { inserted: records.length });
    });
  }

  // ✏️ Edit single record by id
  edit(id, callback) {
    const sql = `SELECT * FROM ${this.tableName} WHERE id = ?`;
    this.db.get(sql, [id], (err, row) => {
      if (err) return callback?.(err);
      callback?.(null, row);
    });
  }

  // 🔁 Update (single or bulk via identity_string)
  update(data, callback) {
    const { id, identity_string } = data;
    const fields = [];
    const values = [];

    // Build dynamic SET clause
    for (const [key, val] of Object.entries(data)) {
      if (["id", "identity_string"].includes(key)) continue;
      fields.push(`${key} = ?`);
      values.push(val);
    }
    values.push(new Date().toISOString()); // for updated timestamp

    let whereClause = "";
    if (identity_string) {
      whereClause = "WHERE identity_string = ?";
      values.push(identity_string);
    } else if (id) {
      whereClause = "WHERE id = ?";
      values.push(id);
    } else {
      return callback?.(new Error("Missing id or identity_string for update"));
    }

    const sql = `
      UPDATE ${this.tableName} 
      SET ${fields.join(", ")}, updated = ?
      ${whereClause};
    `;

    this.db.run(sql, values, function (err) {
      if (err) return callback?.(err);
      callback?.(null, { updated: this.changes });
    });
  }

  // ❌ Delete (single or bulk via identity_string)
  delete(identifier, callback) {
    let sql = "";
    let params = [];

    if (Array.isArray(identifier)) {
      sql = `DELETE FROM ${this.tableName} WHERE identity_string IN (${identifier.map(() => "?").join(",")})`;
      params = identifier;
    } else if (typeof identifier === "string") {
      sql = `DELETE FROM ${this.tableName} WHERE identity_string = ?`;
      params = [identifier];
    } else if (typeof identifier === "number") {
      sql = `DELETE FROM ${this.tableName} WHERE id = ?`;
      params = [identifier];
    } else {
      return callback?.(new Error("Invalid identifier type"));
    }

    this.db.run(sql, params, function (err) {
      if (err) return callback?.(err);
      callback?.(null, { deleted: this.changes });
    });
  }
}

  
module.exports = LeaveAndVacations;
  