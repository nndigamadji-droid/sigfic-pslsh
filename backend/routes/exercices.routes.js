const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/exercices.controller');
const perm = require('../middleware/permission.middleware');

router.get('/', perm('exercices', 'read'), ctrl.list);
router.post('/', perm('exercices', 'manage'), ctrl.create);
router.get('/:id', perm('exercices', 'read'), ctrl.show);
router.put('/:id', perm('exercices', 'manage'), ctrl.update);
router.post('/:id/clore', perm('exercices', 'manage'), ctrl.clore);

module.exports = router;
