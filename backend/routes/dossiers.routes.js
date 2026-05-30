const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/dossiers.controller');
const perm = require('../middleware/permission.middleware');

router.get('/', perm('dossiers', 'read'), ctrl.list);
router.post('/', perm('dossiers', 'create'), ctrl.create);
router.get('/:id', perm('dossiers', 'read'), ctrl.show);
router.put('/:id', perm('dossiers', 'update'), ctrl.update);
router.delete('/:id', perm('dossiers', 'delete'), ctrl.destroy);
router.post('/:id/transition', perm('dossiers', 'workflow'), ctrl.doTransition);
router.get('/:id/workflow', perm('dossiers', 'read'), ctrl.getWorkflowHistory);

module.exports = router;
