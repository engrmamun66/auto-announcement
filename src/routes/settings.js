const express = require('express');
const { getSettings, updateSetting, resetAllSettings } = require('../settings');

module.exports = (db) => {
    const router = express.Router();

    router.get('/settings', async (req, res) => {
        try {
            res.json(await getSettings(db));
        } catch(e) {
            res.status(500).json({ error: e.message });
        }
    });

    router.post('/settings/reset', async (req, res) => {
        try {
            await resetAllSettings(db);
            const DB_KEYS = ['settings','classes','logo','css_vars','date_range_list','studentTableColumns','card_owners','card_not_set_message'];
            const cfg = require('./../../config.example');
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
