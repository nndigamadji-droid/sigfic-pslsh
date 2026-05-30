const express = require('express');
const router = express.Router();
const { AuditLog, User } = require('../models');
const perm = require('../middleware/permission.middleware');
const { Op } = require('sequelize');

router.get('/', perm('audit', 'read'), async (req, res, next) => {
  try {
    const where = {};
    if (req.query.user_id) where.user_id = req.query.user_id;
    if (req.query.resource) where.resource = req.query.resource;
    if (req.query.date_debut && req.query.date_fin) {
      where.createdAt = {
        [Op.between]: [new Date(req.query.date_debut), new Date(req.query.date_fin)],
      };
    }
    const data = await AuditLog.findAll({
      where,
      include: [{ model: User, as: 'user', attributes: ['id', 'nom', 'prenom', 'email'] }],
      order: [['createdAt', 'DESC']],
      limit: parseInt(req.query.limit) || 200,
    });
    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
