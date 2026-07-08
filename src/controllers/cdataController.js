const { Store } = require('../stores/GlobalStore');
const fs = require('fs');
const path = require('path');
const moment = require('moment');

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
      } else {
        this.handlePost(req, rawData);
        console.log('\n========================\n');
        res.status(200).type('text/plain').send('OK\r\n');
      }

    });
  }

  handleGet(req, res) {
    const sn = req.query.SN || req.query.sn || 'UNKNOWN';
    const pushVersion = req.query.pushver || req.query.PushVer || '3.1.2';
    const self = this;

    Store.lastPollingTimes[sn] = Date.now();

    // Fetch polling_interval from database
    if (sn !== 'UNKNOWN') {
      global.db.get(
        'SELECT polling_interval FROM devices WHERE serial_number = ?',
        [sn],
        (err, device) => {
          let polling_interval = 2; // default

          if (err) {
            console.error(`❌ Error fetching device polling_interval: ${err.message}`);
          } else if (device) {
            // Skip if device is inactive (status = 0)
            if (device.status === 0) {
              console.log(`⏸️ Device ${sn} is inactive (status=0). Skipping polling.`);
              return res.status(200).type('text/plain').send('Delay=10\r\nOK\r\n');
            }
            polling_interval = device.polling_interval;
            console.log(`📡 Device ${sn} polling_interval from DB: ${polling_interval}s`);
          }

          // Store in memory for quick access
          Store.pollingIntervals[sn] = polling_interval;

          // Create/update device in database
          const now = new Date().toISOString();
          global.db.run(
            'INSERT OR IGNORE INTO devices (serial_number, polling_interval, status, brand, created, updated) VALUES (?, ?, 1, ?, ?, ?)',
            [sn, polling_interval, 'ZKTeco', now, now],
            function(insertErr) {
              if (insertErr) {
                console.error(`❌ Device insert error for ${sn}:`, insertErr.message);
              } else {
                console.log(`✅ Device ${sn} checked/inserted [interval: ${polling_interval}s]`);
              }
              // Always update timestamp
              global.db.run(
                'UPDATE devices SET updated = ? WHERE serial_number = ?',
                [now, sn],
                (updateErr) => {
                  if (updateErr) {
                    console.error(`❌ Device update error for ${sn}:`, updateErr.message);
                  }
                  self._broadcastDevices();
                }
              );
            }
          );

          // Send response
          self._sendPollingResponse(res, sn, pushVersion, polling_interval);
        }
      );
    } else {
      console.log('>>>>> SN is not OK', sn);
      Store.pollingIntervals[sn] = 6; // || 6
      this._sendPollingResponse(res, sn, pushVersion, 6); // || 6
    }
  }

  _sendPollingResponse(res, sn, pushVersion, polling_interval) {
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
      global.db.get('SELECT adjust_time FROM devices WHERE serial_number = ?', [sn], (err, device) => {
        let operations_add_subtract = `subtract(0, 'hour')`;
        if (!err && device && device.adjust_time) {
          operations_add_subtract = String(device.adjust_time).replace(/^\./, '');
        }

        let timeAdjustCallback;
        try {
          timeAdjustCallback = new Function('moment', 'dateTime', `return moment(dateTime, 'YYYY-MM-DD HH:mm:ss').${operations_add_subtract}.format('YYYY-MM-DD HH:mm:ss')`)
        } catch (err) {
          console.error('Error creating time adjust function:', err.message)
          timeAdjustCallback = (m, dt) => dt
        }
        const records = rows.map(r => this._parseAttlogRow(r.parts))
                        .map((item, index) => {
                          try {
                            const originalTime = moment(item.punch_time, 'YYYY-MM-DD HH:mm:ss')
                            item.punch_time = timeAdjustCallback(moment, item.punch_time)
                            console.log(' item.punch_time::after-adjustment:::', item.punch_time);
                            item.emp_code = item.user_id
                            if(index === 0){
                              const adjustedTime = moment(item.punch_time, 'YYYY-MM-DD HH:mm:ss')
                              const diff = adjustedTime.diff(originalTime)
                              const duration = moment.duration(Math.abs(diff))
                              const direction = diff < 0 ? 'PC-Time: slower' : 'PC-Time: Faster'
                              const sign = diff < 0 ? '-' : '+'
                              const functionName = sign == '-' ? 'subtract' : 'add'
                              const adjustment_time = [
                                Math.floor(duration.asHours()) ? `${functionName}(${Math.floor(duration.asHours())}, 'hour')`: false,
                                Math.floor(duration.minutes()) ? `${functionName}(${Math.floor(duration.minutes())}, 'minute')`: false,
                                Math.floor(duration.seconds()) ? `${functionName}(${Math.floor(duration.seconds())}, 'second')`: false,
                              ].filter(Boolean).join('.')

                              const gapTimeText = `${sign}${Math.floor(duration.asHours())}h ${duration.minutes()}m ${duration.seconds()}s (${direction})`
                              console.log(`\n⏰ Original: ${originalTime.format('YYYY-MM-DD HH:mm:ss')} → Adjusted: ${item.punch_time} | ${gapTimeText}\n`)

                              // Emit to socket clients
                              if (global.socketServer) {
                                global.socketServer.clients.forEach((client) => {
                                  if (client.readyState === client.OPEN) {
                                    client.send(JSON.stringify({
                                      type: 'gap_time_update',
                                      sn: sn,
                                      text: gapTimeText + ' --- ' + adjustment_time
                                    }))
                                  }
                                })
                              }
                            }
                          } catch (err) {
                            console.warn('Error adjusting punch time:', err.message)
                          }
                          return item
                        })

        this._writeAttendencelogToFile(sn, packIdx, records);
        // Initialize attendance storage if needed
        if (!Store.data[sn]) Store.data[sn] = {};
        if (!Store.data[sn].attendance) Store.data[sn].attendance = {};


        // Process each punch through attendance submission
        // const only_attendance_feature = global.config?.settings?.attendance?.only_attendance_feature
        const now = moment()
        const forceAsRealtime = req.query.forceAsRealtime === 'true'
        let is_realtime_punch = records?.length === 1 && moment(records?.[0]?.punch_time, 'YYYY-MM-DD HH:mm:ss').isBetween(
            now.clone().subtract(50, 'seconds'),
            now.clone().add(50, 'seconds')
          )

        // Treat as real-time if forced (dev/test punch)
        if (forceAsRealtime) {
          is_realtime_punch = true
          console.log('🧪 Forced as real-time punch. Processing immediately.')
        }

        console.log('NOW:', now.format('YYYY-MM-DD HH:mm:ss'), '| Is Realtime:', is_realtime_punch);
        if(is_realtime_punch){
          console.log(`✅ Realtime punch detected. Processing immediately...`);
          records.forEach(record => {
            this._processDevicePunch(record, sn);
            console.log('======this._processDevicePunch======', '|||', {record, sn});
          });
        } else {
          // Store by date key if pending, otherwise use 'all' key
          console.log(`📋 Batch attendance (${records.length} records). Stored for manual review or bulk import.`);
          const dateKey = Store.data[sn].pendingDateKey || 'all';
          Store.data[sn].attendance[dateKey] = records;
          console.log(`✅ Attendance stored [${dateKey}]: ${records.length} records`);
        }
      });
    }
     
    else if (this._isUserData(row_item)) {
      const users = rows.map(r => this._parseUserData(r.parts));
      this._writeUsersToFile(sn, packIdx, users);
      Store.data[sn] = { ...Store.data[sn], users };
    }
    else if (this._isOplog(row_item)) {
      const oplogs = rows.map(r => this._parseOplogData(r.parts));
      this._writeOptionslogToFile(sn, packIdx, oplogs);
      Store.data[sn] = { ...Store.data[sn], oplogs };
      console.log('>>>>>>>>> OPLOG:', oplogs.length, 'records');
    }
    else if (this._isFingerprintData(row_item)) {
      const fingerprints = rows.map(r => this._parseFingerprintData(r.parts));
      this._writeFingerprintsToFile(sn, packIdx, fingerprints);
      Store.data[sn] = { ...Store.data[sn], fingerprints };
      console.log('>>>>>>>>> FINGERPRINTS:', fingerprints.length, 'records');
    }
    else {
      console.log('>>>>>>>>> Others:', { row_item });
      this._writeOthersToFile(sn, rows);
    }
  }

  _writeUsersToFile(sn, packIdx, newUsers) {
    return
    const file = path.join(this.dataDir, `${sn}_users.json`);
    const existing = packIdx > 1 && fs.existsSync(file) ? JSON.parse(fs.readFileSync(file, 'utf8') || '[]') : [];
    const users = [...existing, ...newUsers];
    fs.writeFileSync(file, JSON.stringify(users, null, 2));
    console.log(`>>>>>>>>> Users written [packet ${packIdx}] total: ${users.length}`);
  }

  _writeAttendencelogToFile(sn, packIdx, newRecords) {
    return
    const file = path.join(this.dataDir, `${sn}_attlog.json`);
    const existing = packIdx > 1 && fs.existsSync(file) ? this._readJsonFile(file) : [];
    const records = [...existing, ...newRecords];
    fs.writeFileSync(file, JSON.stringify(records, null, 2));
    console.log(`>>>>>>>>> ATTLOG written [packet ${packIdx}] total: ${records.length}`);
  }

  _writeFingerprintsToFile(sn, packIdx, newRecords) {
    return
    const file = path.join(this.dataDir, `${sn}_fingerprints.json`);
    const existing = packIdx > 1 && fs.existsSync(file) ? this._readJsonFile(file) : [];
    const records = [...existing, ...newRecords];
    fs.writeFileSync(file, JSON.stringify(records, null, 2));
    console.log(`>>>>>>>>> Fingerprints written [packet ${packIdx}] total: ${records.length}`);
  }

  _writeOptionslogToFile(sn, packIdx, newRecords) {
    return
    const file = path.join(this.dataDir, `${sn}_oplogs.json`);
    const existing = packIdx > 1 && fs.existsSync(file) ? this._readJsonFile(file) : [];
    const records = [...existing, ...newRecords];
    fs.writeFileSync(file, JSON.stringify(records, null, 2));
    console.log(`>>>>>>>>> OPLOG written [packet ${packIdx}] total: ${records.length}`);
  }

  _writeOthersToFile(sn, rows) {
    return
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

  _broadcastDevices() {
    global.db.all('SELECT * FROM devices ORDER BY updated DESC', [], (err, devices) => {
      if (err) {
        console.error('❌ Fetch devices error:', err.message);
        return;
      }
      console.log(`📡 Broadcasting ${devices?.length || 0} devices to socket clients`);
      if (global.socketServer && global.socketServer.clients) {
        global.socketServer.clients.forEach((client) => {
          if (client.readyState === client.OPEN) {
            client.send(JSON.stringify({
              type: 'devices_updated',
              data: devices || []
            }));
          }
        });
      } else {
        console.warn('⚠️ Socket server not available for broadcast');
      }
    });
  }

  _processDevicePunch(record, sn) {
    const { user_id, emp_code, punch_time } = record;
    const self = this;

    // Use emp_code or user_id for lookup
    const dahela_number = emp_code || user_id;

    // Query student by dakhela to get barcode components
    global.db.get(
      'SELECT id, dakhela, class_short, name, class FROM students WHERE dakhela = ?',
      [dahela_number],
      (err, student) => {
        if (err) {
          console.error(`❌ DB error looking up card ${dahela_number}:`, err.message);
          return;
        }
        if (!student) {
          console.warn(`⚠️ Device card ${dahela_number} not mapped to student`);
          return;
        }

        // Format barcode: class_short-dakhela-sound1
        const barcode = `${student.class_short}-${student.dakhela}-sound1`;
        const date = punch_time.substring(0, 10); // Extract YYYY-MM-DD

        console.log(`📍 Processing punch: ${dahela_number} (${student.name}) @ ${punch_time}`);

        // Prepare request object for submitAttendanceRequest
        const mockReq = {
          body: {
            barcode,
            punch_time,
            date,
            source: 'device',
            device_index: 0,
            remarks: `device_fetch`,
            silent_mode: true,
            skipSms: false
          },
          query: {}
        };

        // Prepare response object
        const mockRes = {
          status: (code) => {
            mockRes.statusCode = code;
            return mockRes;
          },
          json: (data) => {
            if (mockRes.statusCode === 200) {
              self._broadcastDevicePunchResult(data, student);
            }
          },
          send: (data) => {
            if (mockRes.statusCode === 200) {
              self._broadcastDevicePunchResult(data, student);
            }
          }
        };

        // Call attendance submission with socket emission enabled
        const Attendance = require('../class-attendence');
        const attendance = new Attendance(global.db);
        attendance.Sms = global.Sms;
        attendance.submitAttendanceRequest(mockReq, mockRes, true);
      }
    );
  }

  _broadcastDevicePunchResult(response, student) {
    console.log(`📡 Broadcasting device punch: ${student.dakhela} (${student.name})`);

    if (!global.socketServer?.clients?.length) return;

    global.socketServer.clients.forEach((client) => {
      if (client.readyState === client.OPEN) {
        client.send(JSON.stringify({
          type: 'device_punch',
          data: response?.data,
          message: response?.message || 'Attendance recorded'
        }));
      }
    });
  }
}

module.exports = new CdataController();
