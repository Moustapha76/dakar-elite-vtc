/* =========================================================
   ROUTE – /api/auth
   ========================================================= */

const router = require('express').Router();
const bcrypt = require('bcryptjs');
const db = require('../db');

/* POST /api/auth/login */
router.post('/login', (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).json({ error: 'Identifiants manquants.' });
    }

    const user = db.prepare('SELECT * FROM admin_users WHERE username = ?').get(username);
    if (!user) {
        return res.status(401).json({ error: 'Identifiants invalides.' });
    }

    const valid = bcrypt.compareSync(password, user.password_hash);
    if (!valid) {
        return res.status(401).json({ error: 'Identifiants invalides.' });
    }

    req.session.isAdmin = true;
    req.session.username = user.username;
    req.session.userId = user.id;

    res.json({ ok: true, username: user.username });
});

/* POST /api/auth/logout */
router.post('/logout', (req, res) => {
    req.session.destroy(() => {
        res.json({ ok: true });
    });
});

/* GET /api/auth/status */
router.get('/status', (req, res) => {
    res.json({
        authenticated: !!(req.session && req.session.isAdmin),
        username: req.session?.username || null,
    });
});

/* POST /api/auth/change-password */
router.post('/change-password', (req, res) => {
    if (!req.session || !req.session.isAdmin) {
        return res.status(401).json({ error: 'Non authentifié.' });
    }

    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword || newPassword.length < 6) {
        return res.status(400).json({ error: 'Données invalides. Le nouveau mot de passe doit contenir au moins 6 caractères.' });
    }

    const user = db.prepare('SELECT * FROM admin_users WHERE id = ?').get(req.session.userId);
    if (!bcrypt.compareSync(currentPassword, user.password_hash)) {
        return res.status(400).json({ error: 'Mot de passe actuel incorrect.' });
    }

    const newHash = bcrypt.hashSync(newPassword, 10);
    db.prepare('UPDATE admin_users SET password_hash = ? WHERE id = ?').run(newHash, user.id);
    res.json({ ok: true, message: 'Mot de passe modifié avec succès.' });
});

module.exports = router;
