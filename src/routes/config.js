const express = require('express');
const fs = require('fs');
const path = require('path');
const vm = require('vm');
const enLang = require('../lang/en');
const bnLang = require('../lang/bn');

const ENV_FILES = {
  'config.example.js': path.join(__dirname, '..', '..', 'config.example.js'),
  'config.js': path.join(__dirname, '..', '..', 'config.js'),
};

function resolveEnvFile(name) {
  return ENV_FILES[name] || null;
}

function cloneData(data) {
  return JSON.parse(JSON.stringify(data || {}));
}

function getLanguageCode(config = {}) {
  return config?.settings?.lang_bn === false ? 'en' : 'bn';
}

function getCanonicalTitle(title) {
  if (title && typeof title === 'object' && !Array.isArray(title)) {
    return title.en || title.bn || '';
  }
  return title || '';
}

function getLocalizedTitle(title, langCode = 'en') {
  if (title && typeof title === 'object' && !Array.isArray(title)) {
    if (langCode === 'bn') return title.bn || title.en || '';
    return title.en || title.bn || '';
  }
  return title || '';
}

function getTypeTitleKey(item = {}) {
  if (item?.title_key) return item.title_key;
  return getCanonicalTitle(item?.title);
}

function getTypeTitleLabel(item = {}, langCode = 'en') {
  if (item?.title_label) return item.title_label;
  return getLocalizedTitle(item?.title, langCode);
}

function normalizeLocalizedTypes(items = [], langCode = 'en') {
  return (Array.isArray(items) ? items : []).map((item) => ({
    ...item,
    title_key: getTypeTitleKey(item),
    title_label: getTypeTitleLabel(item, langCode),
  }));
}

function getAttendanceLangConfig(langCode = 'en') {
  const langSource = langCode === 'bn' ? bnLang : enLang;
  return cloneData(langSource?.attendance || {});
}

module.exports = function (config, utils, Backup) {
  const router = express.Router();

  router.get('/config', (req, res) => {
    const track = require('../../tracker.json');

    if (req.query.switch_mode) {
      const switch_mode = req.query.switch_mode;
      if (['auto', 'manual'].includes(switch_mode)) {
        track.switch_mode = switch_mode;
        utils.withTrackFile(track, { overwrite: true });
      }
    }

    config.settings.with_speaker_controls.switch_mode = track?.switch_mode || 'auto';
    const runtimeConfig = cloneData(config);
    const lang_code = getLanguageCode(runtimeConfig);
    const attendanceLangConfig = getAttendanceLangConfig(lang_code);

    runtimeConfig.settings = runtimeConfig.settings || {};
    runtimeConfig.settings.attendance = runtimeConfig.settings.attendance || {};

    runtimeConfig.settings.attendance.vacation_types = normalizeLocalizedTypes(
      attendanceLangConfig?.vacation_types || runtimeConfig?.settings?.attendance?.vacation_types,
      lang_code
    );
    runtimeConfig.settings.attendance.stuents_leave_types = normalizeLocalizedTypes(
      attendanceLangConfig?.stuents_leave_types || runtimeConfig?.settings?.attendance?.stuents_leave_types,
      lang_code
    );

    runtimeConfig.lang_code = lang_code;
    runtimeConfig.lang_pack = lang_code === 'bn' ? bnLang.strings : enLang.strings;
    runtimeConfig.lang_packs = {
      en: enLang.strings,
      bn: bnLang.strings,
    };
    runtimeConfig.custom_css = runtimeConfig.settings?.custom_css || '';

    res.send(runtimeConfig);
  });

  router.get('/env-config', (req, res) => {
    try {
      const fileKey = String(req.query.file || 'config.example.js');
      const filePath = resolveEnvFile(fileKey);
      if (!filePath) return res.status(400).send({ error: 'Invalid file selection.' });
      const raw = fs.readFileSync(filePath, 'utf-8');
      let data = null;
      try {
        delete require.cache[require.resolve(filePath)];
        data = require(filePath);
      } catch (e) {
        data = null;
      }
      res.send({ raw, data, file: fileKey });
    } catch (error) {
      res.status(500).send({ error: error.message });
    }
  });

  router.post('/env-config/validate', (req, res) => {
    try {
      const raw = req.body?.raw;
      const fileKey = String(req.body?.file || 'config.example.js');
      const filePath = resolveEnvFile(fileKey);
      if (!filePath) return res.status(400).send({ error: 'Invalid file selection.' });
      if (!raw || typeof raw !== 'string') return res.status(400).send({ error: 'Raw config string required.' });
      const sandbox = { module: { exports: {} }, exports: {}, require, __dirname: path.dirname(filePath) };
      new vm.Script(raw).runInNewContext(sandbox);
      res.send({ data: sandbox.module.exports || null });
    } catch (error) {
      res.status(400).send({ error: error.message });
    }
  });

  router.post('/env-config', (req, res) => {
    try {
      const fileKey = String(req.body?.file || 'config.example.js');
      const filePath = resolveEnvFile(fileKey);
      if (!filePath) return res.status(400).send({ error: 'Invalid file selection.' });
      const raw = req.body?.raw;
      const data = req.body?.data;

      if (raw && typeof raw === 'string') {
        const sandbox = { module: { exports: {} }, exports: {}, require, __dirname: path.dirname(filePath) };
        new vm.Script(raw).runInNewContext(sandbox);
        fs.writeFileSync(filePath, raw, 'utf-8');
        res.send({ success: true, data: sandbox.module.exports || null, file: fileKey });
        utils.restartServer();
        return;
      }

      if (!data || typeof data !== 'object') return res.status(400).send({ error: 'Invalid JSON payload.' });
      fs.writeFileSync(filePath, `module.exports = ${JSON.stringify(data, null, 2)}\n`, 'utf-8');
      res.send({ success: true, data });
      utils.restartServer();
    } catch (error) {
      res.status(500).send({ error: error.message });
    }
  });

  router.get('/hazira-icon-colors', (req, res) => {
    try {
      const db = global.db;
      db.all(`SELECT status, active_emoji, emojis, bg_color, bg_colors FROM hazira_icon_and_colors ORDER BY id`, [], (err, rows) => {
        if (err) {
          return res.status(500).send({ error: err.message });
        }
        const data = (rows || []).map(row => ({
          status: row.status,
          active_emoji: row.active_emoji,
          emojis: JSON.parse(row.emojis),
          bg_color: row.bg_color,
          bg_colors: JSON.parse(row.bg_colors)
        }));
        res.send({ success: true, data });
      });
    } catch (error) {
      res.status(500).send({ error: error.message });
    }
  });

  router.post('/hazira-icon-colors', (req, res) => {
    try {
      const db = global.db;
      const data = req.body;
      if (!Array.isArray(data)) {
        return res.status(400).send({ error: 'Expected array of hazira icon settings' });
      }
      db.serialize(() => {
        data.forEach(item => {
          db.run(
            `UPDATE hazira_icon_and_colors SET active_emoji = ?, bg_color = ? WHERE status = ?`,
            [item.active_emoji, item.bg_color, item.status],
            (err) => {
              if (err) console.error(`Error updating hazira settings for ${item.status}:`, err.message);
            }
          );
        });
        res.send({ success: true });
      });
    } catch (error) {
      res.status(500).send({ error: error.message });
    }
  });

  return router;
};
