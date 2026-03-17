/* =========================================================
   DAKAR ELITE VTC – Email Notifier (Nodemailer)
   ========================================================= */

const nodemailer = require('nodemailer');

/**
 * Send an email notification when a new booking is created.
 * Requires EMAIL_HOST, EMAIL_PORT, EMAIL_USER, EMAIL_PASS, EMAIL_TO to be set in .env
 * If not configured, this function silently skips sending.
 */
async function sendBookingNotification(booking, serviceLabel) {
    // Skip if email is not configured
    if (!process.env.EMAIL_HOST || !process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
        console.log('📧 Email non configuré – notification ignorée.');
        return;
    }

    const transporter = nodemailer.createTransport({
        host: process.env.EMAIL_HOST,
        port: parseInt(process.env.EMAIL_PORT || '587'),
        secure: process.env.EMAIL_PORT === '465',
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS,
        },
    });

    const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #0a0a0a; color: #f5f5f5; border-radius: 12px; overflow: hidden;">
      <div style="background: linear-gradient(135deg, #C9A227, #9a7a18); padding: 24px;">
        <h1 style="margin: 0; color: #0a0a0a; font-size: 1.4rem;">◆ Dakar Elite VTC</h1>
        <p style="margin: 4px 0 0; color: rgba(0,0,0,0.7);">Nouvelle demande de réservation</p>
      </div>
      <div style="padding: 24px;">
        <table style="width:100%; border-collapse: collapse;">
          <tr><td style="padding:8px 0; color:#999; width:40%">Client</td><td style="color:#fff; font-weight:600">${booking.first_name} ${booking.last_name}</td></tr>
          <tr><td style="padding:8px 0; color:#999;">Email</td><td style="color:#fff;">${booking.email}</td></tr>
          <tr><td style="padding:8px 0; color:#999;">Téléphone</td><td style="color:#fff;">${booking.phone}</td></tr>
          <tr><td style="padding:8px 0; color:#999;">Service</td><td style="color:#C9A227; font-weight:600">${serviceLabel}</td></tr>
          <tr><td style="padding:8px 0; color:#999;">Date</td><td style="color:#fff;">${booking.pickup_date} à ${booking.pickup_time}</td></tr>
          <tr><td style="padding:8px 0; color:#999;">Départ</td><td style="color:#fff;">${booking.pickup_loc}</td></tr>
          <tr><td style="padding:8px 0; color:#999;">Destination</td><td style="color:#fff;">${booking.dropoff_loc}</td></tr>
          <tr><td style="padding:8px 0; color:#999;">Passagers</td><td style="color:#fff;">${booking.passengers}</td></tr>
          ${booking.notes ? `<tr><td style="padding:8px 0; color:#999;">Notes</td><td style="color:#fff;">${booking.notes}</td></tr>` : ''}
        </table>
        <div style="margin-top: 24px; padding: 16px; background: rgba(201,162,39,0.1); border: 1px solid rgba(201,162,39,0.3); border-radius: 8px;">
          <p style="margin: 0; color: #C9A227; font-weight: 600;">⏰ Confirmez sous 15 minutes !</p>
          <p style="margin: 8px 0 0; color: #999; font-size: 0.9rem;">Le client attend votre confirmation.</p>
        </div>
      </div>
    </div>
  `;

    await transporter.sendMail({
        from: `"Dakar Elite VTC" <${process.env.EMAIL_USER}>`,
        to: process.env.EMAIL_TO || process.env.EMAIL_USER,
        subject: `🚗 Nouvelle réservation — ${booking.first_name} ${booking.last_name}`,
        html,
    });

    console.log(`📧 Email envoyé pour la réservation #${booking.id}`);
}

module.exports = { sendBookingNotification };
