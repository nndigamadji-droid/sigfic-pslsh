const express = require('express');
const rateLimit = require('express-rate-limit');
const router = express.Router();
const ctrl = require('../controllers/auth.controller');
const auth = require('../middleware/auth.middleware');

// Anti brute-force : 5 tentatives par IP toutes les 15 min sur /login
// skipSuccessfulRequests : un login valide ne décompte pas du quota
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: {
    success: false,
    message: 'Trop de tentatives de connexion. Réessayez dans 15 minutes.',
  },
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: true,
});

router.post('/login', loginLimiter, ctrl.login);
router.get('/me', auth, ctrl.me);
router.put('/change-password', auth, ctrl.changePassword);

module.exports = router;
