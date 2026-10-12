const express = require('express');
const fs = require('fs');
const path = require('path');
const multer = require('multer');

const PUBLIC_DIR = path.join(__dirname, '../../public');
const MOBILE_APP_FILE = 'CallingBird.apk'; // served at /CallingBird.apk, downloaded from TopNav
const apkUpload = multer({ dest: path.join(PUBLIC_DIR, 'temp'), limits: { fileSize: 200 * 1024 * 1024 } });

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

  router.post('/mobile-app', (req, res) => {
    apkUpload.single('apk')(req, res, (err) => {
      if (err) return res.status(400).send({ success: false, message: err.message });
      const file = req.file;
      if (!file) return res.status(400).send({ success: false, message: 'No file uploaded.' });
      const discard = () => fs.unlink(file.path, () => {});

      // An APK is a zip archive: must end with .apk and start with the zip signature "PK\x03\x04"
      let header = Buffer.alloc(4);
      try {
        const fd = fs.openSync(file.path, 'r');
        fs.readSync(fd, header, 0, 4, 0);
        fs.closeSync(fd);
      } catch (e) {}
      if (!/\.apk$/i.test(file.originalname) || header.toString('hex') !== '504b0304') {
        discard();
        return res.status(400).send({ success: false, message: 'Only .apk files are allowed.' });
      }

      fs.rename(file.path, path.join(PUBLIC_DIR, MOBILE_APP_FILE), (renameErr) => {
        if (renameErr) {
          discard();
          return res.status(500).send({ success: false, message: renameErr.message });
        }
        res.status(200).send({ success: true, message: `${MOBILE_APP_FILE} uploaded.` });
      });
    });
  });

  return router;
};
