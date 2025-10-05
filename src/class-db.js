const sqlite3 = require("sqlite3").verbose();

class myDB { 
    constructor({
        DB_NAME='database.db',
        DB_ROOT_FOLDER='database',
    }={}){
        this.DB_NAME = DB_NAME
        this.DB_ROOT_FOLDER = DB_ROOT_FOLDER;
        this.db = this._createDatabase(); 
        this._createTables(this.db);
        // this._addColumn('students', 'branch_id', 'INTEGER', '1')
        // this._addColumn('students', 'card_owner', 'VARCHAR', 'NULL')
        // this._addColumn('students', 'options', 'VARCHAR', 'NULL')
        // this._addColumn('students', 'note', 'VARCHAR', 'NULL') 
    }

    _createDatabase(){
        // Initialize SQLite Database
        const db = new sqlite3.Database(`${global.DIR}/${this.DB_ROOT_FOLDER}/${this.DB_NAME}`, (err) => {
            if (err) {
                console.error("Error connecting to database:", err.message);
                return;
            }
            console.log("Connected to SQLite database.");
        });
        return db
    }
    _createTables(){
        try {
            this.db.run(
                `CREATE TABLE IF NOT EXISTS users (
                  id INTEGER PRIMARY KEY AUTOINCREMENT,
                  name TEXT NOT NULL,
                  email TEXT NOT NULL UNIQUE,
                  is_login VARCHAR,
                  created TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                )`,
                (err) => {
                  if (err) {
                    console.error("Error creating table:", err.message);
                  }
                }
            );

            this.db.run(
              `CREATE TABLE IF NOT EXISTS students (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT NOT NULL,
                dakhela INTEGER NOT NULL,
                class TEXT NOT NULL,
                class_short TEXT NOT NULL,
                card_no VARCHAR(255) DEFAULT NULL,
                year TEXT DEFAULT NULL,                    
                status INTEGER DEFAULT 1,
                sound1 TEXT DEFAULT NULL,
                sound2 TEXT DEFAULT NULL,
                sound3 TEXT DEFAULT NULL,
                card_owner TEXT DEFAULT NULL,
                options TEXT DEFAULT NULL,
                branch_id INTEGER DEFAULT 1, -- some client can be manage multiple institue by signle computer setup
                note TEXT DEFAULT NULL,
                id_type INTEGER DEFAULT 1, -- when using attendence, 1 = students, 2 = guardians
                    created TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                );`,
                (err) => {
                  if (err) {
                    console.error("Error creating table:", err.message);
                  }
                }
            );

            this.db.run(
              //DROP TABLE IF EXISTS schedules;
              `CREATE TABLE IF NOT EXISTS schedules (
                  id INTEGER PRIMARY KEY AUTOINCREMENT,
                  type INTEGER DEFAULT 1, -- Represents the type of the schedule (punch=1 | call=2)
                  title TEXT DEFAULT NULL, 
                  start_time TEXT NOT NULL, -- 24 hour format time as string (e.g. 20:40)
                  end_time TEXT NOT NULL,  -- 24 hour format time as string (e.g. 20:40)
                  classes TEXT DEFAULT NULL,  -- JSON string          
                  created TIMESTAMP DEFAULT CURRENT_TIMESTAMP
              );`,
              (err) => {
                if (err) {
                  console.error("Error creating table:", err.message);
                }
              }
            );

            this.db.run(
              // DROP TABLE IF EXISTS attendance;
              `
              CREATE TABLE IF NOT EXISTS attendance (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                student_id INTEGER NOT NULL, -- dakhela
                date DATE NOT NULL,
                in_time TIME DEFAULT NULL,
                out_time TIME DEFAULT NULL,
                late_in_minute INTEGER DEFAULT 0,
                status TEXT NOT NULL, -- e.g., 'present', 'absent', 'late', 'leave'
                remarks TEXT DEFAULT NULL,
                branch_id INTEGER DEFAULT 1, -- some client can be manage multiple institue by signle computer setup
                created TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            
                -- Foreign key relation to students table
                FOREIGN KEY(student_id) REFERENCES students(id)
              );`,
              (err) => {
                if (err) {
                  console.error("Error creating table:", err.message);
                }
              }
            );

            this.db.run(
              // DROP TABLE IF EXISTS class_holidays;
              `CREATE TABLE IF NOT EXISTS class_holidays (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                class_short TEXT NOT NULL, -- refers to class or class_short from students
                holiday_date DATE NOT NULL,
                type TEXT NOT NULL, -- e.g., 'holiday', 'leave', 'event'
                reason TEXT DEFAULT NULL,
                branch_id INTEGER DEFAULT 1, -- some client can be manage multiple institue by signle computer setup
                created TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP
              );`,
              (err) => {
                if (err) {
                  console.error("Error creating table:", err.message);
                }
              }
            ); 
            
            
        } catch (error) {
            console.log('ddfdf', error);
        }
    }

    /**
     * examples:
     * ================
      ALTER TABLE users
      ADD age INT;


      ALTER TABLE users
      ADD age INT NOT NULL DEFAULT 0;

     */
    _addColumn(tableName, columnName, type='VARCHAR', defaultVal=undefined){ this.db.run(
            `   ALTER TABLE ${tableName}
                ADD COLUMN ${columnName} ${type} DEFAULT ${defaultVal ?? 'NULL'} CONSTRAINT ${columnName + '_addColumn_constraint'} 
                ;
            `,
            (err) => {
              if (err) {
                console.error("AddColumn Error creating table:", err.message);
              }
            }
        );
    }
    _removeColumn(tableName, columnName){ this.db.run(
            `ALTER TABLE ${tableName} DROP COLUMN ${columnName}`,
            (err) => {
              if (err) {
                console.error("DropColumn Error:", err.message);
              }
            }
        );
    }
}

module.exports = myDB