const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/budget.controller');
const perm = require('../middleware/permission.middleware');

// Sources de financement
router.get('/sources', perm('budget', 'read'), ctrl.listSources);
router.post('/sources', perm('budget', 'manage'), ctrl.createSource);
router.get('/sources/:id', perm('budget', 'read'), ctrl.showSource);
router.put('/sources/:id', perm('budget', 'manage'), ctrl.updateSource);

// Rubriques
router.get('/rubriques', perm('budget', 'read'), ctrl.listRubriques);
router.post('/rubriques', perm('budget', 'manage'), ctrl.createRubrique);

// Lignes budgétaires
router.get('/lignes', perm('budget', 'read'), ctrl.listLignes);
router.post('/lignes', perm('budget', 'manage'), ctrl.createLigne);
router.get('/lignes/:id', perm('budget', 'read'), ctrl.showLigne);
router.put('/lignes/:id', perm('budget', 'manage'), ctrl.updateLigne);
router.get('/lignes/:id/disponibilite', perm('budget', 'read'), ctrl.checkDisponibilite);
router.post('/lignes/:id/amender', perm('budget', 'amender'), ctrl.amender);

// Suivi global
router.get('/suivi', perm('budget', 'read'), ctrl.suiviBudgetaire);

module.exports = router;
