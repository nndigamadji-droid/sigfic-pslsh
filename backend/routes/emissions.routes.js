const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/emissions.controller');
const perm = require('../middleware/permission.middleware');

// Avis comptables — réservé comptable_principal
router.get('/avis',         ctrl.listAvis);
router.post('/avis',        perm('avis_comptable', 'emit'), ctrl.emitAvis);

// Ordres de virement
router.get('/ov',           ctrl.listOv);
router.post('/ov',          perm('ov', 'emit'),               ctrl.emitOv);
router.post('/ov/:id/ordonnance', perm('ordonnancement','sign'), ctrl.signOrdonnance);
router.post('/ov/:id/execute',    perm('ov','emit'),             ctrl.executeOv);

// Bordereaux de paie
router.get('/paie',         ctrl.listPaie);
router.post('/paie',        perm('bordereau_paie', 'emit'),  ctrl.emitPaie);

// Décharges
router.get('/decharge',     ctrl.listDecharge);
router.post('/decharge',    perm('decharge', 'emit'),         ctrl.emitDecharge);

module.exports = router;
