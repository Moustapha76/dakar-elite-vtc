/* =========================================================
   ROUTE – /api/bookings
   ========================================================= */

const router = require('express').Router();
const db = require('../db');
const requireAuth = require('../middleware/auth');
const { sendBookingNotification } = require('../mailer');

const SERVICE_LABELS = {
    airport: 'Transfert Aéroport',
    business: "Voyage d'Affaires",
    tourism: 'Tour Touristique',
    concierge: 'Service Conciergerie',
    disposal: 'Mise à Disposition',
    longdist: 'Longue Distance',
};

/* ── Public: POST /api/bookings ── */
/* Receives the booking form from the public site */
router.post('/', async (req, res) => {
    const {
        firstName, lastName, email, phone,
        serviceType, pickupDate, pickupTime,
        pickupLocation, dropoffLocation,
        passengers = 1, vehicleType = 'Hyundai Premium', notes = '',
    } = req.body;

    if (!firstName || !lastName || !email || !phone || !serviceType || !pickupDate || !pickupTime || !pickupLocation || !dropoffLocation) {
        return res.status(400).json({ error: 'Tous les champs obligatoires doivent être remplis.' });
    }

    const stmt = db.prepare(`
    INSERT INTO bookings (first_name, last_name, email, phone, service, pickup_date, pickup_time, pickup_loc, dropoff_loc, passengers, vehicle, notes, status)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending')
  `);

    const result = stmt.run(
        firstName.trim(), lastName.trim(), email.trim(), phone.trim(),
        serviceType, pickupDate, pickupTime,
        pickupLocation.trim(), dropoffLocation.trim(),
        parseInt(passengers), vehicleType.trim(), notes.trim()
    );

    const newBooking = db.prepare('SELECT * FROM bookings WHERE id = ?').get(result.lastInsertRowid);

    // Send email notification (non-blocking)
    sendBookingNotification(newBooking, SERVICE_LABELS[serviceType] || serviceType).catch(err => {
        console.warn('Email notification failed:', err.message);
    });

    res.status(201).json({ ok: true, booking: newBooking });
});

/* ── Admin: GET /api/bookings ── */
router.get('/', requireAuth, (req, res) => {
    const { status, search } = req.query;

    let query = 'SELECT * FROM bookings';
    const params = [];
    const conditions = [];

    if (status && status !== 'all') {
        conditions.push('status = ?');
        params.push(status);
    }

    if (search) {
        conditions.push('(first_name LIKE ? OR last_name LIKE ? OR email LIKE ? OR phone LIKE ? OR service LIKE ?)');
        const s = `%${search}%`;
        params.push(s, s, s, s, s);
    }

    if (conditions.length) query += ' WHERE ' + conditions.join(' AND ');
    query += ' ORDER BY id DESC';

    const bookings = db.prepare(query).all(...params);

    // Inject human-readable service label
    const enriched = bookings.map(b => ({
        ...b,
        service_label: SERVICE_LABELS[b.service] || b.service,
    }));

    res.json(enriched);
});

/* ── Admin: GET /api/bookings/stats ── */
router.get('/stats', requireAuth, (req, res) => {
    const total = db.prepare("SELECT COUNT(*) as n FROM bookings").get().n;
    const pending = db.prepare("SELECT COUNT(*) as n FROM bookings WHERE status = 'pending'").get().n;
    const confirmed = db.prepare("SELECT COUNT(*) as n FROM bookings WHERE status = 'confirmed'").get().n;
    const done = db.prepare("SELECT COUNT(*) as n FROM bookings WHERE status = 'done'").get().n;
    const cancelled = db.prepare("SELECT COUNT(*) as n FROM bookings WHERE status = 'cancelled'").get().n;

    // Service breakdown
    const byService = db.prepare(`
    SELECT service, COUNT(*) as n FROM bookings GROUP BY service ORDER BY n DESC
  `).all();

    // Recent activity (last 5 bookings)
    const recent = db.prepare(`
    SELECT id, first_name, last_name, service, status, created_at FROM bookings ORDER BY id DESC LIMIT 5
  `).all();

    res.json({ total, pending, confirmed, done, cancelled, byService, recent });
});

/* ── Admin: GET /api/bookings/:id ── */
router.get('/:id', requireAuth, (req, res) => {
    const booking = db.prepare('SELECT * FROM bookings WHERE id = ?').get(req.params.id);
    if (!booking) return res.status(404).json({ error: 'Réservation introuvable.' });

    res.json({ ...booking, service_label: SERVICE_LABELS[booking.service] || booking.service });
});

/* ── Admin: PATCH /api/bookings/:id ── */
router.patch('/:id', requireAuth, (req, res) => {
    const { status } = req.body;
    const allowed = ['pending', 'confirmed', 'done', 'cancelled'];

    if (!allowed.includes(status)) {
        return res.status(400).json({ error: 'Statut invalide.' });
    }

    const booking = db.prepare('SELECT id FROM bookings WHERE id = ?').get(req.params.id);
    if (!booking) return res.status(404).json({ error: 'Réservation introuvable.' });

    db.prepare('UPDATE bookings SET status = ? WHERE id = ?').run(status, req.params.id);
    const updated = db.prepare('SELECT * FROM bookings WHERE id = ?').get(req.params.id);
    res.json(updated);
});

/* ── Admin: DELETE /api/bookings/:id ── */
router.delete('/:id', requireAuth, (req, res) => {
    const booking = db.prepare('SELECT id FROM bookings WHERE id = ?').get(req.params.id);
    if (!booking) return res.status(404).json({ error: 'Réservation introuvable.' });

    db.prepare('DELETE FROM bookings WHERE id = ?').run(req.params.id);
    res.json({ ok: true });
});

module.exports = router;
