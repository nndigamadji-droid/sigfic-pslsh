const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/comptabilite.controller');
const perm = require('../middleware/permission.middleware');

router.get('/plan-comptable', perm('comptabilite', 'read'), ctrl.listPlanComptable);
router.get('/journaux', perm('comptabilite', 'read'), ctrl.listJournaux);
router.get('/ecritures', perm('comptabilite', 'read'), ctrl.listEcritures);
router.post('/ecritures', perm('comptabilite', 'saisie'), ctrl.createEcriture);
router.post('/ecritures/from-engagement', perm('comptabilite', 'saisie'), ctrl.fromEngagement);
router.get('/ecritures/by-dossier/:ref', perm('comptabilite', 'read'), ctrl.ecrituresByDossierRef);
router.get('/ecritures/:id', perm('comptabilite', 'read'), ctrl.showEcriture);
router.post('/ecritures/:id/valider', perm('comptabilite', 'valider'), ctrl.validerEcriture);
router.get('/grand-livre', perm('comptabilite', 'read'), ctrl.grandLivre);
router.get('/balance', perm('comptabilite', 'read'), ctrl.balance);

module.exports = router;
