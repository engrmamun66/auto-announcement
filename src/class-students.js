// const sqlite3 = require("sqlite3").verbose();
const xlsx = require("xlsx");
const multer = require("multer");
const upload = multer({ dest: DIR + "/public" });
const fs = require("fs");
const path = require("path");
const moment = require('moment')
const utils = require('./utls')
let checkAccess = require("./checkaccess"); 
let Backup = require("./backup"); 
 
function normalizeProfileImage(req, profile_image) {
  if (!profile_image) return null
  if (/^https?:\/\//i.test(profile_image) || /^data:/i.test(profile_image)) {
    return profile_image
  }
  const path = String(profile_image).startsWith('/') ? profile_image : `/${profile_image}`
  return utils.audioFullUrl(req, path)
}

function deleteProfileImageFile(profile_image) {
  try {
    if (!profile_image) return
    if (/^https?:\/\//i.test(profile_image) || /^data:/i.test(profile_image)) return
    if (profile_image === '/default-profile-image.png' || profile_image === 'default-profile-image.png') return
    const relativePath = String(profile_image).startsWith('/') ? profile_image.slice(1) : profile_image
    const mediaDir = path.join(global.DIR, 'public', 'media')
    const fullPath = path.resolve(global.DIR, relativePath)
    if (!fullPath.startsWith(mediaDir)) return
    if (fs.existsSync(fullPath)) {
      fs.unlinkSync(fullPath)
    }
  } catch (error) {
    console.warn('deleteProfileImageFile_error', error?.message || error)
  }
}

function getActiveClassConfig() {
  const configuredClasses = Array.isArray(global.config?.classes) ? global.config.classes : [];
  const activeClasses = configuredClasses.filter(cls => cls?.isActive !== false);

  return {
    classShorts: [...new Set(activeClasses.map(cls => String(cls?.class_short || '').trim()).filter(Boolean))],
    classNames: [...new Set(activeClasses.map(cls => String(cls?.class_name || '').trim()).filter(Boolean))],
  };
}

function appendActiveClassFilter(query = '', queryParams = [], { classShortColumn = 'class_short', classNameColumn = 'class' } = {}) {
  const { classShorts, classNames } = getActiveClassConfig();
  const nextParams = [...queryParams];
  const clauses = [];

  if (classShorts.length) {
    clauses.push(`${classShortColumn} IN (${classShorts.map(() => '?').join(',')})`);
    nextParams.push(...classShorts);
  }

  if (classNames.length) {
    clauses.push(`${classNameColumn} IN (${classNames.map(() => '?').join(',')})`);
    nextParams.push(...classNames);
  }

  if (!clauses.length) {
    return {
      query: `${query} AND 1 = 0`,
      queryParams: nextParams,
    };
  }

  return {
    query: `${query} AND (${clauses.join(' OR ')})`,
    queryParams: nextParams,
  };
}

class Students { 

  constructor(db) {
    this.tableName = "students";
    this.db = db;
  }

  async getStudents(req, res) {
    const page_no = parseInt(req.query.page_no) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page_no - 1) * limit;
  
    const { id, name, class_name, sound1, dakhela, card_no, only_similler_students } = req.query;
  
    let query = `SELECT * FROM ${this.tableName} WHERE 1=1`;
    let queryParams = [];
  
    // Add filters if provided
    if (id) {
      query += ` AND id = ?`;
      queryParams.push(`${id}`);
    }
    
    if (name) {
      query += ` AND name LIKE ?`;
      queryParams.push(`%${name}%`);
    }
    
    if (card_no) {
      query += ` AND card_no LIKE ?`;
      queryParams.push(`%${card_no}%`);
    }
  
    if (class_name) {
      query += ` AND class = ?`;
      queryParams.push(class_name);
    }
  
    if (dakhela) {
      if(only_similler_students){
        query += ` AND (dakhela = ?`;       
        queryParams.push(dakhela); 


        query += ` OR name LIKE ?)`;       
        queryParams.push(`%||dakhela::${dakhela}`);  

        // res.status(500).send({ query, queryParams  });

      } else {
        query += ` AND dakhela = ?`;       
        queryParams.push(dakhela); 
      }
      

    } 
  
    if (sound1) {
      if (sound1 === 'has_sound') {
        query += ` AND sound1 IS NOT NULL`;
      } else if (sound1 === 'no_sound') {
        query += ` AND sound1 IS NULL`;
      } else {
        // finding similer type 
        query += ` AND sound1 = ?`;       
        queryParams.push(sound1);  
      }
    }
  
    ({ query, queryParams } = appendActiveClassFilter(query, queryParams));

    // Default sort
    query += ` ORDER BY class_short ASC, name ASC`;

    // Add pagination
    query += ` LIMIT ? OFFSET ?`;
    queryParams.push(limit, offset);
  
    this.db.all(query, queryParams, (err, rows) => {
      if (err) {
        res.status(500).send({ error__1: err.message, query, queryParams });
        return;
      }
  
      // Count total records for pagination metadata (same filters, no LIMIT/OFFSET)
      const countQuery = query
        .replace(/SELECT \* FROM/, 'SELECT COUNT(*) as total FROM')
        .replace(/ ORDER BY .+$/, '')
        .replace(/ LIMIT \? OFFSET \?$/, '');

      const countQueryParams = queryParams.slice(0, queryParams.length - 2); // strip limit & offset

      this.db.get(countQuery, countQueryParams, (err, result) => {
        if (err) {
          res.status(500).send({ error__2: err.message, query, queryParams });
          return;
        }
  
        const total = result.total;
        const totalPages = Math.ceil(total / limit);
  
        // Send response with data and pagination info
        res.send({
          data: rows.map(row => {
            row.sound1 = row.sound1 ? utils.audioFullUrl(req, row.sound1) : null
            row.profile_image = normalizeProfileImage(req, row.profile_image)
            return row
          }),
          pagination: {
            page_no,
            total,
            limit,
            totalPages,
          },
        });
      });
    });
  }
  

  getStudent(req, res) { 
    let { barcode, date, with_attendance } = req.query
    let [ class_short, dakhela, soundColName, year ] = barcode.split('-') // nursary-23-sound1-2024

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

      const row = rows[rows.length - 1];   
      row.sound1 = row.sound1 ? utils.audioFullUrl(req, row.sound1) : null
      row.profile_image = normalizeProfileImage(req, row.profile_image)

      row['soundColName'] = soundColName

      let result = { data: row }
      if(!with_attendance){
        return res.send(result);
      } else {
        const attendance_table_name = 'attendance'
        const selectQuery = `
          SELECT * FROM ${attendance_table_name}
          WHERE student_id = ? AND date = ? 
        `;
        this.db.all(selectQuery, [dakhela, date], (err, entries) => {
          if (err) return res.status(500).send({ error: err.message });

          return res.send({
            ...result,
            entries: entries || [],
          })

        })
      }
  
    });
  }
    
  /** 
   * @depricated 
   */
  getStudentByCardNumber(req, res) { 
    let { card_no, input } = req.body; // Extract card number from query parameters
    
    if(input) card_no = String(input).replaceAll('/', '') 
  
    if (!card_no) {
      res.status(400).send({ error: "Card number is required." });
      return;
    }
  
    const query = `SELECT * FROM ${this.tableName} WHERE card_no = ?`;
  
    this.db.all(query, [card_no], (err, rows) => {
      if (err) {
        res.status(500).send({ error: err.message });
        return;
      }
  
      if (!rows || rows.length === 0) {
        res.status(404).send({ message: "No data found for the provided card number." });
        return;
      }
  
      const student = rows[rows.length - 1]; 

      let barcode = `${student.class_short}-${student.dakhela}-sound1-${student.year}`
           

      global.socketServer.clients.forEach((client) => {
        if (client.readyState === client.OPEN) {
          client.send(JSON.stringify({barcode})); 
        }
      });
 
      res.send({
        message: 'Punch accepted!',
      });
    });
  }


  getStudentByDakhela(req, res) { 
    let { dakhela } = req.params;  
  
    if (!dakhela) {
      res.status(400).send({ error: req.params });
      return;
    }
  
    const query = `SELECT * FROM ${this.tableName} WHERE dakhela = ?`;
  
    this.db.get(query, [dakhela], (err, student) => {
      if (err) {
        res.status(500).send({ error: err.message });
        return;
      }  
      if (student) {
        student.sound1 = student.sound1 ? utils.audioFullUrl(req, student.sound1) : null
        student.profile_image = normalizeProfileImage(req, student.profile_image)
      }
      res.send(student);
    });
  }

  allStudents(req, res) {   

    let query = `SELECT * FROM ${this.tableName} WHERE 1`;
    let queryParams = [];

    ({ query, queryParams } = appendActiveClassFilter(query, queryParams));
    query += ` ORDER BY class_short ASC, name ASC`;

    this.db.all(query, queryParams, (err, students) => {
      if (err) {
        res.status(500).send({ error: err.message });
        return;
      }
      
      const data = (students || []).map((student) => {
        student.sound1 = student.sound1 ? utils.audioFullUrl(req, student.sound1) : null
        student.profile_image = normalizeProfileImage(req, student.profile_image)
        return student
      })
      res.send(data);
    });
  }
  
  getStudentByDakhela_and_sentToSocket(dakhela, { start_time, punch_time, studentOfDevice, device_index=0 }={}) {    
    if(!dakhela) return
  
    const query = `SELECT * FROM ${this.tableName} WHERE dakhela = ? limit 1`; 

  
    this.db.all(query, [dakhela], (err, rows) => {
      if (err) {
   
        global.socketServer.clients.forEach((client) => {
          if (client.readyState === client.OPEN) {
            client.send(JSON.stringify({
              type: 'message',
              message: err.message
            }));
          }          
        });

        return;
      }
   
  
      const student = rows[rows.length - 1]; 
      if (!student){
        global.socketServer.clients.forEach((client) => {
          if (client.readyState === client.OPEN) {
            client.send(JSON.stringify({
              type: 'notice',
              message: `Nobody punched at ${start_time}`
            }));
          }
        });
        return
      }
         

      let barcode = `${student.class_short}-${student.dakhela}-sound1-${student.year}`;

      let using_attendance = global.config?.settings?.attendance?.status
      let is_not_copied = student.name.indexOf('Copied') === -1
      let for_attendence = using_attendance && is_not_copied
   

      global.socketServer.clients.forEach((client) => {
        if (client.readyState === client.OPEN) {
          client.send(JSON.stringify({
            type: 'attendence',
            start_time,
            punch_time,
            barcode,
            dakhela,
            studentOfDevice,
            for_attendence,
            device_index,
          }));
        }
      });
 
      
    });
  }
  
    
  

  importExcel(filePath, forceAsNewEntity, callback) {
    try {
      const workbook = xlsx.readFile(filePath);
      const sheetName = workbook.SheetNames[0]; // Assuming data is in the first sheet
      const scheduleSheetName = workbook.SheetNames.find((name) => String(name).toLowerCase() === 'schedules') || workbook.SheetNames[1];
      const data = xlsx.utils.sheet_to_json(workbook.Sheets[sheetName], {
        header: 1,
      });
      const scheduleData = scheduleSheetName ? xlsx.utils.sheet_to_json(workbook.Sheets[scheduleSheetName], { header: 1 }) : [];
      const insertQuery = `
        INSERT INTO students (name, dakhela, class, class_short, card_no, year, status, sound1, device_index, card_owner, options, note, profile_image)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `;
  
      const updateQuery = `
        UPDATE students
        SET name = ?, dakhela = ?, class = ?, class_short = ?, card_no = ?, year = ?, status = ?, sound1 = ?, device_index = ?, card_owner = ?, options = ?, note = ?, profile_image = ?
        WHERE id = ?
      `;
  
      const findQuery = `
        SELECT id FROM students WHERE dakhela = ? AND class = ? AND year = ?
      `;

      const insertScheduleQuery = `
        INSERT INTO schedules (type, title, start_time, end_time, order_index, status, classes)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `;

      const updateScheduleQuery = `
        UPDATE schedules
        SET type = ?, title = ?, start_time = ?, end_time = ?, order_index = ?, status = ?, classes = ?
        WHERE id = ?
      `;

      let errorOccurred = false;
      let created = 0;
      let updated = 0;
      let not_found = 0;
      let pending = 0;
      let studentLoopDone = false;

      const finalizeImport = () => {
        if (!studentLoopDone || pending > 0) return;
        fs.unlink(filePath, () => {});
        if (!errorOccurred) {
          callback(null, { total: created + updated, created, updated, not_found });
          checkAccess.CheckAppAccess({ save_info: true });
          Backup.createBackupAndSend();
        } else {
          callback("Failed to upload some rows. Check logs for details.");
        }
        utils.restartServer();
      };

      const headerRow = data[0] || []
      const headerMap = {}
      if (headerRow && headerRow.length && headerRow.some((h) => String(h).toLowerCase() === 'id' || String(h).toLowerCase() === 'name')) {
        headerRow.forEach((h, idx) => {
          headerMap[String(h).trim().toLowerCase()] = idx
        })
      }
      const hasHeader = Object.keys(headerMap).length > 0
      const getValue = (row, key, fallbackIndex) => {
        if (headerMap[key] !== undefined) return row[headerMap[key]]
        if (fallbackIndex !== undefined) return row[fallbackIndex]
        return undefined
      }
  
      this.db.serialize(() => {
        data.forEach((row, i) => {
          if (i === 0 && hasHeader) {
            // Skip the header row
            console.log("Skipping header row:", row, row.length, data[1]?.length, data[1]);
            return;
          }
  
          const name = getValue(row, 'name', 1)
          if (row.length === 0 || !name) {
            // Skip empty rows or rows without a name
            console.log("Skipping empty row or invalid data:", row);
            return;
          }
  
          const id = getValue(row, 'id', 0)
          const dakhela = getValue(row, 'dakhela', 2)
          const className = getValue(row, 'class', 3) || getValue(row, 'class_name', 3)
          const card_no = getValue(row, 'card_no', 5)
          const year = getValue(row, 'year', 6)
          const status = getValue(row, 'status', 7)
          const sound1 = getValue(row, 'sound1', 8)
          const card_owner = getValue(row, 'card_owner', 9)
          const options = getValue(row, 'options', 10)
          const device_index = getValue(row, 'device_index', 11)
          const note = getValue(row, 'note', 12)
          const profile_image = headerMap.profile_image !== undefined ? getValue(row, 'profile_image') : (row.length >= 15 ? row[14] : null)

          if (forceAsNewEntity) {
            // Force insert as a new row regardless of id or existing match
            pending++;
            this.db.run(
              insertQuery,
              [name, dakhela, className, utils.getClassShort(className), card_no, year, status || 1, sound1 || null, device_index || null, card_owner || null, options || null, note || null, profile_image || null],
              (err) => {
                if (err) {
                  console.error("Error inserting data (force):", err);
                  errorOccurred = true;
                } else {
                  created++;
                }
                pending--;
                finalizeImport();
              }
            );
          } else if (id) {
            // If `id` is provided, update the row
            pending++;
            this.db.run(
              updateQuery,
              [name, dakhela, className, utils.getClassShort(className), card_no, year, status || 1, sound1 || '', device_index || null, card_owner || null, options || null, note || null, profile_image || null, id],
              function(err) {
                if (err) {
                  console.error(`Error updating data with ID ${id}:`, err);
                  errorOccurred = true;
                } else if (this.changes > 0) {
                  updated++;
                } else {
                  not_found++;
                }
                pending--;
                finalizeImport();
              }
            );
          } else {
            // Check if the row already exists based on `dakhela`, `class`, and `year`
            pending++;
            this.db.get(findQuery, [dakhela, className, year], (err, existingRow) => {
              if (err) {
                console.error("Error querying existing data:", err);
                errorOccurred = true;
                pending--;
                finalizeImport();
                return;
              }

              if (existingRow) {
                // Update the existing row
                this.db.run(
                  updateQuery,
                  [name, dakhela, className, utils.getClassShort(className), card_no, year, status || 1, sound1 || null, device_index || null, card_owner || null, options || null, note || null, profile_image || null, existingRow.id],
                  (err) => {
                    if (err) {
                      console.error(`Error updating data for dakhela: ${dakhela}, class: ${className}, year: ${year}:`, err);
                      errorOccurred = true;
                    } else {
                      updated++;
                    }
                    pending--;
                    finalizeImport();
                  }
                );
              } else {
                // Insert a new row
                this.db.run(
                  insertQuery,
                  [name, dakhela, className, utils.getClassShort(className), card_no, year, status || 1, sound1 || null, device_index || null, card_owner || null, options || null, note || null, profile_image || null],
                  (err) => {
                    if (err) {
                      console.error("Error inserting data:", err);
                      errorOccurred = true;
                    } else {
                      created++;
                    }
                    pending--;
                    finalizeImport();
                  }
                );
              }
            });
          }
        });
        studentLoopDone = true;
        finalizeImport();
      });

      if (scheduleData && scheduleData.length) {
        const scheduleHeaderRow = scheduleData[0] || []
        const scheduleHeaderMap = {}
        if (scheduleHeaderRow && scheduleHeaderRow.length && scheduleHeaderRow.some((h) => ['id', 'type', 'start_time'].includes(String(h).toLowerCase()))) {
          scheduleHeaderRow.forEach((h, idx) => {
            scheduleHeaderMap[String(h).trim().toLowerCase()] = idx
          })
        }
        const scheduleHasHeader = Object.keys(scheduleHeaderMap).length > 0
        const getScheduleValue = (row, key, fallbackIndex) => {
          if (scheduleHeaderMap[key] !== undefined) return row[scheduleHeaderMap[key]]
          if (fallbackIndex !== undefined) return row[fallbackIndex]
          return undefined
        }

        this.db.serialize(() => {
          scheduleData.forEach((row, i) => {
            if (i === 0 && scheduleHasHeader) {
              console.log("Skipping schedule header row:", row, row.length, scheduleData[1]?.length, scheduleData[1]);
              return;
            }

            if (row.length === 0) return;

            const id = getScheduleValue(row, 'id', 0)
            const type = getScheduleValue(row, 'type', 1)
            const title = getScheduleValue(row, 'title', 2)
            const start_time = getScheduleValue(row, 'start_time', 3)
            const end_time = getScheduleValue(row, 'end_time', 4)
            const order_index = getScheduleValue(row, 'order_index', 5)
            const status = getScheduleValue(row, 'status', 6)
            const classes = getScheduleValue(row, 'classes', 7)

            if (!type || !start_time || !end_time || !classes) {
              console.log("Skipping invalid schedule row:", row);
              return;
            }

            const resolvedTitle = title || `${start_time} - ${end_time}`
            const resolvedOrder = Number.isFinite(Number(order_index)) ? Number(order_index) : 1
            const statusNum = Number(status)
            const resolvedStatus = (statusNum === 0 || statusNum === 1) ? statusNum : 1

            if (id) {
              this.db.run(
                updateScheduleQuery,
                [Number(type) || type, resolvedTitle, start_time, end_time, resolvedOrder, resolvedStatus, classes, id],
                (err) => {
                  if (err) {
                    console.error(`Error updating schedule with ID ${id}:`, err);
                    errorOccurred = true;
                  }
                }
              );
            } else {
              this.db.run(
                insertScheduleQuery,
                [Number(type) || type, resolvedTitle, start_time, end_time, resolvedOrder, resolvedStatus, classes],
                (err) => {
                  if (err) {
                    console.error("Error inserting schedule data:", err);
                    errorOccurred = true;
                  }
                }
              );
            }
          })
        })
      }
  

    } catch (error) {
      callback(error, null);
    }
  }

  

  exportAll(req, res) {
    const query = `SELECT * FROM ${this.tableName} ORDER BY id ASC`;

    this.db.all(query, [], (err, rows) => {
      if (err) {
        res.status(500).send({ error: err.message });
        return;
      }

      if (rows.length === 0) {
        res.status(404).send({ message: "No data found in the students table." });
        return;
      }

      const schedulesQuery = `SELECT * FROM schedules ORDER BY id ASC`;

      this.db.all(schedulesQuery, [], (scheduleErr, schedules) => {
        if (scheduleErr) {
          res.status(500).send({ error: scheduleErr.message });
          return;
        }

        try {
          // Create worksheets
          const worksheet = xlsx.utils.json_to_sheet(rows);
          const schedulesSheet = xlsx.utils.json_to_sheet(schedules || []);

          // Create a new workbook and append worksheets
          const workbook = xlsx.utils.book_new();
          xlsx.utils.book_append_sheet(workbook, worksheet, "Students");
          xlsx.utils.book_append_sheet(workbook, schedulesSheet, "Schedules");
          const fileName = `students_export_${moment().format('YYYY_MMM_DD')}_${Date.now()}.xlsx`
          const filePath = path.join( DIR, "/public/exports", fileName );    
          xlsx.writeFile(workbook, filePath);

          res.download(filePath, "students_export.xlsx", (err) => {
            if (err) {
              console.error("Error downloading file:", err.message);
              res.status(500).send({ error: "Error downloading file." });
            }

            // Delete the file after download
            fs.unlink(filePath, (unlinkErr) => {
              if (unlinkErr) {
                console.error("Error deleting file:", unlinkErr.message);
              }
            }); 
          });
        } catch (exportError) {
          console.error("Error exporting data:", exportError.message);
          res.status(500).send({ error: exportError.message });
        }
      })
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

  async uploadAudioFromUrl(req, res) {
    const { id, column, url } = req.body;
    if (!url) return res.status(400).send({ error: 'No URL provided' });
    if (!id || !column) return res.status(400).send({ error: 'Missing id or column' });

    try {
      const response = await fetch(url);
      if (!response.ok) throw new Error(`Failed to fetch audio: ${response.status}`);

      const contentType = response.headers.get('content-type') || '';
      let ext = 'mp3';
      if (contentType.includes('wav')) ext = 'wav';
      else if (contentType.includes('ogg')) ext = 'ogg';
      else if (contentType.includes('webm')) ext = 'webm';

      const codeNumber = global.config?.env?.CODE_NUMBER || 'code_number';
      const filename = `${codeNumber}-${Date.now()}-recorded.${ext}`;
      const mediaDir = path.join(DIR, 'public', 'media');
      if (!fs.existsSync(mediaDir)) fs.mkdirSync(mediaDir, { recursive: true });
      const filePath = path.join(mediaDir, filename);

      const buffer = await response.arrayBuffer();
      fs.writeFileSync(filePath, Buffer.from(buffer));

      const audioPath = `/media/${filename}`;
      const query = `UPDATE students SET ${column} = ? WHERE id = ?`;
      this.db.run(query, [audioPath, id], (err) => {
        if (err) return res.status(500).send({ error: 'Error updating database' });
        res.send({
          message: 'Audio uploaded successfully',
          audio_path: audioPath,
          audio_url: utils.audioFullUrl(req, audioPath),
        });
      });
    } catch (err) {
      res.status(500).send({ error: err.message });
    }
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

  addStudent(req, res) {
    const { class: className, name, dakhela, year, card_no, card_owner, note, profile_image: profile_image_input } = req.body;
    const profile_image = req.file ? `/media/${req.file.filename}` : profile_image_input;
  
    const class_short = utils.getClassShort(className);
  
    if (!className || !name || !class_short || !dakhela) {
      res.status(400).send({ error: "All fields (class, name, class_short, dakhela, year) are required." });
      return;
    }
  
    const tableName = this.tableName;
  
    const query = `
      INSERT INTO ${tableName} (class, name, class_short, dakhela, year, card_no, card_owner, note, profile_image)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
  
    const params = [className, name, class_short, dakhela, year || null, card_no, card_owner, note, profile_image || null];
  
    const db = this.db; // Capture `this.db` reference
  
    db.run(query, params, function (err) {
      if (err) {
        res.status(500).send({ error: err.message });
        return;
      }
  
      const selectQuery = `SELECT * FROM ${tableName} WHERE id = ?`;
      const studentId = this.lastID; // `this` here refers to the `RunResult` object.
  
      db.get(selectQuery, [studentId], (err, row) => {
        if (err) {
          res.status(500).send({ error: "Error fetching the newly added student." });
          return;
        }
  
        if (!row) {
          res.status(404).send({ error: "Student not found after insertion." });
          return;
        }

        checkAccess.CheckAppAccess({save_info: true})
  
        res.send({
          message: "Student added successfully.",
          data: row, // Full row of the newly added student
        });
      });
    });
  }


  cloneStudent(req, res) {
    // return res.status(500).send(req.body);
    
    const { id } = req.params;
    const { dakhela, dakhela_new } = req.body;


    let query = `SELECT * FROM ${this.tableName} WHERE id=?`;
    this.db.get(query, [id], async (err, studentRow) => {
      if (err) {
        res.status(500).send({ message: err.message });
        return;
      } 

       this.db.get(`SELECT * FROM ${this.tableName} WHERE dakhela=?`, [dakhela_new], async(error, existing_student_by_dakhela) => {
          if(existing_student_by_dakhela){
            return res.status(500).send({ message: `এই দাখেলাটি ইতিমধ্যে ব্যবহার করা হয়েছে (${dakhela_new})`, existing_student_by_dakhela });
          } else {
            let {name, class: className, card_no, year, status, sound1, profile_image} = studentRow
             
              const class_short = utils.getClassShort(className);
            
              if (!className || !name || !class_short || !dakhela) {
                res.status(500).send({ message: "All fields (class, name, class_short, dakhela, year) are required." });
                return;
              }
            
              const tableName = this.tableName;
            
              const query = `
                INSERT INTO ${tableName} (class, name, class_short, dakhela, year, card_no, sound1, profile_image)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?)
              `;
            
              name = `${name} (Copied)||dakhela::${dakhela}`
              let params = [className, name, class_short, dakhela_new, year || null, card_no, sound1, profile_image || null];
            
              const db = this.db; // Capture `this.db` reference

            
              db.run(query, params, function (err) {
                if (err) {
                  res.status(500).send({ error: err.message });
                  return;
                }
            
                const selectQuery = `SELECT * FROM ${tableName} WHERE id = ?`;
                const studentId = this.lastID; // `this` here refers to the `RunResult` object.
            
                db.get(selectQuery, [studentId], (err, clonedStudent) => {
                  if (err) {
                    res.status(500).send({ message: "Error fetching the newly added student." });
                    return;
                  } 

                  checkAccess.CheckAppAccess({save_info: true})
            
                  res.send({
                    message: "কপি করা সম্পন্ন হয়েছে",
                    data: clonedStudent, // Full row of the newly added student
                  });
                });
              });
 
          }


            

       }) 


       
      
  
      // res.send({
      //   studentRow,
      //   dakhela_no,
      // });
    });



  }

  updateStudent(req, res) {

    const { id, class: className, name, dakhela, year, card_no, card_owner, note, profile_image: profile_image_input } = req.body;
    const profile_image = req.file ? `/media/${req.file.filename}` : profile_image_input;
  
    if (!id) {
      res.status(400).send({ error: "Student ID is required for updating." });
      return;
    }
  
    const class_short = utils.getClassShort(className);
  
    if (!className || !name || !class_short || !dakhela) {
      res.status(400).send({ error: "All fields (id, class, name, class_short, dakhela, year, card_no) are required." });
      return;
    }
  
    const tableName = this.tableName;
  
    const query = `
      UPDATE ${tableName}
      SET class = ?, name = ?, class_short = ?, dakhela = ?, year = ?, card_no = ?, card_owner = ?, note = ?, profile_image = ?
      WHERE id = ?
    `;

    const params = [className, name, class_short, dakhela, year || null, card_no, card_owner, note, profile_image || null, id];
    const db = this.db; // Capture `this.db` reference
  
    db.run(query, params, function (err) {
      if (err) {
        res.status(500).send({ error: err.message });
        return;
      }
  
      if (this.changes === 0) {
        res.status(404).send({ error: "No student found with the provided ID." });
        return;
      }
  
      const selectQuery = `SELECT * FROM ${tableName} WHERE id = ?`;
  
      db.get(selectQuery, [id], (err, row) => {
        if (err) {
          res.status(500).send({ error: "Error fetching the updated student." });
          return;
        }
  
        if (!row) {
          res.status(404).send({ error: "Student not found after update." });
          return;
        }

  
        res.send({
          message: "Student updated successfully.",
          data: row, // Full row of the updated student
        });
      });
    });
  }
  


  deleteStudent(req, res) {
    const { id } = req.params;
  
    if (!id) {
      res.status(400).send({ error: "Student ID is required." });
      return;
    }
 
    const selectQuery = `SELECT profile_image FROM ${this.tableName} WHERE id = ?`;
    const deleteQuery = `DELETE FROM ${this.tableName} WHERE id = ?`;

    this.db.get(selectQuery, [id], (selectErr, row) => {
      if (selectErr) {
        res.status(500).send({ error: "Error fetching student." });
        return;
      }

      this.db.run(deleteQuery, [id], function (err) {
        if (err) {
          res.status(500).send({ error: "Error deleting the student." });
          return;
        }
    
        if (this.changes === 0) {
          res.status(404).send({ error: "No student found with the provided ID." });
          return;
        }

        deleteProfileImageFile(row?.profile_image)
        checkAccess.CheckAppAccess({save_info: true})
    
        res.send({
          message: "Student deleted successfully.",
          studentId: id,
        });
      });
    })
  }
  
  
  
  
  
  
}

module.exports = Students;
