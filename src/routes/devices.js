const express = require('express');
const { Store } = require('../stores/GlobalStore');

module.exports = (db) => {
  const router = express.Router();

  // Arms a 10-second calibration window for this device — the next punch
  // received from it while armed is used to auto-measure the real network/
  // processing latency and save it as that device's realtime_punch_window_seconds.
  router.post('/devices/:sn/enable-time-adjustment-mode', (req, res) => {
    const { sn } = req.params;
    Store.enableTimeAdjustmentMode(sn);
    res.json({ success: true });
  });

  router.get('/devices', (req, res) => {
    db.all('SELECT * FROM devices ORDER BY id DESC', [], (err, rows) => {
      if (err) {
        console.error('❌ Fetch devices error:', err.message);
        return res.status(500).json({ error: 'Fetch failed' });
      }
      console.log(`📋 API returning ${rows?.length || 0} devices`);
      res.json({ data: rows || [] });
    });
  });

  router.post('/devices/update', (req, res) => {
    const { id, name, brand, polling_interval, status, adjust_time } = req.body;

    db.run(
      `UPDATE devices SET name = ?, brand = ?, polling_interval = ?, status = ?, adjust_time = ?, updated = CURRENT_TIMESTAMP
       WHERE id = ?`,
      [name, brand, polling_interval, status, adjust_time, id],
      function(err) {
        if (err) {
          console.error('Update device error:', err.message);
          return res.status(500).json({ error: 'Update failed' });
        }
        // Broadcast updated devices list to socket clients
        db.all('SELECT * FROM devices ORDER BY updated DESC', [], (fetchErr, rows) => {
          if (!fetchErr && global.socketServer) {
            global.socketServer.clients.forEach((client) => {
              if (client.readyState === client.OPEN) {
                client.send(JSON.stringify({
                  type: 'devices_updated',
                  data: rows || []
                }));
              }
            });
          }
        });
        res.json({ success: true });
      }
    );
  });

  router.post('/devices/delete/:id', (req, res) => {
    const { id } = req.params;

    db.run('DELETE FROM devices WHERE id = ?', [id], function(err) {
      if (err) {
        console.error('Delete device error:', err.message);
        return res.status(500).json({ error: 'Delete failed' });
      }
      // Broadcast updated devices list to socket clients
      db.all('SELECT * FROM devices ORDER BY updated DESC', [], (fetchErr, rows) => {
        if (!fetchErr && global.socketServer) {
          global.socketServer.clients.forEach((client) => {
            if (client.readyState === client.OPEN) {
              client.send(JSON.stringify({
                type: 'devices_updated',
                data: rows || []
              }));
            }
          });
        }
      });
      res.json({ success: true });
    });
  });

  router.post('/devices/restart/:cn', (req, res) => {
    const cn = req.params.cn;

    console.log(`📤 Restart request for device: ${cn}`);

    // Check if device exists in database
    db.get('SELECT id FROM devices WHERE serial_number = ?', [cn], (err, device) => {
      if (err) {
        console.error(`❌ Database error: ${err.message}`);
        return res.status(500).json({ error: 'Database error' });
      }

      if (!device) {
        console.warn(`⚠️ Device ${cn} not found in database`);
        return res.status(404).json({ error: 'Device not found' });
      }

      // Insert command into queue
      const command = 'REBOOT';
      db.run(
        'INSERT INTO command_queue (device_serial_number, command, status) VALUES (?, ?, ?)',
        [cn, command, 'pending'],
        function(err) {
          if (err) {
            console.error(`❌ Error queueing restart command: ${err.message}`);
            return res.status(500).json({ error: 'Failed to queue command' });
          }

          console.log(`🔄 Restart command queued for ${cn} (ID: ${this.lastID})`);
          res.json({ success: true, message: 'Restart command queued' });
        }
      );
    });
  });

  router.post('/devices/push-command/:cn', (req, res) => {
    const cn = req.params.cn;
    const { command } = req.body;

    if (!command || !command.trim()) {
      return res.status(400).json({ error: 'Command cannot be empty' });
    }

    console.log(`📤 Push command request for device: ${cn}, command: ${command}`);

    // Check if device exists in database
    db.get('SELECT id FROM devices WHERE serial_number = ?', [cn], (err, device) => {
      if (err) {
        console.error(`❌ Database error: ${err.message}`);
        return res.status(500).json({ error: 'Database error' });
      }

      if (!device) {
        console.warn(`⚠️ Device ${cn} not found in database`);
        return res.status(404).json({ error: 'Device not found' });
      }

      // Insert command into queue
      db.run(
        'INSERT INTO command_queue (device_serial_number, command, status) VALUES (?, ?, ?)',
        [cn, command.trim(), 'pending'],
        function(err) {
          if (err) {
            console.error(`❌ Error queueing push command: ${err.message}`);
            return res.status(500).json({ error: 'Failed to queue command' });
          }

          console.log(`✅ Push command queued for ${cn}: ${command.trim()} (ID: ${this.lastID})`);
          res.json({ success: true, message: 'Command queued successfully' });
        }
      );
    });
  });

  return router;
};
