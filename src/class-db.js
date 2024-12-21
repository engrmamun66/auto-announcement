const sqlite3 = require("sqlite3").verbose();

class myDB { 
    constructor({
        DB_NAME='database.db',
        DB_ROOT_FOLDER='database',
    }={}){
        this.DB_NAME = DB_NAME
        this.DB_ROOT_FOLDER = DB_ROOT_FOLDER;
        this.db = this._createDatabase(); 
        // this._createTables(this.db);
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
                  email TEXT NOT NULL UNIQUE
                )`,
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
}

module.exports = myDB