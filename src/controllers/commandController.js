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
    const command = 'DATA QUERY USERINFO PageSize=3000'; // without PageSize the device returns only its default first page (128 users)

    console.log(`👥 Get users request for ${cn}: ${command}`);

    // Always clear cached users to force fresh fetch from device
    if (Store.data?.[cn]) {
      delete Store.data[cn].users;
      console.log(`🔄 Cleared cached users for fresh fetch`);
    }

    // Queue command to database
    global.db.run(
      'INSERT INTO command_queue (device_serial_number, command, status) VALUES (?, ?, ?)',
      [cn, command, 'pending'],
      function(err) {
        if (err) {
          console.error(`❌ Error queueing users command: ${err.message}`);
        } else {
          console.log(`✅ Users command queued for ${cn} (ID: ${this.lastID})`);
        }
      }
    );

    // The device answers in packs of ~128 rows; wait until they stop arriving (returning on the
    // first pack is what capped the list at 128)
    const users = await this.waitForPacks(cn, 'users');
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

    // Always ask the device again: a cached result may be partial or out of date
    if (!Store.data[cn]) Store.data[cn] = {};
    if (!Store.data[cn].attendance) Store.data[cn].attendance = {};
    delete Store.data[cn].attendance[dateKey];

    // Mark pending query with date range so cdataController knows which key to use
    Store.data[cn].pendingDateKey = dateKey;
    Store.setAttendanceQueryPending(cn, 120 * 1000);

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

    // The device picks the command up on its next poll, then answers in packs of ~128 rows
    // (one HTTP POST per pack). Wait for the first pack, then keep collecting until no new
    // pack has arrived for SETTLE_MS — returning on the first pack is what capped results at 128.
    const pollingInterval = Store.pollingIntervals?.[cn] || 5;
    const FIRST_PACK_TIMEOUT_MS = Math.min(pollingInterval * 1000 + 10000, 40000);
    const SETTLE_MS = Math.min(Math.max(3000, pollingInterval * 1000 + 2000), 20000); // some devices send the next pack only on their next poll
    const MAX_TOTAL_MS = 55000; // stay under typical reverse-proxy timeouts (60s)
    const startedAt = Date.now();
    const received = () => Store.data?.[cn]?.attendance?.[dateKey];

    try {
      while (!received() && Date.now() - startedAt < FIRST_PACK_TIMEOUT_MS) {
        await wait(300);
      }

      if (!received()) {
        console.log(`⚠️ Timeout [${dateKey}]. Command queued but device response not yet received.`);
        return res.status(202).json({
          data: [],
          message: 'Attendance request queued. Device response pending. Please retry.',
          queued: true
        });
      }

      while (
        Date.now() - (Store.attendancePackReceivedAt[cn] || 0) < SETTLE_MS &&
        Date.now() - startedAt < MAX_TOTAL_MS
      ) {
        await wait(300);
      }

      const data = received() || [];
      console.log(`✅ Attendance collected [${dateKey}]: ${data.length} records in ${((Date.now() - startedAt) / 1000).toFixed(1)}s`);
      return res.status(200).json({ data });
    } finally {
      Store.setAttendanceQueryPending(cn, 0);
    }
  }

  async getFingerprints(req, res) {
    const cn = this.resolveSnKey(req.params.cn);
    const command = 'DATA QUERY FINGERTMP PageSize=3000'; // same as USERINFO / ATTLOG: ask for all rows, not just the first page

    console.log(`🔐 Get fingerprints request for ${cn}: ${command}`);

    // Always clear cached fingerprints to force fresh fetch from device
    if (Store.data?.[cn]) {
      delete Store.data[cn].fingerprints;
      console.log(`🔄 Cleared cached fingerprints for fresh fetch`);
    }

    // Queue command to database
    global.db.run(
      'INSERT INTO command_queue (device_serial_number, command, status) VALUES (?, ?, ?)',
      [cn, command, 'pending'],
      function(err) {
        if (err) {
          console.error(`❌ Error queueing fingerprints command: ${err.message}`);
        } else {
          console.log(`✅ Fingerprints command queued for ${cn} (ID: ${this.lastID})`);
        }
      }
    );

    // The device answers in packs of ~128 rows; wait until they stop arriving (returning on the
    // first pack is what capped the list at 128)
    const fingerprints = await this.waitForPacks(cn, 'fingerprints');
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

  /**
   * Wait for a paginated device reply stored in Store.data[cn][key]:
   * up to firstPackMs for the first pack, then until no new pack for settleMs (capped at maxMs).
   */
  async waitForPacks(cn, key, { firstPackMs, settleMs, maxMs = 55000 } = {}) {
    const startedAt = Date.now();
    // Some devices send the next pack only after their next poll, so wait at least one polling interval between packs
    const pollMs = (Store.pollingIntervals?.[cn] || 5) * 1000;
    firstPackMs = firstPackMs ?? Math.min(pollMs + 15000, 40000);
    settleMs = settleMs ?? Math.min(Math.max(3000, pollMs + 2000), 20000);
    const received = () => Store.data?.[cn]?.[key];
    while (!received() && Date.now() - startedAt < firstPackMs) await wait(200);
    if (!received()) {
      console.log(`⚠️ Timeout waiting for ${key} from ${cn} after ${firstPackMs}ms`);
      return [];
    }
    while (Date.now() - Store.lastPackReceivedAt(cn, key) < settleMs && Date.now() - startedAt < maxMs) await wait(200);
    const data = received() || [];
    console.log(`✅ ${key} collected from ${cn}: ${data.length} records in ${((Date.now() - startedAt) / 1000).toFixed(1)}s`);
    return data;
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
