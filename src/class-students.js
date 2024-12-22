// const sqlite3 = require("sqlite3").verbose();
const xlsx = require("xlsx");
const multer = require("multer");
const upload = multer({ dest: DIR + "/public" });
const { classes } = require("../config");
const fs = require("fs");
const path = require("path");

class Students {
  insertQuery = `
            INSERT INTO students (name, dakhela, class, class_short, year, status, sound1, sound2, sound3)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
          `;

  constructor(db) {
    this.tableName = "students";
    this.db = db;
  }

  getStudents(req, res) {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;

    // Optional filters
    const filters = [];
    const filterValues = [];

    if (req.query.name) {
      filters.push("name LIKE ?");
      filterValues.push(`%${req.query.name}%`);
    }

    if (req.query.class) {
      filters.push("class = ?");
      filterValues.push(req.query.class);
    }

    if (req.query.sound1) {
      if (req.query.sound1 === "has_sound") {
        filters.push("sound1 IS NOT NULL");
      } else if (req.query.sound1 === "no_sound") {
        filters.push("sound1 IS NULL");
      }
    }

    // Base query with dynamic filters
    const whereClause = filters.length ? `WHERE ${filters.join(" AND ")}` : "";
    const query = `SELECT * FROM ${this.tableName} ${whereClause} LIMIT ? OFFSET ?`;

    // Add pagination values to filter values
    filterValues.push(limit, offset);

    this.db.all(query, filterValues, (err, rows) => {
      if (err) {
        res.status(500).send({ error: err.message });
        return;
      }

      this.db.get( `SELECT COUNT(*) as total FROM ${this.tableName} ${whereClause}`,
        filters.map((f, i) => filterValues[i]), // Pass the same filter values for the count query
        (err, result) => {
          if (err) {
            res.status(500).send({ error: err.message });
            return;
          }

          const total = result.total;
          const totalPages = Math.ceil(total / limit);

          // Send response with data and pagination info
          res.send({
            data: rows,
            pagination: {
              page,
              total,
              limit,
              totalPages,
            },
          });
        }
      );
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

      const { insertQuery } = this;

      this.db.serialize(() => {
        data.forEach((row, i) => {
          if (i >= 1) {
            this.db.run(
              insertQuery,
              [
                row[1], // name
                row[2], //dakhela
                row[3], //class
                classes?.[row[3]] || "--", //class_short
                row[5], // year
                row[6], // status
                row[7], // sound1
                row[8], // sound2
                row[9], // sound3
              ],
              (err) => {
                if (err) {
                  console.error("Error inserting data:", err.message);
                }
              }
            );
          } else {
            // console.log({ row });
          }
        });
      });

      fs.unlink(filePath, () => {});
      callback(null, `Successfully imported ${data.length} rows.`);
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
        const filePath = path.join( DIR, "/public/exports", `students_export_${Date.now()}.xlsx` );    
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
}

module.exports = Students;
