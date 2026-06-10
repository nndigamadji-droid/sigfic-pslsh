const bcrypt = require('bcryptjs');
const { sequelize, User } = require('../models');

(async () => {
  const u = await User.findOne({ where: { email: 'comptable@pslsh.org' } });
  if (!u) { console.log('  ⚠ utilisateur introuvable'); process.exit(1); }
  u.password_hash = await bcrypt.hash('Compta@2026', 12);
  await u.save();
  console.log(`  ✓ Mot de passe réinitialisé : comptable@pslsh.org / Compta@2026 (user id=${u.id})`);
  await sequelize.close();
  process.exit(0);
})();
