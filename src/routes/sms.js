const express = require('express');

module.exports = function(Sms) {
  const router = express.Router();

  router.get('/sms/templates', (req, res) => Sms.getTemplates(req, res));
  router.post('/sms/templates', (req, res) => Sms.addTemplate(req, res));
  router.put('/sms/templates/:id', (req, res) => Sms.updateTemplate(req, res));
  router.delete('/sms/templates/:id', (req, res) => Sms.deleteTemplate(req, res));
  router.post('/sms/send', (req, res) => Sms.sendSms(req, res));
  router.get('/sms/balance', (req, res) => Sms.checkBalance(req, res));

  return router;
};
