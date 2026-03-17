/* =========================================================
   AUTH MIDDLEWARE – Protège les routes Admin
   ========================================================= */

module.exports = function requireAuth(req, res, next) {
    if (req.session && req.session.isAdmin) {
        return next();
    }
    res.status(401).json({ error: 'Non authentifié. Veuillez vous connecter.' });
};
