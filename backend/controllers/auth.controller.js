const authService = require('../services/auth.service');
const auditService = require('../services/audit.service');

async function login(req, res, next) {
  try {
    const { email, password } = req.body;
    if (!email || !password)
      return res.status(400).json({ success: false, message: 'Email et mot de passe requis' });

    const result = await authService.login(email, password);
    await auditService.log(result.user.id, 'auth:login', 'user', result.user.id, { ip: req.ip });

    return res.json({ success: true, data: result });
  } catch (err) {
    return res.status(401).json({ success: false, message: err.message });
  }
}

async function me(req, res) {
  return res.json({ success: true, data: req.user });
}

async function changePassword(req, res, next) {
  try {
    const { old_password, new_password } = req.body;
    const { User } = require('../models');
    const bcrypt = require('bcryptjs');
    const authConfig = require('../config/auth');

    const user = await User.findByPk(req.user.id);
    const valid = await bcrypt.compare(old_password, user.password_hash);
    if (!valid)
      return res.status(400).json({ success: false, message: 'Ancien mot de passe incorrect' });

    const hash = await bcrypt.hash(new_password, authConfig.bcryptRounds);
    await user.update({ password_hash: hash });

    await auditService.log(req.user.id, 'auth:change_password', 'user', req.user.id, {});
    return res.json({ success: true, message: 'Mot de passe modifié avec succès' });
  } catch (err) {
    next(err);
  }
}

module.exports = { login, me, changePassword };
