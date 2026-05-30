const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { User, Role, Permission } = require('../models');
const authConfig = require('../config/auth');

async function login(email, password) {
  const user = await User.findOne({
    where: { email, is_active: true },
    include: [
      {
        model: Role,
        as: 'roles',
        include: [{ model: Permission, as: 'permissions' }],
      },
    ],
  });

  if (!user) throw new Error('Email ou mot de passe incorrect');

  const valid = await bcrypt.compare(password, user.password_hash);
  if (!valid) throw new Error('Email ou mot de passe incorrect');

  await user.update({ last_login: new Date() });

  const roles = user.roles.map((r) => r.code);
  const permissions = [
    ...new Set(user.roles.flatMap((r) => r.permissions.map((p) => `${p.resource}:${p.action}`))),
  ];

  const token = jwt.sign(
    { id: user.id, email: user.email, roles, permissions },
    authConfig.jwtSecret,
    { expiresIn: authConfig.jwtExpiresIn }
  );

  return {
    token,
    user: {
      id: user.id,
      nom: user.nom,
      prenom: user.prenom,
      email: user.email,
      roles,
      permissions,
    },
  };
}

async function hashPassword(password) {
  return bcrypt.hash(password, authConfig.bcryptRounds);
}

async function verifyToken(token) {
  return jwt.verify(token, authConfig.jwtSecret);
}

module.exports = { login, hashPassword, verifyToken };
