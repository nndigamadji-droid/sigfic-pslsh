const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/notifications.controller');

router.get('/',                       ctrl.list);
router.get('/count',                  ctrl.count);
router.post('/',                      ctrl.create);
router.post('/mark-all-read',         ctrl.markAllRead);
router.post('/generate-reminders',    ctrl.generateReminders);
router.post('/:id/read',              ctrl.markRead);
router.post('/:id/done',              ctrl.markDone);
router.post('/:id/snooze',            ctrl.snooze);
router.post('/:id/dismiss',           ctrl.dismiss);

module.exports = router;
