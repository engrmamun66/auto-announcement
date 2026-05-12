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
        // Deep merge: base keys + user overrides, but user partial objects don't wipe base child keys
        function deepMerge(base, override) {
            if (
                base !== null && typeof base === 'object' && !Array.isArray(base) &&
                override !== null && typeof override === 'object' && !Array.isArray(override)
            ) {
                const result = Object.assign({}, base);
                Object.keys(override).forEach(k => {
                    result[k] = deepMerge(base[k], override[k]);
                });
                return result;
            }
            return override !== undefined ? override : base;
        }

        let exampleCfg = require('./../config.example');
        const configPath = path.join(global.DIR, 'config.js');
        let userCfg = {};
        if (fs.existsSync(configPath)) {
          userCfg = require(configPath);
        }
        const cfg = deepMerge(exampleCfg, userCfg);
        const keys = Object.keys(cfg).filter(k => k !== 'env').map(k => [k, cfg[k]]);
        const knownKeys = keys.map(([k]) => k);

        // Read all current settings first, then diff and apply
        this.db.all(`SELECT key, value FROM settings`, [], (err, rows) => {
            if (err) { console.error('_initSettings read error:', err.message); return; }

            const existing = {};
            (rows || []).forEach(row => {
                try { existing[row.key] = JSON.parse(row.value); } catch { existing[row.key] = row.value; }
            });

            this.db.serialize(() => {
                keys.forEach(([key, cfgValue]) => {
                    if (!(key in existing)) {
                        console.log(`[settings] new key inserted: "${key}"`);
                        this.db.run(
                            `INSERT OR IGNORE INTO settings (key, value) VALUES (?, ?)`,
                            [key, JSON.stringify(cfgValue)],
                            (e) => { if (e) console.error('_initSettings insert error:', e.message); }
                        );
                    } else if (
                        cfgValue !== null && typeof cfgValue === 'object' && !Array.isArray(cfgValue) &&
                        existing[key] !== null && typeof existing[key] === 'object' && !Array.isArray(existing[key])
                    ) {
                        // Object value — deep-fill any child keys missing from DB
                        const merged = deepMerge(cfgValue, existing[key]);
                        if (JSON.stringify(merged) !== JSON.stringify(existing[key])) {
                            function getMissingKeys(base, current, prefix = '') {
                                const missing = [];
                                Object.keys(base).forEach(k => {
                                    const path = prefix ? `${prefix}.${k}` : k;
                                    if (!(k in current)) {
                                        missing.push(path);
                                    } else if (
                                        base[k] !== null && typeof base[k] === 'object' && !Array.isArray(base[k]) &&
                                        current[k] !== null && typeof current[k] === 'object' && !Array.isArray(current[k])
                                    ) {
                                        missing.push(...getMissingKeys(base[k], current[k], path));
                                    }
                                });
                                return missing;
                            }
                            const missingKeys = getMissingKeys(cfgValue, existing[key]);
                            if (missingKeys.length) console.log(`[settings] "${key}" missing child keys added:`, missingKeys);
                            this.db.run(
                                `UPDATE settings SET value = ? WHERE key = ?`,
                                [JSON.stringify(merged), key],
                                (e) => { if (e) console.error('_initSettings merge error:', e.message); }
                            );
                        }
                    }
                });

                // Remove stale keys no longer in config
                const placeholders = knownKeys.map(() => '?').join(', ');
                this.db.run(
                    `DELETE FROM settings WHERE key NOT IN (${placeholders})`,
                    knownKeys,
                    (e) => { if (e) console.error('_initSettings cleanup error:', e.message); }
                );
            });
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

            this.db.run(
              `
              CREATE TABLE IF NOT EXISTS sms_templates (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                title TEXT NOT NULL,
                message TEXT NOT NULL,
                type TEXT DEFAULT 'custom', -- 'in' | 'out' | 'custom'
                created TIMESTAMP DEFAULT CURRENT_TIMESTAMP
              )`,
              (err) => {
                if (err) console.error("Error creating sms_templates table:", err.message);
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
