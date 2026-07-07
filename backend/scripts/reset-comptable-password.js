const bcrypt = require('bcryptjs');
const { sequelize, User } = require('../models');

(async () => {
  if (process.env.ALLOW_PASSWORD_RESET_SCRIPT !== 'true') {
    throw new Error('ALLOW_PASSWORD_RESET_SCRIPT=true est requis pour executer ce script.');
  }

  const email = String(process.env.RESET_USER_EMAIL || '').trim().toLowerCase();
  const password = process.env.RESET_USER_PASSWORD || '';

  if (!email || !password) {
    throw new Error('RESET_USER_EMAIL et RESET_USER_PASSWORD sont requis.');
  }

  const u = await User.findOne({ where: { email } });
  if (!u) {
    console.log('  Utilisateur introuvable');
    process.exit(1);
  }

  u.password_hash = await bcrypt.hash(password, 12);
  await u.save();
  console.log(`  Mot de passe reinitialise pour user id=${u.id}. Aucun secret n est affiche.`);
  await sequelize.close();
  process.exit(0);
})();
