const express = require('express');

module.exports = function (Attendence, { Sms }) {
  const router = express.Router();
  Attendence.Sms = Sms;

  router.post('/attendence-list', (req, res) => Attendence.list(req, res));
  router.post('/attendence-reports', (req, res) => Attendence.getAttendanceReports(req, res));
  router.post('/attendence-reports-for-single-class', (req, res) => Attendence.getAttendanceReportsForSingleClass(req, res));
  router.post('/submit-attendance', (req, res) => Attendence.submitAttendanceRequest(req, res));
  router.post('/attendence-add', (req, res) => Attendence.addNew(req, res));
  router.post('/attendence-update', (req, res) => Attendence.update(req, res));
  router.delete('/attendence-delete/:id', (req, res) => Attendence.delete(req, res));
  router.post('/attendence-delete-bulk-count', (req, res) => Attendence.deleteBulkCount(req, res));
  router.delete('/attendence-delete-bulk', (req, res) => Attendence.deleteBulk(req, res));

  return router;
};
