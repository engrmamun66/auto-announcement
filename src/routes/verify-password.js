const express = require('express');

module.exports = (db) => {
  const router = express.Router();

  router.post('/verify-password', (req, res) => {
    const { password } = req.body;
    const validPasswords = ['allowme', 'asdf'];

    if (!password || !validPasswords.includes(password)) {
      return res.status(401).json({ error: 'Invalid password' });
    }

    res.json({ success: true });
  });

  return router;
};
