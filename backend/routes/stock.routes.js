const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/stock.controller');
const perm = require('../middleware/permission.middleware');

router.get('/articles', perm('stock', 'read'), ctrl.listArticles);
router.post('/articles', perm('stock', 'manage'), ctrl.createArticle);
router.get('/articles/:id', perm('stock', 'read'), ctrl.showArticle);
router.get('/mouvements', perm('stock', 'read'), ctrl.listMouvements);
router.post('/mouvements', perm('stock', 'manage'), ctrl.createMouvement);
router.get('/immobilisations', perm('immobilisations', 'read'), ctrl.listImmobilisations);
router.post('/immobilisations', perm('immobilisations', 'manage'), ctrl.createImmobilisation);
router.get('/immobilisations/:id', perm('immobilisations', 'read'), ctrl.showImmobilisation);

module.exports = router;
