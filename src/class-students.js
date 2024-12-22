// const sqlite3 = require("sqlite3").verbose();
const xlsx = require("xlsx");
const multer = require("multer");
const upload = multer({ dest: DIR + "/public" });
const { classes } = require("../config");
const fs = require("fs");

class Students {
  insertQuery = `
            INSERT INTO students (name, dakhela, class, class_short, year, sound1, sound2, sound3)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
          `;

  constructor(db) {
    this.tableName = "students";
    this.db = db;
  }

  getStudents(req, res) {
    this.db.all(`SELECT * FROM ${this.tableName}`, [], (err, rows) => {
      if (err) {
        res.status(500).send({ error: err.message });
        return;
      }
      res.send(rows);
    });
  }
  getStudent(req, res) {}

  importExcel(filePath, callback) {
    try {
      const workbook = xlsx.readFile(filePath);
      const sheetName = workbook.SheetNames[0]; // Assuming data is in the first sheet
      const data = xlsx.utils.sheet_to_json(workbook.Sheets[sheetName], {
        header: 1,
      });

      const { insertQuery } = this

      this.db.serialize(() => {
        data.forEach((row, i) => {
          if (i >= 1) {
            this.db.run(
              insertQuery,
              [
                row[2], // name
                row[1], //dakhela
                row[3], //class
                classes?.[row[3]] || "--", //class_short
                row[10], // year
                row.sound1 || null,
                row.sound2 || null,
                row.sound3 || null,
              ],
              (err) => {
                if (err) {
                  console.error("Error inserting data:", err.message);
                }
              }
            );
          } else {
            console.log({ row });
          }
        });
      });

      fs.unlink(filePath, () => {});
      callback(null, `Successfully imported ${data.length} rows.`);
    } catch (error) {
      callback(error, null);
    }
  }
}

module.exports = Students;
