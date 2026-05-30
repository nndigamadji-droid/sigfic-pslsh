const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/reception.controller');
const perm = require('../middleware/permission.middleware');
const p = (a) => perm('receptions', a);

router.get('/', p('read'), ctrl.listReceptions);
router.post('/', p('manage'), ctrl.createReception);
router.get('/:id', p('read'), ctrl.showReception);
router.post('/:id/valider', p('manage'), ctrl.validerReception);

router.get('/asf', p('read'), ctrl.listASF);
router.post('/asf', p('manage'), ctrl.createASF);
router.post('/asf/:id/signer', p('manage'), ctrl.signerASF);

module.exports = router;
