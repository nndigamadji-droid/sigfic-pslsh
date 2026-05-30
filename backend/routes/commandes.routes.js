const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/commandes.controller');
const perm = require('../middleware/permission.middleware');

router.get('/bons-commande', perm('commandes', 'read'), ctrl.listBC);
router.post('/bons-commande', perm('commandes', 'manage'), ctrl.createBC);
router.get('/bons-commande/:id', perm('commandes', 'read'), ctrl.showBC);
router.put('/bons-commande/:id', perm('commandes', 'manage'), ctrl.updateBC);

router.get('/contrats', perm('contrats', 'read'), ctrl.listContrats);
router.post('/contrats', perm('contrats', 'manage'), ctrl.createContrat);
router.get('/contrats/:id', perm('contrats', 'read'), ctrl.showContrat);
router.put('/contrats/:id', perm('contrats', 'manage'), ctrl.updateContrat);

module.exports = router;
