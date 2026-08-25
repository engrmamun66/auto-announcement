const https = require('https');
const http_module = require('http');
const url = require('url');
const fs = require('fs');
const path = require('path');
const axios = require('axios');
const { getSettings } = require('./settings');

const logDir = path.join(__dirname, '../logs');
if (!fs.existsSync(logDir)) fs.mkdirSync(logDir, { recursive: true });

const smsLogFile = path.join(logDir, 'sms-debug.log');
function logSmsDebug(msg) {
  const timestamp = new Date().toISOString();
  fs.appendFileSync(smsLogFile, `[${timestamp}] ${JSON.stringify(msg)}\n`);
}

class ClassSms {
  constructor(db) {
    this.db = db;
  }

  // ── Templates ──────────────────────────────────────────────────────────────

  getTemplates(req, res) {
    this.db.all(`SELECT * FROM sms_templates ORDER BY id ASC`, [], (err, rows) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json(rows || []);
    });
  }

  addTemplate(req, res) {
    const { title, message, type = 'custom' } = req.body;
    if (!title || !message) return res.status(400).json({ error: 'title and message required' });
    this.db.run(
      `INSERT INTO sms_templates (title, message, type) VALUES (?, ?, ?)`,
      [title, message, type],
      function(err) {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ id: this.lastID, title, message, type });
      }
    );
  }

  updateTemplate(req, res) {
    const { id } = req.params;
    const { title, message, type } = req.body;
    this.db.run(
      `UPDATE sms_templates SET title = ?, message = ?, type = ? WHERE id = ?`,
      [title, message, type, id],
      function(err) {
        if (err) return res.status(500).json({ error: err.message });
        if (this.changes === 0) return res.status(404).json({ error: 'not found' });
        res.json({ ok: true });
      }
    );
  }

  deleteTemplate(req, res) {
    const { id } = req.params;
    this.db.run(`DELETE FROM sms_templates WHERE id = ?`, [id], function(err) {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ ok: true });
    });
  }

  // ── Send ───────────────────────────────────────────────────────────────────

  async _sendSmsInternal(numbers, message) {
    if (!numbers || !numbers.length || !message) {
      throw new Error('numbers and message required');
    }

    let smsConfig = {};
    try {
      const allSettings = await getSettings(this.db);
      smsConfig = allSettings?.settings?.sms || {};
    } catch (getSettingsError) {
      smsConfig = global.config?.sms || {};
    }

    if (!smsConfig.enabled) throw new Error('SMS not enabled in config');

    const { api_base_url, api_key, sender_id, provider, user_name, wp_ajax } = smsConfig;
    if (!api_key) throw new Error('api_key not configured');

    const normalizedNumbers = numbers.map(n => {
      let num = String(n).replace(/^\+/, '');
      if (!num.startsWith('88')) num = '88' + num;
      return num;
    });

    if (wp_ajax?.status && wp_ajax?.ajax_url) {
      return await this._dispatchViaWpAjax(wp_ajax.ajax_url, { api_base_url, api_key, sender_id, provider, user_name }, normalizedNumbers, message);
    }

    return await this._dispatch({ api_base_url, api_key, sender_id, provider, user_name }, normalizedNumbers, message);
  }

  async sendSms(req, res) {
    const { numbers, message, test, config } = req.body;

    try {
      let result;
      if (test && config) {
        // Test mode: use provided config instead of stored settings
        result = await this._dispatchWithCustomConfig(config, numbers, message);
      } else {
        // Normal mode: use stored config
        result = await this._sendSmsInternal(numbers, message);
      }
      res.json({ ok: true, result });
    } catch (e) {
      res.status(500).json({ error: e.message });
    }
  }

  async _dispatchWithCustomConfig(config, numbers, message) {
    if (!numbers || !numbers.length || !message) {
      throw new Error('numbers and message required');
    }

    const { api_base_url, api_key, sender_id, provider, user_name, wp_ajax } = config;
    if (!api_key) throw new Error('api_key not configured');

    const normalizedNumbers = numbers.map(n => {
      let num = String(n).replace(/^\+/, '');
      if (!num.startsWith('88')) num = '88' + num;
      return num;
    });

    if (wp_ajax?.status && wp_ajax?.ajax_url) {
      return await this._dispatchViaWpAjax(wp_ajax.ajax_url, { api_base_url, api_key, sender_id, provider, user_name }, normalizedNumbers, message);
    }

    return await this._dispatch({ api_base_url, api_key, sender_id, provider, user_name }, normalizedNumbers, message);
  }

  async checkBalance(req, res) {
    try {
      let smsConfig = {};
      try {
        const allSettings = await getSettings(this.db);
        smsConfig = allSettings?.settings?.sms || {};
        logSmsDebug({ source: 'DB', action: 'checkBalance', smsConfig, settingsKeys: Object.keys(allSettings?.settings || {}) });
      } catch (getSettingsError) {
        smsConfig = global.config?.sms || {};
        logSmsDebug({ source: 'fallback', action: 'checkBalance', error: getSettingsError.message, smsConfig });
      }

      if (!smsConfig.enabled) return res.status(403).json({ error: 'SMS not enabled in config' });

      const { api_base_url, api_key, provider, user_name } = smsConfig;
      if (!api_key) return res.status(400).json({ error: 'api_key not configured' });

      let result;
      if (provider === 'mimsms') {
        result = await this._balanceCheckMimSms({ api_base_url, api_key, user_name });
      } else {
        return res.status(501).json({ error: 'Balance check not supported for this provider' });
      }
      res.json({ ok: true, balance: result });
    } catch (e) {
      res.status(500).json({ error: e.message });
    }
  }

  _dispatchViaWpAjax(ajaxUrl, { api_base_url, api_key, sender_id, provider, user_name }, numbers, message) {
    return new Promise((resolve, reject) => {
      const payload = {
        action: 'cb_send_sms',
        provider,
        api_base_url,
        api_key,
        user_name,
        sender_id,
        numbers: numbers.join(','),
        message,
      };

      axios.post(ajaxUrl, new URLSearchParams(payload), {
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        timeout: 30000
      })
        .then(response => {
          const data = response.data;
          if (data?.success || data?.ok) {
            resolve({ ok: true, response: data });
          } else {
            reject(new Error(data?.error || 'Failed to send SMS via WordPress'));
          }
        })
        .catch(error => {
          reject(new Error(`WordPress AJAX request failed: ${error.message}`));
        });
    });
  }

  _dispatch({ api_base_url, api_key, sender_id, provider, user_name }, numbers, message) {
    if (provider === 'mimsms') {
      return this._dispatchMimSms({ api_base_url, api_key, sender_id, user_name }, numbers, message);
    }
    return this._dispatchSslWireless({ api_base_url, api_key, sender_id }, numbers, message);
  }

  _dispatchMimSms({ api_base_url, api_key, sender_id, user_name }, numbers, message) {
    return new Promise((resolve, reject) => {
      const base = api_base_url || 'https://api.mimsms.com';
      const parsed = url.parse(base);
      const isHttps = parsed.protocol === 'https:';
      const lib = isHttps ? https : http_module;

      const body = JSON.stringify({
        UserName: user_name,
        Apikey: api_key,
        MobileNumber: numbers.join(','),
        SenderName: sender_id,
        TransactionType: 'T',
        Message: message,
      });

      const options = {
        hostname: parsed.hostname,
        port: parsed.port || (isHttps ? 443 : 80),
        path: '/api/SmsSending/OneToMany',
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(body),
          'Authorization': 'bearer',
        },
      };

      const req = lib.request(options, (resp) => {
        let data = '';
        resp.on('data', d => { data += d; });
        resp.on('end', () => {
          try {
            const parsed = JSON.parse(data);
            if (parsed.statusCode && parsed.statusCode !== '200') {
              return reject(new Error(parsed.responseResult || `MiMSMS Error: ${parsed.status}`));
            }
            resolve(parsed);
          } catch (e) {
            resolve(data);
          }
        });
      });
      req.on('error', reject);
      req.write(body);
      req.end();
    });
  }

  _balanceCheckMimSms({ api_base_url, api_key, user_name }) {
    return new Promise((resolve, reject) => {
      const base = api_base_url || 'https://api.mimsms.com';
      const parsed = url.parse(base);
      const isHttps = parsed.protocol === 'https:';
      const lib = isHttps ? https : http_module;

      const body = JSON.stringify({
        UserName: user_name,
        Apikey: api_key,
      });

      const options = {
        hostname: parsed.hostname,
        port: parsed.port || (isHttps ? 443 : 80),
        path: '/api/SmsSending/balanceCheck',
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(body),
          'Authorization': 'bearer',
        },
      };

      const req = lib.request(options, (resp) => {
        let data = '';
        resp.on('data', d => { data += d; });
        resp.on('end', () => {
          try {
            const parsed = JSON.parse(data);
            if (parsed.statusCode && parsed.statusCode !== '200') {
              return reject(new Error(parsed.responseResult || `Balance check failed: ${parsed.status}`));
            }
            resolve(parsed);
          } catch (e) {
            resolve(data);
          }
        });
      });
      req.on('error', reject);
      req.write(body);
      req.end();
    });
  }

  _dispatchSslWireless({ api_base_url, api_key, sender_id }, numbers, message) {
    return new Promise((resolve, reject) => {
      const to = numbers.join(',');
      const parsed = url.parse(api_base_url);
      const isHttps = parsed.protocol === 'https:';
      const lib = isHttps ? https : http_module;

      const body = JSON.stringify({ api_key, msg: message, to, sender_id });
      const options = {
        hostname: parsed.hostname,
        port: parsed.port || (isHttps ? 443 : 80),
        path: parsed.path + '/send-sms',
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(body),
        },
      };

      const req = lib.request(options, (resp) => {
        let data = '';
        resp.on('data', d => { data += d; });
        resp.on('end', () => {
          try { resolve(JSON.parse(data)); } catch { resolve(data); }
        });
      });
      req.on('error', reject);
      req.write(body);
      req.end();
    });
  }
}

module.exports = ClassSms;
