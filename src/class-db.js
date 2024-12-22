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
                    year TEXT DEFAULT NULL,
                    sound1 TEXT DEFAULT NULL,
                    sound2 TEXT DEFAULT NULL,
                    sound3 TEXT DEFAULT NULL,
                    created TIMESTAMP DEFAULT CURRENT_TIMESTAMP
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

    _addColumn(tableName, columnName, { defaultVal = undefined, }={}){ this.db.run(
            `   ALTER TABLE ${tableName}
                ADD COLUMN ${columnName} VARCHAR ${defaultVal != undefined ? ('DEFAULT ' + defaultVal) : ''} CONSTRAINT ${columnName + '_addColumn_constraint'} 
                ;
            `,
            (err) => {
              if (err) {
                console.error("AddColumn Error creating table:", err.message);
              }
            }
        );
    }
}

module.exports = myDB