/* =========================================================
   DAKAR ELITE VTC – Database (SQLite)
   ========================================================= */

const Database = require('better-sqlite3');
const bcrypt = require('bcryptjs');
const path = require('path');

const DB_PATH = path.join(__dirname, '..', 'database.sqlite');
const db = new Database(DB_PATH);

// Enable WAL mode for better performance
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

/* ─── CREATE TABLES ─── */
db.exec(`
  CREATE TABLE IF NOT EXISTS bookings (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    first_name  TEXT NOT NULL,
    last_name   TEXT NOT NULL,
    email       TEXT NOT NULL,
    phone       TEXT NOT NULL,
    service     TEXT NOT NULL,
    pickup_date TEXT NOT NULL,
    pickup_time TEXT NOT NULL,
    pickup_loc  TEXT NOT NULL,
    dropoff_loc TEXT NOT NULL,
    passengers  INTEGER DEFAULT 1,
    vehicle     TEXT DEFAULT 'Hyundai Premium',
    notes       TEXT DEFAULT '',
    status      TEXT DEFAULT 'pending',
    created_at  TEXT DEFAULT (datetime('now', 'localtime'))
  );

  CREATE TABLE IF NOT EXISTS settings (
    key   TEXT PRIMARY KEY,
    value TEXT
  );

  CREATE TABLE IF NOT EXISTS admin_users (
    id            INTEGER PRIMARY KEY AUTOINCREMENT,
    username      TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    created_at    TEXT DEFAULT (datetime('now', 'localtime'))
  );
`);

/* ─── DEFAULT SETTINGS ─── */
const defaultSettings = {
    driver_name: 'Moustapha',
    company_name: 'Dakar Elite VTC',
    phone: '+221 78 789 70 43',
    email: 'contact@dakarelitevtc.sn',
    service_zone: 'Dakar & Grand Dakar, Sénégal',
    whatsapp_link: 'https://wa.me/221787897043',
    facebook_link: '',
    instagram_link: '',
    linkedin_link: '',
    vehicle_name: 'Hyundai Premium – Berline Executive',
    vehicle_capacity: '3',
    confirm_delay: '15',
    clients_count: '300',
    experience_years: '5',
    pref_whatsapp_btn: 'true',
    pref_available: 'true',
    pref_email_notif: 'true',
    pref_corp_quotes: 'true',
};

const insertSetting = db.prepare('INSERT OR IGNORE INTO settings (key, value) VALUES (?, ?)');
for (const [key, value] of Object.entries(defaultSettings)) {
    insertSetting.run(key, value);
}

/* ─── DEFAULT ADMIN USER ─── */
const existingAdmin = db.prepare('SELECT id FROM admin_users WHERE username = ?').get('admin');
if (!existingAdmin) {
    const hash = bcrypt.hashSync(process.env.ADMIN_PASSWORD || 'admin123', 10);
    db.prepare('INSERT INTO admin_users (username, password_hash) VALUES (?, ?)').run('admin', hash);
    console.log('✅ Admin user created: admin / admin123');
}

/* ─── SEED DEMO BOOKINGS ─── */
const bookingCount = db.prepare('SELECT COUNT(*) as cnt FROM bookings').get();
if (bookingCount.cnt === 0) {
    const demoBookings = [
        ['Jean-Marc', 'Fontaine', 'jmf@bollore.com', '+33 6 12 34 56 78', 'airport', '2026-03-18', '08:30', 'Aéroport Blaise Diagne', 'Radisson Blu Dakar', 1, 'Hyundai Premium', '', 'pending'],
        ['Sarah', 'Johnson', 'sarah@blog.co.uk', '+44 7700 900123', 'tourism', '2026-03-19', '09:00', 'Hôtel Teranga, Dakar', 'Île de Gorée', 2, 'Hyundai Premium', '', 'confirmed'],
        ['Fatou', 'Diallo', 'f.diallo@orange.sn', '+221 77 456 78 90', 'business', '2026-03-20', '14:00', 'Siège Orange Sénégal', 'Hôtel King Fahd', 1, 'Hyundai Premium', '', 'pending'],
        ['Amadou', 'Sall', 'a.sall@radisson.sn', '+221 78 234 56 78', 'disposal', '2026-03-21', '10:00', 'Radisson Blu Dakar', 'Divers Dakar', 3, 'Hyundai Premium', '', 'confirmed'],
        ['Pierre', 'Marchand', 'pierrem@corp.fr', '+33 6 98 76 54 32', 'longdist', '2026-03-15', '06:00', 'Dakar Centre', 'Saint-Louis', 2, 'Hyundai Premium', 'Vol de nuit, arrivée à 5h30', 'done'],
        ['Aïssatou', 'Ndiaye', 'aissatou@gmail.com', '+221 76 111 22 33', 'airport', '2026-03-14', '22:45', 'Appartement Almadies', 'Aéroport Blaise Diagne', 1, 'Hyundai Premium', '', 'done'],
        ['Robert', 'Klein', 'rklein@firm.de', '+49 151 23456789', 'business', '2026-03-10', '11:00', 'Hôtel Pullman Teranga', 'Zone Franche Dakar', 1, 'Hyundai Premium', '', 'pending'],
    ];

    const ins = db.prepare(`
    INSERT INTO bookings (first_name, last_name, email, phone, service, pickup_date, pickup_time, pickup_loc, dropoff_loc, passengers, vehicle, notes, status)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);
    for (const b of demoBookings) ins.run(...b);
    console.log('✅ Demo bookings seeded.');
}

module.exports = db;
