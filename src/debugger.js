const fs = require('fs');
const path = require('path');

const LOG_FILE = path.join(global.DIR || __dirname, '../database/debug.txt');

function debugLog(msg) {
    const line = `[${new Date().toISOString()}] ${msg}\n`;
    try {
        fs.appendFileSync(LOG_FILE, line);
    } catch(e) {
        console.error('debugLog write error:', e.message);
    }
}

module.exports = { debugLog };
