const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const DEFAULT_EXPIRY_MS = 7 * 24 * 60 * 60 * 1000; // 7 days
const FILE_PATH = path.join(__dirname, '..', '..', 'database', 'login.truck');

const UNIT_MS = { s: 1000, m: 60 * 1000, h: 60 * 60 * 1000, d: 24 * 60 * 60 * 1000, w: 7 * 24 * 60 * 60 * 1000 };

// Accepts formats like '5h', '1d', '7d', '30m' — falls back to DEFAULT_EXPIRY_MS if unset/invalid
function parseDuration(str, fallbackMs = DEFAULT_EXPIRY_MS) {
  if (!str || typeof str !== 'string') return fallbackMs;
  const match = str.trim().match(/^(\d+)\s*([smhdw])$/i);
  if (!match) return fallbackMs;
  const value = parseInt(match[1], 10);
  const unitMs = UNIT_MS[match[2].toLowerCase()];
  return unitMs ? value * unitMs : fallbackMs;
}

function readStore() {
  try {
    return JSON.parse(fs.readFileSync(FILE_PATH, 'utf-8'));
  } catch (e) {
    return {};
  }
}

function writeStore(store) {
  fs.mkdirSync(path.dirname(FILE_PATH), { recursive: true });
  fs.writeFileSync(FILE_PATH, JSON.stringify(store, null, 2));
}

function cleanExpired(store) {
  const now = Date.now();
  let changed = false;
  for (const token of Object.keys(store)) {
    if (store[token] < now) {
      delete store[token];
      changed = true;
    }
  }
  return changed;
}

function createToken(expiryMs = DEFAULT_EXPIRY_MS) {
  const store = readStore();
  cleanExpired(store);
  const token = crypto.randomBytes(32).toString('hex');
  store[token] = Date.now() + expiryMs;
  writeStore(store);
  return token;
}

function isValidToken(token) {
  if (!token) return false;
  const store = readStore();
  const expiresAt = store[token];
  if (!expiresAt) return false;
  if (expiresAt < Date.now()) {
    delete store[token];
    writeStore(store);
    return false;
  }
  return true;
}

function removeToken(token) {
  if (!token) return;
  const store = readStore();
  if (store[token]) {
    delete store[token];
    writeStore(store);
  }
}

module.exports = { createToken, isValidToken, removeToken, parseDuration, DEFAULT_EXPIRY_MS };
