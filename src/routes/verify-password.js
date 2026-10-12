const express = require('express');

module.exports = (db) => {
  const router = express.Router();

  router.post('/verify-password', (req, res) => {
    const { password } = req.body;
    const validPasswords = ['allowme', 'asdf'];

    // 403, not 401: the front-end treats every 401 as "session expired" and shows the login screen.
    // A wrong confirmation password should only show "Incorrect password" in the dialog.
    if (!password || !validPasswords.includes(password)) {
      return res.status(403).json({ error: 'Invalid password' });
    }

    res.json({ success: true });
  });

  return router;
};
