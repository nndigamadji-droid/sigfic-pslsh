const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/roles.controller');
const perm = require('../middleware/permission.middleware');

router.get('/', perm('roles', 'read'), ctrl.list);

module.exports = router;
