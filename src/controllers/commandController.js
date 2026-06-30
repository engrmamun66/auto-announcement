const { Store } = require('../stores/GlobalStore');
const { wait } = require('../utils/wait');

class CommandController {
  getCommandStore(req) {
    const store = req.app.locals.commands;

    if (!store.queues) {
      store.queues = {};
    }

    if (!store.nextId) {
      store.nextId = 1;
    }

    return store;
  }

  normalizeCn(cn) {
    return String(cn || '').trim().toLowerCase();
  }

  getQueue(store, cn) {
    const key = this.normalizeCn(cn);

    if (!store.queues[key]) {
      store.queues[key] = [];
    }

    return store.queues[key];
  }

  pushCommand(req, cn, command) {
    const store = this.getCommandStore(req);
    const id = store.nextId++;
    const commandLine = `C:${id}:${command}`;
    const queue = this.getQueue(store, cn);

    queue.push({
      id,
      cn,
      command,
      commandLine,
      createdAt: new Date().toISOString(),
    });

    return {
      id,
      cn,
      command,
      commandLine,
      pending: queue.length,
    };
  }

  getBodyData(req) {
    if (Array.isArray(req.body)) {
      return { users: req.body };
    }

    return req.body || {};
  }

  getPin(data) {
    return data.pin || data.PIN || data.userId || data.uid || data.id;
  }

  buildUserInfoCommand(data) {
    const pin = this.getPin(data);

    if (!pin) {
      return null;
    }

    const fields = [
      `PIN=${pin}`,
      `Name=${data.name || data.Name || ''}`,
      `Pri=${data.privilege || data.Pri || data.pri || 0}`,
      `Passwd=${data.password || data.Passwd || ''}`,
      `Card=${data.card || data.Card || ''}`,
      `Grp=${data.group || data.Grp || 1}`,
      `TZ=${data.timezone || data.TZ || '0000000100000000'}`,
    ];

    return `DATA UPDATE USERINFO ${fields.join('\t')}`;
  }

  buildBatchUserInfoCommand(users) {
    if (!Array.isArray(users) || users.length === 0) {
      return null;
    }

    const userLines = users.map(user => {
      const pin = this.getPin(user);
      if (!pin) return null;

      const fields = [
        `PIN=${pin}`,
        `Name=${user.name || user.Name || ''}`,
        `Pri=${user.privilege || user.Pri || user.pri || 0}`,
        `Passwd=${user.password || user.Passwd || ''}`,
        `Card=${user.card || user.Card || ''}`,
        `Grp=${user.group || user.Grp || 1}`,
        `TZ=${user.timezone || user.TZ || '0000000100000000'}`,
      ];

      return fields.join('\t');
    }).filter(Boolean);

    if (userLines.length === 0) {
      return null;
    }

    return `DATA UPDATE USERINFO\n${userLines.join('\n')}`;
  }

  buildDeleteUserCommand(data) {
    const pin = this.getPin(data);

    if (!pin) {
      return null;
    }

    return `DATA DELETE USERINFO PIN=${pin}`;
  }

  respondQueued(res, result) {
    res.status(202).json({
      status: 'queued',
      ...result,
    });
  }

  addEnroller(req, res) {
    const data = { ...this.getBodyData(req), privilege: 1 };
    const command = this.buildUserInfoCommand(data);
    if (!command) return res.status(400).json({ error: 'pin is required' });
    this.respondQueued(res, this.pushCommand(req, req.params.cn, command));
  }

  addAdmin(req, res) {
    const cn = req.params.cn;
    const data = { ...this.getBodyData(req), privilege: 6 };
    const command = this.buildUserInfoCommand(data);
    if (!command) return res.status(400).json({ error: 'pin is required' });

    this.queueCommandToDb(cn, command, (err, result) => {
      if (err) {
        return res.status(500).json({ error: 'Failed to queue command' });
      }
      res.status(202).json({ status: 'queued', ...result });
    });
  }

  addSuperAdmin(req, res) {
    const cn = req.params.cn;
    const data = { ...this.getBodyData(req), privilege: 14 };
    const command = this.buildUserInfoCommand(data);
    if (!command) return res.status(400).json({ error: 'pin is required' });

    this.queueCommandToDb(cn, command, (err, result) => {
      if (err) {
        return res.status(500).json({ error: 'Failed to queue command' });
      }
      res.status(202).json({ status: 'queued', ...result });
    });
  }

  queueCommandToDb(cn, command, callback) {
    global.db.run(
      'INSERT INTO command_queue (device_serial_number, command, status) VALUES (?, ?, ?)',
      [cn, command, 'pending'],
      function(err) {
        if (err) {
          console.error(`❌ Error queueing command: ${err.message}`);
          return callback(err, null);
        }

        console.log(`✅ Command queued for ${cn} (ID: ${this.lastID})`);
        callback(null, {
          id: this.lastID,
          cn,
          command,
          status: 'pending'
        });
      }
    );
  }

  addUser(req, res) {
    const cn = req.params.cn;
    const command = this.buildUserInfoCommand({ ...this.getBodyData(req), privilege: 0 });

    if (!command) {
      return res.status(400).json({ error: 'pin is required' });
    }

    this.queueCommandToDb(cn, command, (err, result) => {
      if (err) {
        return res.status(500).json({ error: 'Failed to queue command' });
      }
      res.status(202).json({ status: 'queued', ...result });
    });
  }

  updateUser(req, res) {
    const cn = req.params.cn;
    const command = this.buildUserInfoCommand(this.getBodyData(req));

    if (!command) {
      return res.status(400).json({ error: 'pin is required' });
    }

    this.queueCommandToDb(cn, command, (err, result) => {
      if (err) {
        return res.status(500).json({ error: 'Failed to queue command' });
      }
      res.status(202).json({ status: 'queued', ...result });
    });
  }

  removeUser(req, res) {
    const cn = req.params.cn;
    const command = this.buildDeleteUserCommand({
      ...req.query,
      ...this.getBodyData(req),
    });

    if (!command) {
      return res.status(400).json({ error: 'pin is required' });
    }

    this.queueCommandToDb(cn, command, (err, result) => {
      if (err) {
        return res.status(500).json({ error: 'Failed to queue command' });
      }
      res.status(202).json({ status: 'queued', ...result });
    });
  }

  addUsers(req, res) {
    const cn = req.params.cn;
    const data = this.getBodyData(req);
    const users = data.users;

    if (!Array.isArray(users) || users.length === 0) {
      return res.status(400).json({ error: 'users array is required' });
    }

    // Add privilege 0 to all users
    const usersWithPrivilege = users.map(user => ({ ...user, privilege: 0 }));
    const command = this.buildBatchUserInfoCommand(usersWithPrivilege);

    if (!command) {
      return res.status(400).json({ error: 'No valid users to add' });
    }

    this.queueCommandToDb(cn, command, (err, result) => {
      if (err) {
        return res.status(500).json({ error: 'Failed to queue command' });
      }
      res.status(202).json({
        status: 'queued',
        count: users.length,
        message: `Batch command queued for ${users.length} users`,
        ...result
      });
    });
  }

  removeUsers(req, res) {
    const cn = req.params.cn;
    const data = this.getBodyData(req);
    const pins = data.pins || data.users || data.ids;

    if (!Array.isArray(pins) || pins.length === 0) {
      return res.status(400).json({ error: 'pins array is required' });
    }

    let completed = 0;
    const results = [];

    pins.forEach((item, index) => {
      const command = this.buildDeleteUserCommand(typeof item === 'object' ? item : { pin: item });

      if (!command) {
        results[index] = { error: 'pin is required', item };
        completed++;
        if (completed === pins.length) {
          res.status(202).json({
            status: 'queued',
            count: results.filter(result => !result.error).length,
            results,
          });
        }
        return;
      }

      this.queueCommandToDb(cn, command, (err, result) => {
        results[index] = err ? { error: err.message, item } : result;
        completed++;
        if (completed === pins.length) {
          res.status(202).json({
            status: 'queued',
            count: results.filter(result => !result.error).length,
            results,
          });
        }
      });
    });
  }

  async getUsers(req, res) {
    const cn = this.resolveSnKey(req.params.cn);

    this.pushCommand(req, cn, 'DATA QUERY USERINFO');

    if (Store.data?.[cn]?.users) {
      return res.status(200).json({ users: Store.data[cn].users });
    }

    await wait(Store.nextPollingTime(cn));

    const users = Store.data?.[cn]?.users || [];
    res.status(200).json({ users });
  }

  async getAttendance(req, res) {
    const cn = this.resolveSnKey(req.params.cn);
    const { startTime, endTime, start_time, end_time } = { ...req.query, ...this.getBodyData(req) };
    const start = startTime || start_time;
    const end = endTime || end_time;

    let command = 'DATA QUERY ATTLOG';
    if (start) command += ` StartTime=${start}`;
    if (end) command += ` EndTime=${end}`;
    command += ` PageSize=3000`;

    // Create cache key from date range
    const dateKey = (!start && !end) ? String(new Date().getTime()) : `${start || 'all'}_${end || 'all'}`;
    
    console.log(`📋 Get attendance request for ${cn} [${dateKey}]: ${command}`);

    // Check if data already in Store (from prior polling)
    if (Store.data?.[cn]?.attendance?.[dateKey]) {
      console.log(`✅ Attendance found in Store [${dateKey}], returning ${Store.data[cn].attendance[dateKey].length} records immediately`);
      return res.status(200).json({ data: Store.data[cn].attendance[dateKey] });
    }

    // Mark pending query with date range so cdataController knows which key to use
    if (!Store.data[cn]) Store.data[cn] = {};
    Store.data[cn].pendingDateKey = dateKey;

    // Queue command to database
    global.db.run(
      'INSERT INTO command_queue (device_serial_number, command, status) VALUES (?, ?, ?)',
      [cn, command, 'pending'],
      function(err) {
        if (err) {
          console.error(`❌ Error queueing attendance command: ${err.message}`);
        } else {
          console.log(`✅ Attendance command queued for ${cn} (ID: ${this.lastID})`);
        }
      }
    );

    // Calculate exact wait time based on device polling interval
    const lastPollTime = Store.lastPollingTimes?.[cn] || 0;
    const pollingInterval = Store.pollingIntervals?.[cn] || 5; // default 2 seconds
    const nextPollTime = lastPollTime + (pollingInterval * 1000); // convert to ms
    const now = Date.now();
    let waitMs = Math.max(0, nextPollTime - now); // seconds until next poll
    waitMs = Math.min(waitMs, 15000); // cap at 15 seconds max

    const waitSecs = (waitMs / 1000).toFixed(2);
    console.log(`⏳ Last poll: ${lastPollTime}, interval: ${pollingInterval}s, wait: ${waitSecs}s [${dateKey}]`);

    if (waitMs > 0) {
      await wait(waitMs);
      console.log(`✅ Wait complete (${waitSecs}s). Checking for data...`);
    }

    // Check for data after waiting
    if (Store.data?.[cn]?.attendance?.[dateKey]) {
      console.log(`✅ Attendance found after polling wait [${dateKey}]: ${Store.data[cn].attendance[dateKey].length} records`);
      return res.status(200).json({ data: Store.data[cn].attendance[dateKey] });
    }

    // Still no data - continue polling with shorter intervals
    console.log(`⏳ Data not ready yet. Polling every 500ms (max 5s more)...`);
    let attempts = 0;
    const maxAdditionalAttempts = 10; // 10 * 500ms = 5 seconds more

    while (attempts < maxAdditionalAttempts) {
      await wait(500);
      if (Store.data?.[cn]?.attendance?.[dateKey]) {
        console.log(`✅ Attendance arrived after additional polling [${dateKey}]: ${Store.data[cn].attendance[dateKey].length} records`);
        return res.status(200).json({ data: Store.data[cn].attendance[dateKey] });
      }
      attempts++;
    }

    // Final timeout - return 202
    console.log(`⚠️ Timeout [${dateKey}]. Command queued but device response not yet received.`);
    res.status(202).json({
      data: [],
      message: 'Attendance request queued. Device response pending. Please retry.',
      queued: true
    });
  }

  async getFingerprints(req, res) {
    const cn = this.resolveSnKey(req.params.cn);

    this.pushCommand(req, cn, 'DATA QUERY FINGERTMP');

    if (Store.data?.[cn]?.fingerprints) {
      return res.status(200).json({ fingerprints: Store.data[cn].fingerprints });
    }

    await wait(Store.nextPollingTime(cn));

    const fingerprints = Store.data?.[cn]?.fingerprints || [];
    res.status(200).json({ fingerprints });
  }

  syncTime(req, res) {
    const now = new Date().toISOString().replace('T', ' ').slice(0, 19);
    this.respondQueued(res, this.pushCommand(req, req.params.cn, `DATE ${now}`));
  }

  refresh(req, res) {
    this.respondQueued(res, this.pushCommand(req, req.params.cn, 'REFRESH'));
  }

  check(req, res) {
    this.respondQueued(res, this.pushCommand(req, req.params.cn, 'CHECK'));
  }

  clearAttlog(req, res) {
    this.respondQueued(res, this.pushCommand(req, req.params.cn, 'DATA CLEAR ATTLOG'));
  }

  clearUsers(req, res) {
    this.respondQueued(res, this.pushCommand(req, req.params.cn, 'DATA CLEAR USERINFO'));
  }

  clearFingerprints(req, res) {
    this.respondQueued(res, this.pushCommand(req, req.params.cn, 'DATA CLEAR FINGERTMP'));
  }

  buildFingerprintCommand(data) {
    const pin = this.getPin(data);

    if (!pin) return null;

    const fid = data.fid !== undefined ? data.fid : data.FID !== undefined ? data.FID : null;
    const tmp = data.tmp || data.TMP || data.template;
    const valid = data.valid !== undefined ? data.valid : data.Valid !== undefined ? data.Valid : 1;

    if (fid === null || fid === '') return null;
    if (!tmp) return null;

    return `DATA UPDATE FINGERTMP PIN=${pin}\tFID=${fid}\tValid=${valid}\tTMP=${tmp}`;
  }

  createFingerprint(req, res) {
    const data = { ...req.query, ...this.getBodyData(req) };
    const command = this.buildFingerprintCommand(data);

    if (!command) {
      return res.status(400).json({ error: 'pin, fid, and tmp (template data) are required' });
    }

    this.respondQueued(res, this.pushCommand(req, req.params.cn, command));
  }

  deleteFingerprint(req, res) {
    const { pin, fid } = { ...req.query, ...this.getBodyData(req) };

    if (!pin) return res.status(400).json({ error: 'pin is required' });

    let command = `DATA DELETE FINGERTMP PIN=${pin}`;
    if (fid !== undefined && fid !== '') command += ` FID=${fid}`;

    this.respondQueued(res, this.pushCommand(req, req.params.cn, command));
  }

  openDoor(req, res) {
    const door = req.query.door || this.getBodyData(req).door || 1;
    this.respondQueued(res, this.pushCommand(req, req.params.cn, `OPEN DOOR ${door}`));
  }

  closeDoor(req, res) {
    const door = req.query.door || this.getBodyData(req).door || 1;
    this.respondQueued(res, this.pushCommand(req, req.params.cn, `CLOSE DOOR ${door}`));
  }

  resolveSnKey(cn) {
    const lower = cn.toLowerCase();
    return Object.keys(Store.pollingIntervals).find(k => k.toLowerCase() === lower) || cn;
  }

  setDelay(req, res) {
    const cn = this.resolveSnKey(req.params.cn);
    const { delay } = { ...req.query, ...this.getBodyData(req) };
    if (!delay) return res.status(400).json({ error: 'delay is required' });
    Store.pollingIntervals[cn] = Number(delay);
    res.status(200).json({ cn, delay: Number(delay), note: 'takes effect on next device poll' });
  }

  restart(req, res) {
    const cn = this.resolveSnKey(req.params.cn);
    const { delay } = { ...req.query, ...this.getBodyData(req) };
    const command = delay ? `REBOOT ${delay}` : 'REBOOT';
    if (delay) Store.pollingIntervals[cn] = Number(delay);
    this.respondQueued(res, this.pushCommand(req, cn, command));
  }

  pushRawCommand(req, res) {
    const data = this.getBodyData(req);
    const command = data.command || data.cmd || req.query.command || req.query.cmd;

    if (!command) {
      return res.status(400).json({ error: 'command is required' });
    }

    this.respondQueued(res, this.pushCommand(req, req.params.cn, command));
  }
}

module.exports = new CommandController();
