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
    const data = { ...this.getBodyData(req), privilege: 6 };
    const command = this.buildUserInfoCommand(data);
    if (!command) return res.status(400).json({ error: 'pin is required' });
    this.respondQueued(res, this.pushCommand(req, req.params.cn, command));
  }

  addSuperAdmin(req, res) {
    const data = { ...this.getBodyData(req), privilege: 14 };
    const command = this.buildUserInfoCommand(data);
    if (!command) return res.status(400).json({ error: 'pin is required' });
    this.respondQueued(res, this.pushCommand(req, req.params.cn, command));
  }

  addUser(req, res) {
    const command = this.buildUserInfoCommand({ ...this.getBodyData(req), privilege: 0 });

    if (!command) {
      return res.status(400).json({ error: 'pin is required' });
    }

    this.respondQueued(res, this.pushCommand(req, req.params.cn, command));
  }

  removeUser(req, res) {
    const command = this.buildDeleteUserCommand({
      ...req.query,
      ...this.getBodyData(req),
    });

    if (!command) {
      return res.status(400).json({ error: 'pin is required' });
    }

    this.respondQueued(res, this.pushCommand(req, req.params.cn, command));
  }

  addUsers(req, res) {
    const data = this.getBodyData(req);
    const users = data.users;

    if (!Array.isArray(users) || users.length === 0) {
      return res.status(400).json({ error: 'users array is required' });
    }

    const results = users.map((user) => {
      const command = this.buildUserInfoCommand({ ...user, privilege: 0 });

      if (!command) {
        return { error: 'pin is required', user };
      }

      return this.pushCommand(req, req.params.cn, command);
    });

    res.status(202).json({
      status: 'queued',
      count: results.filter(result => !result.error).length,
      results,
    });
  }

  removeUsers(req, res) {
    const data = this.getBodyData(req);
    const pins = data.pins || data.users || data.ids;

    if (!Array.isArray(pins) || pins.length === 0) {
      return res.status(400).json({ error: 'pins array is required' });
    }

    const results = pins.map((item) => {
      const command = this.buildDeleteUserCommand(typeof item === 'object' ? item : { pin: item });

      if (!command) {
        return { error: 'pin is required', item };
      }

      return this.pushCommand(req, req.params.cn, command);
    });

    res.status(202).json({
      status: 'queued',
      count: results.filter(result => !result.error).length,
      results,
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

    this.pushCommand(req, cn, command);

    if (Store.data?.[cn]?.attendance) {
      return res.status(200).json({ attendance: Store.data[cn].attendance });
    }

    await wait(Store.nextPollingTime(cn));

    const attendance = Store.data?.[cn]?.attendance || [];
    res.status(200).json({ attendance });
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
