/* =========================================================
   DAKAR ELITE VTC – Express Server (Entry Point)
   ========================================================= */

require('dotenv').config();

const express = require('express');
const session = require('express-session');
const cors = require('cors');
const path = require('path');

// Import DB (initializes tables + seed data on first run)
require('./db');

// Routes
const authRoutes = require('./routes/auth');
const bookingRoutes = require('./routes/bookings');
const settingsRoutes = require('./routes/settings');

const app = express();
const PORT = process.env.PORT || 3000;

/* ─── MIDDLEWARE ─── */
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(cors({
    origin: true,
    credentials: true,
}));

app.use(session({
    secret: process.env.SESSION_SECRET || 'dakar_elite_vtc_secret',
    resave: false,
    saveUninitialized: false,
    cookie: {
        secure: false,    // set to true when using HTTPS
        httpOnly: true,
        maxAge: 24 * 60 * 60 * 1000, // 24 hours
    },
}));

/* ─── API ROUTES ─── */
app.use('/api/auth', authRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/settings', settingsRoutes);

/* ─── SERVE STATIC FILES ─── */
// Serve the main website from root
app.use(express.static(path.join(__dirname, '..')));

// SPA-like fallback for HTML files
app.get('/admin', (req, res) => {
    res.redirect('/admin/login.html');
});

/* ─── HEALTH CHECK ─── */
app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

/* ─── 404 HANDLER ─── */
app.use((req, res) => {
    if (req.path.startsWith('/api/')) {
        return res.status(404).json({ error: 'Endpoint introuvable.' });
    }
    res.status(404).sendFile(path.join(__dirname, '..', 'index.html'));
});

/* ─── ERROR HANDLER ─── */
app.use((err, req, res, next) => {
    console.error('Server error:', err);
    res.status(500).json({ error: 'Erreur interne du serveur.' });
});

/* ─── START ─── */
app.listen(PORT, () => {
    console.log('');
    console.log('  ✦ ─────────────────────────────────── ✦');
    console.log(`  ◆  DAKAR ELITE VTC – Serveur Démarré`);
    console.log(`  🌐  http://localhost:${PORT}`);
    console.log(`  🔑  Admin: http://localhost:${PORT}/admin/login.html`);
    console.log('  ✦ ─────────────────────────────────── ✦');
    console.log('');
});

module.exports = app;
