const express = require('express');
const fs = require('fs');
const path = require('path');
const { getSettings, updateSetting, resetAllSettings } = require('../settings');
const { fillMissingKeys } = require('../fillGapConfig');

module.exports = (db) => {
    const router = express.Router();

    router.get('/settings', async (req, res) => {
        try {
            const data = await getSettings(db);
            const order = Object.keys(global.config || {}).filter(k => k !== 'env');
            const ordered = {};
            order.forEach(k => { if (k in data) ordered[k] = data[k]; });
            Object.keys(data).forEach(k => { if (!(k in ordered)) ordered[k] = data[k]; });
            res.json(ordered);
        } catch(e) {
            res.status(500).json({ error: e.message });
        }
    });

    router.post('/settings/reset', async (req, res) => {
        try {
            await resetAllSettings(db);
            let cfg = require('./../../config.example');
            const configPath = path.join(__dirname, './../../config.js');
            if (fs.existsSync(configPath)) {
                const userCfg = require(configPath);
                cfg = fillMissingKeys(cfg, userCfg);
            }
            const DB_KEYS = Object.keys(cfg).filter(k => k !== 'env');
            DB_KEYS.forEach(k => { if (global.config) global.config[k] = cfg[k]; });
            res.json({ success: true });
        } catch(e) {
            res.status(500).json({ error: e.message });
        }
    });

    router.post('/settings/:key', async (req, res) => {
        try {
            const key = req.params.key;
            const value = req.body.value;
            await updateSetting(db, key, value);
            if (global.config) global.config[key] = value;
            res.json({ success: true });
        } catch(e) {
            res.status(500).json({ error: e.message });
        }
    });

    return router;
};
