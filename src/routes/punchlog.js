const express = require('express');

module.exports = function (PunchLog) {
  const router = express.Router();

  router.post('/punch-log/add-log', (req, res) => PunchLog.add(req, res));
  router.post('/punch-log/get-log', (req, res) => PunchLog.getLog(req, res));

  return router;
};
