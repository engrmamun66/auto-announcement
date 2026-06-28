const { Store } = require('../stores/GlobalStore');

class GetrequestController {
  constructor() {
    this.count = 0;
  }

  withDeviceInfo(info) {
    const parts = info.split(',');
    const info_data = {
      firmware_version: parts[0]?.replace('Ver ', '').trim(),
      communication_protocol_version: parts[1],
      realtime_enabled: parts[2],
      device_type: parts[3],
      local_ip: parts[4],
      polling_interval_seconds: parts[5],
      timezone_dst: parts[6],
      reserved_7: parts[7],
      reserved_8: parts[8],
      feature_flags: parts[9],
    };

    console.log('INFO parsed:', info_data);
  }

  handlePolling(req, res) {
    const sn = req.query.SN;
    const info = req.query.INFO;
    const commands = req.app.locals.commands;
    const queueKey = String(sn || '').trim().toLowerCase();
    const queue = commands?.queues?.[queueKey];

    const polling_interval = Store.pollingIntervals?.[sn] ?? 10;
    Store.lastPollingTimes[sn] = Date.now();

    this.count++;
    console.log(`${req.method}:: ${req.originalUrl}`);
    console.log(`ZKTeco [${sn}] polling`);
    console.log({ count: this.count, polling_interval });

    if (info) {
      this.withDeviceInfo(info);
    }

    const delayLine = `Delay=${polling_interval}\r\nTransInterval=${polling_interval}`;

    if (queue?.length) {
      const nextCommand = queue.shift();

      console.log(`Command sent to ZKTeco [${sn}]:`, nextCommand);

      return res.status(200)
        .type('text/plain')
        .send(`${delayLine}\r\n${nextCommand.commandLine}\r\n`);
    }

    res.status(200)
      .type('text/plain')
      .send(`${delayLine}\r\nOK\r\n`);
  }
}

module.exports = new GetrequestController();
