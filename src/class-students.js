// const sqlite3 = require("sqlite3").verbose();
const xlsx = require("xlsx");
const multer = require("multer");
const upload = multer({ dest: DIR + '/public' });
const { classes } = require('../config')

class Students {
    constructor(db){
        this.tableName = 'students'
        this.db = db
    }

    getStudents(req, res){
        this.db.all(`SELECT * FROM ${this.tableName}`, [], (err, rows) => {
          if (err) {
              res.status(500).send({ error: err.message });
              return;
          }
          res.send(rows);
      });
        
    }
    getStudent(req, res){
        
    }

    importExcel(filePath, callback) {
        try {
          const workbook = xlsx.readFile(filePath);
          const sheetName = workbook.SheetNames[0]; // Assuming data is in the first sheet
          const data = xlsx.utils.sheet_to_json(workbook.Sheets[sheetName]);
      
          const insertQuery = `
            INSERT INTO students (name, dakhela, class, class_short, session, sound1, sound2, sound3)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
          `;
      
          this.db.serialize(() => {
            data.forEach((row) => {
              db.run(
                insertQuery,
                [
                  row.name,
                  row.dakhela,
                  row.class,
                  row.class.replace(row.class, classes[row.class]), // name_short
                  row.year || null,
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
            });
          }); 
          callback(null, `Successfully imported ${data.length} rows.`);
        } catch (error) {
          callback(error, null);
        }
      }
}

module.exports = Students