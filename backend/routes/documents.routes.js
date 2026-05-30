const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/documents.controller');
const perm = require('../middleware/permission.middleware');
const upload = require('../middleware/upload.middleware');

router.get('/types', perm('documents', 'read'), ctrl.listTypes);
router.get('/', perm('documents', 'read'), ctrl.list);
router.post('/', perm('documents', 'upload'), upload.single('file'), ctrl.upload);
router.get('/:id/download', perm('documents', 'read'), ctrl.download);
router.delete('/:id', perm('documents', 'delete'), ctrl.destroy);

module.exports = router;
