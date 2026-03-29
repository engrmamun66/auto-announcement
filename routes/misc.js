const express = require('express');

module.exports = function (utils, Backup, { DEVICE_API_BASE_URL }) {
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

  router.get('/transactions', async (req, res) => {
    const myHeaders = new Headers();
    myHeaders.append('Content-Type', 'application/json');
    fetch(
      `${DEVICE_API_BASE_URL}/iclock/api/transactions/?page=1&page_size=100&start_time=2025-01-26 16:08:00&end_time&terminal_alias=Device 1`,
      { method: 'POST', headers: myHeaders, body: JSON.stringify({ username: USERNAME, password: PASSWORD }), redirect: 'follow' }
    )
      .then((r) => r.text())
      .then((result) => { console.log(result); res.send(result); })
      .catch((error) => res.status(420).send({ success: false, error }));
  });

  return router;
};
