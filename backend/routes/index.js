const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth.middleware');

router.use('/auth', require('./auth.routes'));
router.use('/dashboard', auth, require('./dashboard.routes'));
router.use('/users', auth, require('./users.routes'));
router.use('/roles', auth, require('./roles.routes'));
router.use('/exercices', auth, require('./exercices.routes'));
router.use('/budget', auth, require('./budget.routes'));
router.use('/mapping', auth, require('./mapping.routes'));
router.use('/finances', auth, require('./finances.routes'));
router.use('/fournisseurs', auth, require('./fournisseurs.routes'));
router.use('/beneficiaires', auth, require('./beneficiaires.routes'));
router.use('/dossiers', auth, require('./dossiers.routes'));
router.use('/passation', auth, require('./passation.routes'));
router.use('/commandes', auth, require('./commandes.routes'));
router.use('/receptions', auth, require('./receptions.routes'));
router.use('/stock', auth, require('./stock.routes'));
router.use('/comptabilite', auth, require('./comptabilite.routes'));
router.use('/paiement', auth, require('./paiement.routes'));
router.use('/controle', auth, require('./controle.routes'));
router.use('/documents', auth, require('./documents.routes'));
router.use('/reporting', auth, require('./reporting.routes'));
router.use('/audit-logs', auth, require('./audit.routes'));

module.exports = router;
