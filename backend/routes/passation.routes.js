const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/passation.controller');
const perm = require('../middleware/permission.middleware');
const p = (a) => perm('passation', a);

// ─── Expressions de besoin ────────────────────────────────────────────────────

// CRUD
router.get('/besoins', p('read'), ctrl.listBesoins);
router.post('/besoins', p('manage'), ctrl.createBesoin);
router.get('/besoins/:id', p('read'), ctrl.showBesoin);
router.put('/besoins/:id', p('manage'), ctrl.updateBesoin);

// Workflow Validation 1 — expression de besoin
router.post('/besoins/:id/soumettre', p('manage'), ctrl.soumettreBesoin); // demandeur
router.post('/besoins/:id/valider', p('manage'), ctrl.validerBesoin); // centre de validation
router.post('/besoins/:id/rejeter', p('manage'), ctrl.rejeterBesoin); // centre de validation
router.post('/besoins/:id/a-revoir', p('manage'), ctrl.aRevoirBesoin); // centre de validation

// Déclenchement — génération automatique du dossier
router.post('/besoins/:id/declencher', p('manage'), ctrl.declencherBesoin);

// ─── Validation 2 — administrative et financière (SAF / coordination) ─────────

router.post('/dossiers/:id/valider-af', p('manage'), ctrl.validerAF); // autorise
router.post('/dossiers/:id/rejeter-af', p('manage'), ctrl.rejeterAF); // rejete (V2)
router.post('/dossiers/:id/a-revoir-af', p('manage'), ctrl.aRevoirAF); // renvoie au demandeur

// ─── Demandes de cotation ─────────────────────────────────────────────────────

router.get('/demandes-cotation', p('read'), ctrl.listDC);
router.post('/demandes-cotation', p('manage'), ctrl.createDC);
router.get('/demandes-cotation/:id', p('read'), ctrl.showDC);
router.put('/demandes-cotation/:id', p('manage'), ctrl.updateDC);

// ─── Offres / pro forma ───────────────────────────────────────────────────────

router.get('/offres', p('read'), ctrl.listOffres);
router.post('/offres', p('manage'), ctrl.createOffre);
router.post('/offres/:id/retenir', p('manage'), ctrl.retenirOffre); // Validation 3

// ─── Imputation budgétaire ────────────────────────────────────────────────────

router.post('/dossiers/:id/imputer', p('manage'), ctrl.imputerBudget); // Validation 4

// ─── Analyses comparatives ────────────────────────────────────────────────────

router.post('/analyses', p('manage'), ctrl.createAnalyse);
router.get('/analyses/:id', p('read'), ctrl.showAnalyse);

// ─── Attributions ─────────────────────────────────────────────────────────────

router.get('/attributions', p('read'), ctrl.listAttributions);
router.post('/attributions', p('manage'), ctrl.createAttribution);

module.exports = router;
