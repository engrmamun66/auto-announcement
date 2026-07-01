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

    // console.log('INFO parsed:', info_data);
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
        'SELECT polling_interval, status FROM devices WHERE serial_number = ?',
        [sn],
        (err, device) => {
          let polling_interval = 10; // default

          if (err) {
            console.error(`❌ Error fetching polling_interval for ${sn}:`, err.message);
          } else if (device) {
            // Skip if device is inactive (status = 0)
            if (device.status === 0) {
              console.log(`⏸️ Device ${sn} is inactive (status=0). Skipping polling.`);
              return res.status(200)
                .type('text/plain')
                .send(`Delay=10\r\nTransInterval=10\r\nOK\r\n`);
            }
            polling_interval = device.polling_interval || 10;
            Store.pollingIntervals[sn] = polling_interval;
            console.log(`📡 Polling interval from DB: ${polling_interval}s`);
          } else {
            polling_interval = Store.pollingIntervals?.[sn] ?? 10;
            console.log(`📡 Polling interval from Store: ${polling_interval}s`);
          }

          console.log({ count: this.count, polling_interval }, '\n');

          const delayLine = `Delay=${polling_interval}\r\nTransInterval=${polling_interval}`;

          // Fetch ALL pending commands for batch processing (up to 50 commands per poll)
          const limit = 500
          db.all(
            `SELECT id, command FROM command_queue WHERE device_serial_number = ? AND status = ? ORDER BY created_at ASC LIMIT ${limit}`,
            [sn, 'pending'],
            (cmdErr, rows) => {
              if (cmdErr) {
                console.error(`Error fetching commands for ${sn}:`, cmdErr.message);
                return res.status(200)
                  .type('text/plain')
                  .send(`${delayLine}\r\nOK\r\n`);
              }

              if (rows && rows.length > 0) {
                // Format all commands: C:ID:COMMAND
                const formattedCommands = rows.map(row => `C:${row.id}:${row.command}`);
                const commandBatch = formattedCommands.join('\r\n');

                console.log(`📤 Batch commands sent to ZKTeco [${sn}]: ${rows.length} command(s)`);
                rows.forEach(row => console.log(`   - C:${row.id}:${row.command}`));

                // Mark all commands as sent (batch update)
                const commandIds = rows.map(r => r.id);
                const placeholders = commandIds.map(() => '?').join(',');
                db.run(
                  `UPDATE command_queue SET status = ?, sent_at = ? WHERE id IN (${placeholders})`,
                  ['sent', new Date().toISOString(), ...commandIds],
                  (updateErr) => {
                    if (updateErr) {
                      console.error(`Error updating command status for ${sn}:`, updateErr.message);
                    }
                  }
                );

                console.log(`Command batch queued::\n${delayLine}\r\n${commandBatch}\r\n`);
                return res.status(200)
                  .type('text/plain')
                  .send(`${delayLine}\r\n${commandBatch}\r\n`);
              } else {
                res.status(200)
                  .type('text/plain')
                  .send(`${delayLine}\r\nOK\r\n`);
              }

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
