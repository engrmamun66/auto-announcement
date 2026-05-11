const fs = require('fs');
const path = require('path');
const sqlite3 = require("sqlite3").verbose();

let config = require('./../config.example');
const configPath = path.join(__dirname, './../config.js');
if (fs.existsSync(configPath)) {
  config = require(configPath);
}
global.config = config

class myDB { 
    constructor({
    }={}){
        let { env } = global.config
        this.DATABASE_PATH = path.join(global.DIR, env.DATABASE_PATH);
        fs.mkdirSync(path.dirname(this.DATABASE_PATH), { recursive: true });
        this.db = this._createDatabase();
        this._createTables(this.db);
        // ========== Delete column ==============
        this._removeColumn('students', 'sound2')
        this._removeColumn('students', 'sound3')
        this._removeColumn('students', 'branch_id')
        this._removeColumn('students', 'id_type')
        // ========== New Column =================
        this._addColumn('students', 'device_index', 'INTEGER', '1')
        this._addColumn('students', 'card_owner', 'VARCHAR', 'NULL')
        this._addColumn('students', 'options', 'VARCHAR', 'NULL')
        this._addColumn('students', 'note', 'VARCHAR', 'NULL') 
        this._addColumn('students', 'profile_image', 'VARCHAR', 'NULL')
        this._addColumn('students', 'phone_number', 'VARCHAR', 'NULL')
        this._addColumn('schedules', 'status', 'INTEGER', '1')
        this._addColumn('schedules', 'order_index', 'INTEGER', '1')
        this._initSettings()
    }

    _initSettings(){
        let cfg = require('./../config.example');
        const configPath = path.join(global.DIR, 'config.js');
        if (fs.existsSync(configPath)) {
          cfg = Object.assign({}, cfg, require(configPath));
        }
        const keys = Object.keys(cfg).filter(k => k !== 'env').map(k => [k, cfg[k]]);
        this.db.serialize(() => {
            // Seed default values from config.example.js — skips if key already exists in DB
            keys.forEach(([key, value]) => {
                this.db.run(
                    `INSERT OR IGNORE INTO settings (key, value) VALUES (?, ?)`,
                    [key, JSON.stringify(value)],
                    (err) => { if (err) console.error('_initSettings error:', err.message); }
                );
            });
            // Remove any settings key that no longer exists in config.example.js
            const knownKeys = keys.map(([k]) => k);
            const placeholders = knownKeys.map(() => '?').join(', ');
            this.db.run(
                `DELETE FROM settings WHERE key NOT IN (${placeholders})`,
                knownKeys,
                (err) => { if (err) console.error('_initSettings cleanup error:', err.message); }
            );
        });
    }

    _createDatabase(){
        // Initialize SQLite Database
        const db = new sqlite3.Database(`${this.DATABASE_PATH}`, (err) => {
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
              `
              CREATE TABLE IF NOT EXISTS students (
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
                device_index INTEGER DEFAULT 1, -- zkteco punching device index
                note TEXT DEFAULT NULL,
                profile_image TEXT DEFAULT NULL,
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
              `
              CREATE TABLE IF NOT EXISTS schedules (
                  id INTEGER PRIMARY KEY AUTOINCREMENT,
                  type INTEGER DEFAULT 1, -- Represents the type of the schedule (punch=1 | call=2)
                  title TEXT DEFAULT NULL, 
                  start_time TEXT NOT NULL, -- 24 hour format time as string (e.g. 20:40)
                  end_time TEXT NOT NULL,  -- 24 hour format time as string (e.g. 20:40)
                  order_index INTEGER DEFAULT 1,
                  status INTEGER DEFAULT 1, -- 1=active | 0=inactive
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
                in_time TIME DEFAULT NULL, -- 23:05:08 | null
                out_time TIME DEFAULT NULL, -- 23:05:08 | null
                late_in_minute INTEGER DEFAULT 0,
                status TEXT NOT NULL, -- e.g: 'Present' | 'Late' | 'Just Out'  
                remarks TEXT DEFAULT NULL,
                shift_duration TEXT DEFAULT NULL,
                shift_count INTEGER DEFAULT 1,
                shift_number INTEGER DEFAULT 1, -- 1 | 2 | 3
                device_index INTEGER DEFAULT 1, -- zkteco punching device index
                created TIMESTAMP DEFAULT CURRENT_TIMESTAMP, 
            
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
              // DROP TABLE IF EXISTS leave_and_vacation;
              `
              CREATE TABLE IF NOT EXISTS leave_and_vacation (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                identity_string TEXT DEFAULT NULL, -- unique identity string for each record, it will help to update bulk records
                type TEXT NOT NULL,                -- e.g., 'leave', 'vacation'
                class_short TEXT DEFAULT NULL,    -- class_short or '_all_'
                student_id INTEGER DEFAULT NULL,   -- refers to student_id/dakhela
                date DATE NOT NULL,
                reason TEXT DEFAULT NULL,
                created TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY(student_id) REFERENCES students(id)
              );
              `,
              (err) => {
                if (err) {
                  console.error("Error creating table:", err.message);
                }
              }
            );

            this.db.run(
              // DROP TABLE IF EXISTS settings;
              `
              CREATE TABLE IF NOT EXISTS settings (
                key TEXT PRIMARY KEY,
                value TEXT NOT NULL,
                updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP
              )`,
              (err) => {
                if (err) {
                  console.error("Error creating settings table:", err.message);
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
                // console.error("AddColumn Error creating table:", err.message + '\n===========================\n');
              }
            }
        );
    }
    _removeColumn(tableName, columnName){ this.db.run(
            `ALTER TABLE ${tableName} DROP COLUMN ${columnName}`,
            (err) => {
              if (err) {
                // console.error("DropColumn Error:", err.message + '\n===========================\n');
              }
            }
        );
    }
}

module.exports = myDB
