const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/finances.controller');

router.get('/balance-comptes',    ctrl.balanceComptes);
router.get('/balance-budgetaire', ctrl.balanceBudgetaire);
router.get('/compte-resultat',    ctrl.compteResultat);
router.get('/bilan',              ctrl.bilanOhada);
router.get('/kpis',               ctrl.kpisFinanciers);
router.get('/carnet-tresorerie',  ctrl.carnetTresorerie);

module.exports = router;
