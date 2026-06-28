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
    const db = global.db;

    Store.lastPollingTimes[sn] = Date.now();
    this.count++;

    console.log(`${req.method}:: ${req.originalUrl}`);
    console.log(`>>>> ZKTeco [${sn}] polling`);

    if (info) {
      this.withDeviceInfo(info);
    }

    // Fetch polling_interval from database
    if (db) {
      db.get(
        'SELECT polling_interval FROM devices WHERE serial_number = ?',
        [sn],
        (err, device) => {
          let polling_interval = 10; // default

          if (err) {
            console.error(`❌ Error fetching polling_interval for ${sn}:`, err.message);
          } else if (device) {
            polling_interval = device.polling_interval || 10;
            Store.pollingIntervals[sn] = polling_interval;
            console.log(`📡 Polling interval from DB: ${polling_interval}s`);
          } else {
            polling_interval = Store.pollingIntervals?.[sn] ?? 10;
            console.log(`📡 Polling interval from Store: ${polling_interval}s`);
          }

          console.log({ count: this.count, polling_interval }, '\n');

          const delayLine = `Delay=${polling_interval}\r\nTransInterval=${polling_interval}`;

          // Fetch next pending command from database
          db.get(
            'SELECT id, command, command_line FROM command_queue WHERE device_serial_number = ? AND status = ? ORDER BY created_at ASC LIMIT 1',
            [sn, 'pending'],
            (cmdErr, row) => {
              if (cmdErr) {
                console.error(`Error fetching command for ${sn}:`, cmdErr.message);
                return res.status(200)
                  .type('text/plain')
                  .send(`${delayLine}\r\nOK\r\n`);
              }

              if (row) {
                // Format command with dynamic ID: C:ID:COMMAND
                const commandId = row.id;
                const formattedCommand = `C:${commandId}:${row.command}`;

                console.log(`📤 Command sent to ZKTeco [${sn}]:`, formattedCommand);

                // Mark command as sent
                db.run(
                  'UPDATE command_queue SET status = ?, sent_at = ? WHERE id = ?',
                  ['sent', new Date().toISOString(), row.id],
                  (updateErr) => {
                    if (updateErr) {
                      console.error(`Error updating command status: ${updateErr.message}`);
                    }
                  }
                );
                console.log('Command queued::', `${delayLine}\r\n${formattedCommand}\r\n`);
                return res.status(200)
                  .type('text/plain')
                  .send(`${delayLine}\r\n${formattedCommand}\r\n`);
              }

              res.status(200)
                .type('text/plain')
                .send(`${delayLine}\r\nOK\r\n`);
            }
          );
        }
      );
    } else {
      res.status(200)
        .type('text/plain')
        .send(`Delay=10\r\nTransInterval=10\r\nOK\r\n`);
    }
  }
}

module.exports = new GetrequestController();
