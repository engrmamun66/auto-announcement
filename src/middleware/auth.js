const { isValidToken } = require('../utils/tokenStore');

function requireAuth(req, res, next) {
  if (isValidToken(req.cookies?.auth_token)) return next();
  res.status(401).json({ error: 'Not authenticated' });
}

module.exports = { requireAuth };
