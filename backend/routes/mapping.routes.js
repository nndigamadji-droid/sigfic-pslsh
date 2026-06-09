const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/mapping.controller');

router.get('/',            ctrl.list);
router.get('/code/:code',  ctrl.findByCode);
router.post('/',           ctrl.create);
router.post('/bulk',       ctrl.bulkSeed);
router.put('/:id',         ctrl.update);
router.delete('/:id',      ctrl.remove);

module.exports = router;
