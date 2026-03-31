const express = require('express');

module.exports = function (utils) {
  const router = express.Router();

  router.get('/refresh', (req, res) => {
    res.json({ success: true, message: 'Restarting server...' });
    utils.restartServer();
  });

  return router;
};
