const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/controle.controller');
const perm = require('../middleware/permission.middleware');

router.get('/controles', perm('controle', 'read'), ctrl.listControles);
router.post('/controles', perm('controle', 'manage'), ctrl.createControle);
router.put('/controles/:id', perm('controle', 'manage'), ctrl.updateControle);

router.get('/anomalies', perm('controle', 'read'), ctrl.listAnomalies);
router.put('/anomalies/:id', perm('controle', 'manage'), ctrl.updateAnomalie);

router.get('/audits', perm('audit', 'read'), ctrl.listAudits);
router.post('/audits', perm('audit', 'manage'), ctrl.createAudit);
router.get('/audits/:id', perm('audit', 'read'), ctrl.showAudit);

router.get('/recommandations', perm('controle', 'read'), ctrl.listRecommandations);
router.post('/recommandations', perm('controle', 'manage'), ctrl.createRecommandation);
router.put('/recommandations/:id', perm('controle', 'manage'), ctrl.updateRecommandation);

module.exports = router;
