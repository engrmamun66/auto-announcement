// const sqlite3 = require("sqlite3").verbose();
const xlsx = require("xlsx");
const multer = require("multer");
const upload = multer({ dest: DIR + "/public" });
const { classes } = require("../config");
const fs = require("fs");
const path = require("path");
const moment = require('moment')
const utils = require('./utls')

class Students { 

  insertQuery = `
        INSERT INTO students (name,	dakhela, class, class_short, year, status, sound1, sound2, sound3)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      `;

  constructor(db) {
    this.tableName = "students";
    this.db = db;
  }

  getStudents(req, res) {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;
  
    const { name, class: className, sound1, dakhela } = req.query;
  
    let query = `SELECT * FROM ${this.tableName} WHERE 1=1`;
    let queryParams = [];
  
    // Add filters if provided
    if (name) {
      query += ` AND name LIKE ?`;
      queryParams.push(`%${name}%`);
    }
  
    if (className) {
      query += ` AND class = ?`;
      queryParams.push(className);
    }
  
    if (dakhela) {
      query += ` AND dakhela = ?`;       
      queryParams.push(dakhela);
    }
  
    if (sound1) {
      if (sound1 === 'has_sound') {
        query += ` AND sound1 IS NOT NULL`;
      } else if (sound1 === 'no_sound') {
        query += ` AND sound1 IS NULL`;
      }
    }
  
    // Add pagination
    query += ` LIMIT ? OFFSET ?`;
    queryParams.push(limit, offset);
  
    this.db.all(query, queryParams, (err, rows) => {
      if (err) {
        res.status(500).send({ error__1: err.message, query, queryParams });
        return;
      }
  
      // Count total records for pagination metadata
      const countQuery = `SELECT COUNT(*) as total FROM ${this.tableName} WHERE 1=1`;
  
      let countQueryParams = [...queryParams.slice(0, queryParams.length - 2)]; // Exclude limit and offset for count query
  
      this.db.get(countQuery, [], (err, result) => {
        if (err) {
          res.status(500).send({ error__2: err.message, query, queryParams });
          return;
        }
  
        const total = result.total;
        const totalPages = Math.ceil(total / limit);
  
        // Send response with data and pagination info
        res.send({
          data: rows.map(row => {
            if(row.sound1) row.sound1 = utils.audioFullUrl(req, row.sound1)
            if(row.sound2) row.sound2 = utils.audioFullUrl(req, row.sound2)
            if(row.sound3) row.sound3 = utils.audioFullUrl(req, row.sound3)
            return row
          }),
          pagination: {
            page,
            total,
            limit,
            totalPages,
          },
        });
      });
    });
  }
  

  getStudent(req, res) { 
    let { barcode } = req.query
    let [ class_short, dakhela ] = barcode.split('-')

    const query = `SELECT * FROM ${this.tableName} WHERE class_short = ? AND dakhela = ?`;
  
    this.db.all(query, [class_short, dakhela], (err, rows) => {
      if (err) {
        res.status(500).send({ error: err.message });
        return;
      }
  
      if (rows.length === 0) {
        res.status(404).send({ message: "No data found in the students table." });
        return;
      }

      let row = rows?.length ? rows.at(-1) : null;
      if(row){
        if(row.sound1) row.sound1 = utils.audioFullUrl(req, row.sound1)
        if(row.sound2) row.sound2 = utils.audioFullUrl(req, row.sound2)
        if(row.sound3) row.sound3 = utils.audioFullUrl(req, row.sound3)
      }
  
      res.send({
        data: row
      });
    });
  }
    
  

  importExcel(filePath, callback) {
    try {
      const workbook = xlsx.readFile(filePath);
      const sheetName = workbook.SheetNames[0]; // Assuming data is in the first sheet
      const data = xlsx.utils.sheet_to_json(workbook.Sheets[sheetName], {
        header: 1,
      });
  
      const insertQuery = `
        INSERT INTO students (name,	dakhela, class, class_short, year, status, sound1, sound2, sound3)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      `;
  
      const updateQuery = `
        UPDATE students
        SET name = ?, dakhela = ?, class = ?, class_short = ?, year = ?, status = ?, sound1 = ?, sound2 = ?, sound3 = ?
        WHERE id = ?
      `;
  
      const findQuery = `
        SELECT id FROM students WHERE dakhela = ? AND class = ? AND year = ?
      `;
  
      let errorOccurred = false;
  
      this.db.serialize(() => {
        data.forEach((row, i) => {
          if (i === 0) {
            // Skip the header row
            console.log("Skipping header row:", row);
            return;
          }
  
          if (row.length === 0 || !row[1]) {
            // Skip empty rows or rows without a name
            console.log("Skipping empty row or invalid data:", row);
            return;
          }
  
          const [id, name, dakhela, className, , year, status, sound1, sound2, sound3] = row;
  
          if (id) {
            // If `id` is provided, update the row
            this.db.run(
              updateQuery,
              [name, dakhela, className, classes?.[className] || '--', year, status || 1, sound1 || null, sound2 || null, sound3 || null, id],
              (err) => {
                if (err) {
                  console.error(`Error updating data with ID ${id}:`, err);
                  errorOccurred = true;
                }
              }
            );
          } else {
            // Check if the row already exists based on `dakhela`, `class`, and `year`
            this.db.get(findQuery, [dakhela, className, year], (err, existingRow) => {
              if (err) {
                console.error("Error querying existing data:", err);
                errorOccurred = true;
                return;
              }
  
              if (existingRow) {
                // Update the existing row
                this.db.run(
                  updateQuery,
                  [name, dakhela, className, classes?.[className] || '--', year, status || 1, sound1 || null, sound2 || null, sound3 || null, existingRow.id],
                  (err) => {
                    if (err) {
                      console.error(`Error updating data for dakhela: ${dakhela}, class: ${className}, year: ${year}:`, err);
                      errorOccurred = true;
                    }
                  }
                );
              } else {
                // Insert a new row
                this.db.run(
                  insertQuery,
                  [name, dakhela, className, classes?.[className] || '--', year, status || 1, sound1 || null, sound2 || null, sound3 || null],
                  (err) => {
                    if (err) {
                      console.error("Error inserting data:", err);
                      errorOccurred = true;
                    }
                  }
                );
              }
            });
          }
        });
      });
  
      fs.unlink(filePath, () => {});
      if (!errorOccurred) {
        callback(null, `Successfully imported ${data.length - 1} rows.`);
      } else {
        callback("Failed to upload some rows. Check logs for details.");
      }
    } catch (error) {
      callback(error, null);
    }
  }

  

  exportAll(req, res) {
    const query = `SELECT * FROM ${this.tableName}`;

    this.db.all(query, [], (err, rows) => {
      if (err) {
        res.status(500).send({ error: err.message });
        return;
      }

      if (rows.length === 0) {
        res.status(404).send({ message: "No data found in the students table." });
        return;
      }

      try {
        // Create a worksheet from the rows
        const worksheet = xlsx.utils.json_to_sheet(rows);

        // Create a new workbook and append the worksheet
        const workbook = xlsx.utils.book_new();
        xlsx.utils.book_append_sheet(workbook, worksheet, "Students");
        const fileName = `students_export_${moment().format('YYYY_MMM_DD')}_${Date.now()}.xlsx`
        const filePath = path.join( DIR, "/public/exports", fileName );    
        xlsx.writeFile(workbook, filePath);

        res.download(filePath, "students_export.xlsx", (err) => {
          if (err) {
            console.error("Error downloading file:", err.message);
            res.status(500).send({ error: "Error downloading file." });
          }

          // Delete the file after download
          // fs.unlink(filePath, (unlinkErr) => {
          //   if (unlinkErr) {
          //     console.error("Error deleting file:", unlinkErr.message);
          //   }
          // });
        });
      } catch (exportError) {
        console.error("Error exporting data:", exportError.message);
        res.status(500).send({ error: exportError.message });
      }
    });
  }


  truncateStudentsTable(req, res) {
    const query = `DELETE FROM students`;
  
    this.db.serialize(() => {
      this.db.run(query, (err) => {
        if (err) {
          res.status(500).send({ error: "Failed to truncate students table: " + err.message });
          return;
        }
  
        // Reset the auto-increment value
        this.db.run(`DELETE FROM sqlite_sequence WHERE name='students'`, (resetErr) => {
          if (resetErr) {
            res.status(500).send({ error: "Failed to reset ID sequence: " + resetErr.message });
            return;
          }
  
          res.send({ message: "Students table truncated successfully." });
        });
      });
    });
  }


  updateStatus(req, res) {
    const { id, status } = req.body;
  
    // Validate the input
    if (typeof id === "undefined" || typeof status === "undefined") {
      res.status(400).send({ error: "Invalid input. 'id' and 'status' are required." });
      return;
    }
  
    // Ensure status is either 0 or 1
    if (status !== 0 && status !== 1) {
      res.status(400).send({ error: "Invalid status value. Must be 0 or 1." });
      return;
    }
  
    const query = `UPDATE students SET status = ? WHERE id = ?`;
  
    this.db.run(query, [status, id], (err) => {
      if (err) {
        res.status(500).send({ error: "Failed to update status: " + err.message });
        return;
      }
  
      res.send({ message: `Status updated to ${status} for student ID ${id}.` });
    });
  }


  uploadAudio(req, res){
    if (!req.file) {
      res.status(400).send({ error: "No audio file uploaded or invalid file type." });
      return;
    }
  
    let { id, column } = req.body;
    const audioPath = `/media/${req.file.filename}`;  

   
  
    // Update sound1 column in the database
    const query = `UPDATE students SET ${column} = ? WHERE id = ?`;
    this.db.run(query, [audioPath, id], (err) => {
      if (err) {
        res.status(500).send({ error: "Error updating database" });
        return;
      }
      res.send({
        message: "Audio uploaded successfully",
        audio_path: audioPath,
        audio_url: utils.audioFullUrl(req, audioPath),
      });
    });
  }

  deleteAudio(req, res){
    const { id, column } = req.params;
    
    // Query to fetch the current sound file path from the database
    const query = `SELECT ${column} FROM ${this.tableName} WHERE id = ?`;
    
    this.db.get(query, [id], (err, row) => {
      if (err) {
        return res.status(500).send({ error: 'Error fetching data from database' });
      }

      if (!row || !row[column]) {
        return res.status(404).send({ error: 'No audio file found for this student' });
      }

      const audioFilePath = path.join(DIR, 'public', row[column]);

  
      fs.unlink(audioFilePath, (unlinkErr) => {
        if (unlinkErr) {
          // return res.status(500).send({ error: 'Error deleting audio file' });
        } 
        const updateQuery = `UPDATE students SET ${column} = NULL WHERE id = ?`;

        this.db.run(updateQuery, [id], (updateErr) => {
          if (updateErr) {
            return res.status(500).send({ error: 'Error updating database' });
          }
          res.send({ message: 'Audio file deleted successfully' });
        });
      });
    });
  }
  
  
}

module.exports = Students;
