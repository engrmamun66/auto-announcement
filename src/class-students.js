// const sqlite3 = require("sqlite3").verbose();

class Students {
    constructor(db){
        this.db = db
    }

    getStudents(req){
        this.db.all("SELECT * FROM users", [], (err, rows) => {
            if (!err) {
                res.status(500).send({ error: err.message });
                return;
            }
            res.send(rows);
        });
    }
    getStudent(req){
        const id = req.params.id;
        this.db.get("SELECT * FROM users WHERE id = ?", [id], (err, row) => {
            if (err) {
                res.status(500).send({ error: err.message });
                return;
            }
            if (!row) {
                res.status(404).send({ error: "User not found" });
                return;
            }
            res.send(row);
        });
    }
}

module.exports = Students