const express = require('express');

module.exports = function (utils, Backup) {
  const router = express.Router();

  router.get('/backup-list', (req, res) => Backup.getBackupDetails({ req, res }));

  router.post('/barcode-punch', (req, res) => {
    const barcode = req.body.barcode;
    if (global.socketServer) {
      global.socketServer.clients.forEach((client) => {
        if (client.readyState === client.OPEN) {
          client.send(JSON.stringify({ barcode }));
        }
      });
    } else {
      return res.status(420).send({ success: false, message: 'Socket server not running' });
    }
    res.status(200).send({ success: true, message: 'Card data processed.' });
  });

  router.get('/sw', (req, res) => utils._(req, res));

  router.get('/connected-devices', (req, res) => {
    const devices = global.connectedDevices ? Array.from(global.connectedDevices.values()) : [];
    res.status(200).send({ success: true, data: devices });
  });

  router.post('/connected-devices/:id/logout', (req, res) => {
    const targetId = Number(req.params.id);
    if (!global.connectedDevices) {
      return res.status(404).send({ success: false, message: 'No connected devices tracked.' });
    }
    for (const [client, info] of global.connectedDevices.entries()) {
      if (info.id === targetId) {
        if (client.readyState === client.OPEN) {
          client.send(JSON.stringify({ type: 'force_logout' }));
        }
        return res.status(200).send({ success: true, message: 'Logout signal sent.' });
      }
    }
    res.status(404).send({ success: false, message: 'Device not found or already disconnected.' });
  });

  return router;
};
