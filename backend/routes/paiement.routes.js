const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/paiement.controller');
const perm = require('../middleware/permission.middleware');

router.get('/factures', perm('paiement', 'read'), ctrl.listFactures);
router.post('/factures', perm('paiement', 'liquider'), ctrl.createFacture);
router.get('/factures/:id', perm('paiement', 'read'), ctrl.showFacture);
router.post('/factures/:id/verifier', perm('paiement', 'liquider'), ctrl.verifierFacture);

router.get('/liquidations', perm('paiement', 'read'), ctrl.listLiquidations);
router.post('/liquidations', perm('paiement', 'liquider'), ctrl.createLiquidation);

router.get('/ordres', perm('paiement', 'read'), ctrl.listOP);
router.post('/ordres', perm('paiement', 'ordonnancer'), ctrl.createOP);
router.get('/ordres/:id', perm('paiement', 'read'), ctrl.showOP);
router.post('/ordres/:id/signer', perm('paiement', 'ordonnancer'), ctrl.signerOP);

router.get('/paiements', perm('paiement', 'read'), ctrl.listPaiements);
router.post('/paiements', perm('paiement', 'payer'), ctrl.createPaiement);

module.exports = router;
