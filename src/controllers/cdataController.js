const { Store } = require('../stores/GlobalStore');
const fs = require('fs');
const path = require('path');

class CdataController {
  constructor() {
    this.dataDir = path.join(global.DIR, 'data', 'devices');
    if (!fs.existsSync(this.dataDir)) {
      fs.mkdirSync(this.dataDir, { recursive: true });
    }
  }

  handle(req, res) {
    console.log(`${req.method}:: ${req.originalUrl}`);
    console.log('=====================================================================');

    let rawData = '';

    req.on('data', chunk => {
      rawData += chunk.toString();
    });

    req.on('end', () => {
      console.log({ method: req.method });

      if (req.method === 'GET') {
        return this.handleGet(req, res);
      }

      this.handlePost(req, rawData);
      console.log('\n========================\n');
      res.status(200).type('text/plain').send('OK\r\n');
    });
  }

  handleGet(req, res) {
    const sn = req.query.SN || req.query.sn || 'UNKNOWN';
    const pushVersion = req.query.pushver || req.query.PushVer || '3.1.2';
    const polling_interval = Store.pollingIntervals?.[sn] ?? 10;

    Store.pollingIntervals[sn] = polling_interval;
    Store.lastPollingTimes[sn] = Date.now();

    const options = [
      `GET OPTION FROM: ${sn}`,
      `PushProtVer=${pushVersion}`,
      `ServerVer=${pushVersion}`,
      'Stamp=0',
      'OpStamp=0',
      'PhotoStamp=0',
      'PushOptionsFlag=1',
      'ErrorDelay=30',
      `Delay=${polling_interval}`,
      'TransTimes=00:00;14:00',
      `TransInterval=${polling_interval}`,
      'TransFlag=1111000000',
      'Realtime=1',
      'Encrypt=0',
    ].join('\r\n');

    res
      .status(200)
      .type('text/plain')
      .send(`${options}\r\n`);
  }

  handlePost(req, rawData) {
    if (!rawData.trim()) return;

    const sn = req.query.SN || req.query.sn || 'UNKNOWN';
    const table = req.query.table;
    const packIdx = parseInt(req.query.PackIdx || '1', 10);

    const all_rows = rawData.trim().split('\n');
    const rows = all_rows.map(row => {
      const parts = row.split('\t');
      const user_id = parts[0];
      const punch_time = parts[1];
      const status = parts[2];
      const verify = parts[3];
      const work_code = parts[4];
      return { raw_data: row, parts, user_id, punch_time, status, verify, work_code };
    });

    let row_item = rows[0];

    if (this._isDeviceDetails(row_item)) {
      const device = this._parseDeviceDetails(row_item.user_id);
      Store.data[sn] = { ...Store.data[sn], device };
    }
    else if (table === 'FINGERTMP' && this._isFingerprintData(row_item)) {
      const fingerprints = rows.map(r => this._parseFingerprintData(r.parts));
      this._writeFingerprintsToFile(sn, packIdx, fingerprints);
      Store.data[sn] = { ...Store.data[sn], fingerprints };
    }
    else if (table === 'ATTLOG' && this._isRealPunch(row_item)) {
      const records = rows.map(r => this._parseAttlogRow(r.parts));
      this._writeAttlogToFile(sn, packIdx, records);
      Store.data[sn] = { ...Store.data[sn], attendance: records };
    }
    else if (this._isRealPunch(row_item)) {
      const punch = rows.map(r => this._parseAttlogRow(r.parts));
      Store.data[sn] = { ...Store.data[sn], lastPunch: punch[0] };
    }
    else if (this._isUserData(row_item)) {
      const users = rows.map(r => this._parseUserData(r.parts));
      this._writeUsersToFile(sn, packIdx, users);
      Store.data[sn] = { ...Store.data[sn], users };
    }
    else if (this._isFingerprintData(row_item)) {
      const fingerprints = rows.map(r => this._parseFingerprintData(r.parts));
      this._writeFingerprintsToFile(sn, packIdx, fingerprints);
      Store.data[sn] = { ...Store.data[sn], fingerprints };
    }
    else if (this._isOplog(row_item)) {
      const oplogs = rows.map(r => this._parseOplogData(r.parts));
      this._writeOplogsToFile(sn, packIdx, oplogs);
      Store.data[sn] = { ...Store.data[sn], oplogs };
      console.log('>>>>>>>>> OPLOG:', oplogs.length, 'records');
    }
    else {
      console.log('>>>>>>>>> Others:', { row_item });
      this._writeOthersToFile(sn, rows);
    }
  }

  _writeUsersToFile(sn, packIdx, newUsers) {
    const file = path.join(this.dataDir, `${sn}_users.json`);
    const existing = packIdx > 1 && fs.existsSync(file) ? JSON.parse(fs.readFileSync(file, 'utf8') || '[]') : [];
    const users = [...existing, ...newUsers];
    fs.writeFileSync(file, JSON.stringify(users, null, 2));
    console.log(`>>>>>>>>> Users written [packet ${packIdx}] total: ${users.length}`);
  }

  _writeAttlogToFile(sn, packIdx, newRecords) {
    const file = path.join(this.dataDir, `${sn}_attlog.json`);
    const existing = packIdx > 1 && fs.existsSync(file) ? this._readJsonFile(file) : [];
    const records = [...existing, ...newRecords];
    fs.writeFileSync(file, JSON.stringify(records, null, 2));
    console.log(`>>>>>>>>> ATTLOG written [packet ${packIdx}] total: ${records.length}`);
  }

  _writeFingerprintsToFile(sn, packIdx, newRecords) {
    const file = path.join(this.dataDir, `${sn}_fingerprints.json`);
    const existing = packIdx > 1 && fs.existsSync(file) ? this._readJsonFile(file) : [];
    const records = [...existing, ...newRecords];
    fs.writeFileSync(file, JSON.stringify(records, null, 2));
    console.log(`>>>>>>>>> Fingerprints written [packet ${packIdx}] total: ${records.length}`);
  }

  _writeOplogsToFile(sn, packIdx, newRecords) {
    const file = path.join(this.dataDir, `${sn}_oplogs.json`);
    const existing = packIdx > 1 && fs.existsSync(file) ? this._readJsonFile(file) : [];
    const records = [...existing, ...newRecords];
    fs.writeFileSync(file, JSON.stringify(records, null, 2));
    console.log(`>>>>>>>>> OPLOG written [packet ${packIdx}] total: ${records.length}`);
  }

  _writeOthersToFile(sn, rows) {
    const file = path.join(this.dataDir, `${sn}_others.json`);
    fs.writeFileSync(file, JSON.stringify(rows, null, 2));
    console.log(`>>>>>>>>> Others written to ${file}`);
  }

  _readJsonFile(file) {
    try {
      return JSON.parse(fs.readFileSync(file, 'utf8'));
    } catch {
      return [];
    }
  }

  _parseAttlogRow(parts) {
    return {
      user_id: parts[0]?.trim(),
      punch_time: parts[1]?.trim(),
      status: parts[2]?.trim(),
      verify: parts[3]?.trim(),
      work_code: parts[4]?.trim() || '',
      reserved_1: parts[5]?.trim() || '',
      reserved_2: parts[6]?.trim() || '',
      index: parts[7]?.trim() || '',
    };
  }

  _isRealPunch({ user_id, status, verify, punch_time }) {
    return (
      /^\d+$/.test(user_id) &&
      /^\d+$/.test(status) &&
      /^\d+$/.test(verify) &&
      /^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/.test(punch_time)
    );
  }

  _isFingerprintData({ user_id }) {
    return /^FP\s/.test(user_id);
  }

  _parseFingerprintData(parts) {
    const obj = {};
    parts.forEach(part => {
      const idx = part.indexOf('=');
      if (idx === -1) return;
      const key = part.slice(0, idx).trim();
      const value = part.slice(idx + 1).trim();
      obj[key] = value;
    });
    return obj;
  }

  _isUserData({ user_id }) {
    return /^USER(\s|$)/.test(user_id);
  }

  _parseUserData(parts) {
    const obj = {};
    parts.forEach(part => {
      const idx = part.indexOf('=');
      if (idx === -1) return;
      const key = part.slice(0, idx).trim();
      const value = part.slice(idx + 1).trim();
      obj[key] = value;
    });
    return obj;
  }

  _isOplog({ user_id }) {
    return /^OPLOG\s/.test(user_id);
  }

  _parseOplogData(parts) {
    const [oplogField, operatorPin, timestamp, opCode, param1, param2, param3] = parts;
    return {
      operation: oplogField?.trim(),
      operatorPin: operatorPin?.trim(),
      timestamp: timestamp?.trim(),
      opCode: opCode?.trim(),
      param1: param1?.trim() || '',
      param2: param2?.trim() || '',
      param3: param3?.trim() || '',
    };
  }

  _isDeviceDetails({ user_id, status, verify, punch_time }) {
    return /^\~DeviceName=/.test(user_id) && !status && !verify && !punch_time;
  }

  _parseDeviceDetails(raw) {
    let data = raw.split(',').reduce((acc, pair) => {
      const idx = pair.indexOf('=');
      if (idx === -1) return acc;
      const key = pair.slice(0, idx).trim().replace(/\^~/, '');
      const value = pair.slice(idx + 1).trim();
      acc[key] = value;
      return acc;
    }, {});
    return data;
  }
}

module.exports = new CdataController();
