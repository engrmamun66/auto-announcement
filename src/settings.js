function getSettings(db) {
    return new Promise((resolve, reject) => {
        db.all('SELECT key, value FROM settings', (err, rows) => {
            if (err) return reject(err);
            const result = {};
            (rows || []).forEach(row => {
                try { result[row.key] = JSON.parse(row.value); }
                catch { result[row.key] = row.value; }
            });
            resolve(result);
        });
    });
}

function updateSetting(db, key, value) {
    return new Promise((resolve, reject) => {
        db.run(
            `INSERT OR REPLACE INTO settings (key, value, updated) VALUES (?, ?, CURRENT_TIMESTAMP)`,
            [key, JSON.stringify(value)],
            err => err ? reject(err) : resolve()
        );
    });
}

const { fillMissingKeys } = require('./fillGapConfig');
const fs = require('fs');
const path = require('path');

function resetAllSettings(db) {
    let cfg = require('./../config.example');
    const configPath = path.join(__dirname, './../config.js');
    if (fs.existsSync(configPath)) {
        const userCfg = require(configPath);
        cfg = fillMissingKeys(cfg, userCfg);
    }
    const keys = [
        ['settings',            cfg.settings],
        ['classes',             cfg.classes],
        ['logo',                cfg.logo],
        ['css_vars',            cfg.css_vars],
        ['date_range_list',     cfg.date_range_list],
        ['card_owners',         cfg.card_owners],
        ['card_not_set_message',cfg.card_not_set_message],
    ];
    return new Promise((resolve, reject) => {
        db.serialize(() => {
            keys.forEach(([key, value]) => {
                db.run(
                    `INSERT OR REPLACE INTO settings (key, value, updated) VALUES (?, ?, CURRENT_TIMESTAMP)`,
                    [key, JSON.stringify(value)],
                    err => { if (err) console.error('resetAllSettings error:', err.message); }
                );
            });
            db.run('SELECT 1', err => err ? reject(err) : resolve());
        });
    });
}

module.exports = { getSettings, updateSetting, resetAllSettings };
