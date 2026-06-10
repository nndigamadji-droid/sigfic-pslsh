/* Seed : utilisateur Chef SAF (chef_service rattaché au service SAF) */
const bcrypt = require('bcryptjs');
const { sequelize, Role, User, UserRole } = require('../models');

(async () => {
  console.log('\n═══ Seed utilisateur Chef SAF ═══\n');

  const role = await Role.findOne({ where: { code: 'chef_service' } });
  if (!role) {
    console.error('  ⚠ rôle chef_service introuvable. Annulation.');
    process.exit(1);
  }

  const pwdHash = await bcrypt.hash('Saf@2026', 12);
  const [user, created] = await User.findOrCreate({
    where: { email: 'saf@pslsh.org' },
    defaults: {
      email: 'saf@pslsh.org',
      password_hash: pwdHash,
      nom: 'MAHAMAT',
      prenom: 'Ibrahim',
      telephone: '+235 66 12 34 56',
      service_code: 'SAF',
      is_active: true,
    },
  });

  if (!created) {
    user.password_hash = pwdHash;
    user.service_code = 'SAF';
    await user.save();
    console.log('  ✓ Utilisateur saf@pslsh.org : mot de passe réinitialisé');
  } else {
    console.log('  ✓ Utilisateur saf@pslsh.org créé');
  }

  await UserRole.findOrCreate({
    where: { user_id: user.id, role_id: role.id },
    defaults: { user_id: user.id, role_id: role.id },
  });
  console.log('  ✓ Rôle chef_service assigné');

  console.log('\n  ═══════════════════════════════════════════');
  console.log('  Identifiants Chef SAF :');
  console.log('    Email    : saf@pslsh.org');
  console.log('    Password : Saf@2026');
  console.log('    Service  : SAF');
  console.log('    Rôle     : chef_service');
  console.log('  ═══════════════════════════════════════════\n');

  await sequelize.close();
  process.exit(0);
})().catch((e) => { console.error(e); process.exit(1); });
