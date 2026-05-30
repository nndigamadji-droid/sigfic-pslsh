const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/fournisseurs.controller');
const perm = require('../middleware/permission.middleware');

router.get('/', perm('fournisseurs', 'read'), ctrl.list);
router.post('/', perm('fournisseurs', 'manage'), ctrl.create);
router.get('/:id', perm('fournisseurs', 'read'), ctrl.show);
router.put('/:id', perm('fournisseurs', 'manage'), ctrl.update);

module.exports = router;
