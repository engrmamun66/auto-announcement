const express = require('express');

module.exports = function (config) {
  const router = express.Router();

  router.post('/login', (req, res) => {
    const { password } = req.body || {};
    if (password && password === config.env.LOGIN_PASSWORD) {
      req.session.authenticated = true;
      return res.json({ success: true });
    }
    res.status(401).json({ error: 'Incorrect password' });
  });

  router.post('/logout', (req, res) => {
    req.session.destroy(() => {
      res.json({ success: true });
    });
  });

  router.get('/auth-status', (req, res) => {
    res.json({ authenticated: !!req.session?.authenticated });
  });

  return router;
};
