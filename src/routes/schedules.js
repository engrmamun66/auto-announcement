const express = require('express');

module.exports = function (Schedules) {
  const router = express.Router();

  router.get('/schedules/list', (req, res) => Schedules.list(req, res));
  router.post('/schedules/add', (req, res) => Schedules.add(req, res));
  router.post('/schedules/update', (req, res) => Schedules.updateSchedule(req, res));
  router.post('/schedules/update-status', (req, res) => Schedules.updateScheduleStatus(req, res));
  router.post('/schedules/update-order-indexes', (req, res) => Schedules.updateSchedulesOrderIndex(req, res));
  router.delete('/schedules/delete/:id', (req, res) => Schedules.deleteSchedule(req, res));

  return router;
};
