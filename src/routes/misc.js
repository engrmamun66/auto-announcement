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

  return router;
};
