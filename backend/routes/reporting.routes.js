const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/reporting.controller');
const perm = require('../middleware/permission.middleware');

router.get('/suivi-budgetaire', perm('reporting', 'read'), ctrl.suiviBudgetaire);
router.get('/execution-financiere', perm('reporting', 'read'), ctrl.executionFinanciere);
router.get('/compte-gestion', perm('reporting', 'read'), ctrl.compteGestion);
router.get('/kpis', perm('reporting', 'read'), ctrl.kpis);

module.exports = router;
