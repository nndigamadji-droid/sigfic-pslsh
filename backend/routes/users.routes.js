const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/users.controller');
const perm = require('../middleware/permission.middleware');

router.get('/', perm('users', 'read'), ctrl.list);
router.post('/', perm('users', 'create'), ctrl.create);
router.get('/:id', perm('users', 'read'), ctrl.show);
router.put('/:id', perm('users', 'update'), ctrl.update);
router.delete('/:id', perm('users', 'delete'), ctrl.destroy);
router.post('/:id/roles', perm('roles', 'manage'), ctrl.assignRole);
router.put('/:id/password', perm('users', 'update'), ctrl.resetPassword);

module.exports = router;
