const express = require('express');
const { createToken, isValidToken, removeToken, parseDuration, DEFAULT_EXPIRY_MS } = require('../utils/tokenStore');

module.exports = function (config) {
  const router = express.Router();
  const expiryMs = parseDuration(config.env.LOGIN_EXPIRE_AFTER, DEFAULT_EXPIRY_MS);

  router.post('/login', (req, res) => {
    const { password } = req.body || {};
    if (password && password === config.env.LOGIN_PASSWORD) {
      const token = createToken(expiryMs);
      res.cookie('auth_token', token, {
        maxAge: expiryMs,
        httpOnly: true,
        sameSite: 'lax',
        secure: req.secure,
      });
      return res.json({ success: true });
    }
    res.status(401).json({ error: 'Incorrect password' });
  });

  router.post('/logout', (req, res) => {
    removeToken(req.cookies?.auth_token);
    res.clearCookie('auth_token');
    res.json({ success: true });
  });

  router.get('/auth-status', (req, res) => {
    res.json({ authenticated: isValidToken(req.cookies?.auth_token) });
  });

  return router;
};
