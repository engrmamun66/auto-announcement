const express = require('express');

module.exports = function (LeavAndVacations) {
  const router = express.Router();

  router.get('/leave-and-vacation-list', (req, res) => LeavAndVacations.list(req, res));
  router.post('/leave-and-vacation-add-bulk', (req, res) => LeavAndVacations.api_addMultiple(req, res));
  router.post('/leave-and-vacation-delete', (req, res) => LeavAndVacations.api_delete(req, res));

  return router;
};
