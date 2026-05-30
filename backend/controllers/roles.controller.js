const { Role, Permission } = require('../models');

async function list(req, res, next) {
  try {
    const roles = await Role.findAll({
      include: [{ model: Permission, as: 'permissions', attributes: ['id', 'resource', 'action'] }],
      order: [['nom', 'ASC']],
    });
    res.json({ success: true, data: roles });
  } catch (err) {
    next(err);
  }
}

module.exports = { list };
