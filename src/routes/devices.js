const express = require('express');

module.exports = (db) => {
  const router = express.Router();

  router.get('/devices', (req, res) => {
    db.all('SELECT * FROM devices ORDER BY updated DESC', [], (err, rows) => {
      if (err) {
        console.error('❌ Fetch devices error:', err.message);
        return res.status(500).json({ error: 'Fetch failed' });
      }
      console.log(`📋 API returning ${rows?.length || 0} devices`);
      res.json({ data: rows || [] });
    });
  });

  router.post('/devices/update', (req, res) => {
    const { id, name, brand, polling_interval, status } = req.body;

    db.run(
      `UPDATE devices SET name = ?, brand = ?, polling_interval = ?, status = ?, updated = CURRENT_TIMESTAMP
       WHERE id = ?`,
      [name, brand, polling_interval, status, id],
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
        'INSERT INTO command_queue (device_serial_number, command, command_line, status) VALUES (?, ?, ?, ?)',
        [cn, command, command, 'pending'],
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

  return router;
};
