/* =========================================================
   ROUTE – /api/settings
   ========================================================= */

const router = require('express').Router();
const db = require('../db');
const requireAuth = require('../middleware/auth');

/* GET /api/settings – Public (needed for site display) */
router.get('/', (req, res) => {
    const rows = db.prepare('SELECT key, value FROM settings').all();
    const settings = {};
    for (const row of rows) settings[row.key] = row.value;
    res.json(settings);
});

/* PUT /api/settings – Admin only */
router.put('/', requireAuth, (req, res) => {
    const updates = req.body;

    if (typeof updates !== 'object' || Array.isArray(updates)) {
        return res.status(400).json({ error: 'Format de données invalide.' });
    }

    const upsert = db.prepare('INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?)');

    const upsertMany = db.transaction((data) => {
        for (const [key, value] of Object.entries(data)) {
            if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') {
                upsert.run(key, String(value));
            }
        }
    });

    upsertMany(updates);

    const rows = db.prepare('SELECT key, value FROM settings').all();
    const settings = {};
    for (const row of rows) settings[row.key] = row.value;

    res.json({ ok: true, settings });
});

module.exports = router;
