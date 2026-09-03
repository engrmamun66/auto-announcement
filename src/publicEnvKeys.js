// Only these env{} keys are safe to expose to the browser (via /app's GLOBAL_DATA
// and /api/config). Everything else (SECRET_KEY, LOGIN_PASSWORD, device credentials,
// DATABASE_PATH, etc.) must never leave the server.
const PUBLIC_ENV_KEYS = ['CODE_NUMBER', 'BASE_URL', 'API_BASE_URL', 'PORT'];

function pickPublicEnv(env = {}) {
  const result = {};
  for (const key of PUBLIC_ENV_KEYS) {
    if (env[key] !== undefined) result[key] = env[key];
  }
  return result;
}

module.exports = { PUBLIC_ENV_KEYS, pickPublicEnv };
