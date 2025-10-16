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

  async list(req, res) {
    const { type, start_date, end_date, date, class_short, student_id, vacation_and_leave_of_student } = req.query;
  
    let query = `SELECT * FROM leave_and_vacation WHERE 1=1`;
    const queryParams = [];
    if(type) {
      query += ` AND type = ?`;
      queryParams.push(type);
    }
  
    if (start_date && end_date) {
      query += ` AND date BETWEEN ? AND ?`;
      queryParams.push(start_date, end_date);
    } else if (date) {
      query += ` AND date = ?`;
      queryParams.push(date);
    }
  
    if(vacation_and_leave_of_student && student_id && class_short) {
      query += ` AND (student_id = ? OR (class_short = ? OR class_short = '_all_'))`;
      queryParams.push(student_id, class_short);
    } else {
    if (class_short) {
      query += ` AND (class_short = ? OR class_short = '_all_')`;
        queryParams.push(class_short);
      }
    
      if (student_id) {
        query += ` AND student_id = ?`;
        queryParams.push(student_id);
      }
    }

    console.log({start_date, end_date, date, class_short, student_id});
    console.log({query, queryParams});
  
    this.db.all(query, queryParams, (err, rows) => {
      if (err) {
        res.status(500).send({ error: err.message, query, queryParams });
        return;
      }
      res.send({ data: rows });
    });
  }

  async api_delete(req, res) {

    let identity_strings = req.body.identity_strings;
    if (!identity_strings) {
      return res.status(400).json({ error: "Missing identity_strings in request body" });
    }


    this.delete(identity_strings, (err, result) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      res.send(result);
    })
     
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
        r.class_short,
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
  delete(identity_strings, callback) {
    let sql = "";
    let params = [];

    if (Array.isArray(identity_strings)) {
      sql = `DELETE FROM ${this.tableName} WHERE identity_string IN (${identity_strings.map(() => "?").join(",")})`;
      params = identity_strings;
      this.db.run(sql, params, function (err) {
        if (err) return callback?.(err);
        callback?.(null, { deleted: this.changes });
      });
    } 
  }
}

  
module.exports = LeaveAndVacations;
  