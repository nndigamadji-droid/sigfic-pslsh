/* Seed : rôle chef_service + utilisateur Chef SAF */
const bcrypt = require('bcryptjs');
const { sequelize, Role, User, UserRole } = require('../models');

(async () => {
  console.log('\n═══ Seed Chef SAF ═══\n');

  // 1) Créer/garantir le rôle chef_service
  const [role, roleCreated] = await Role.findOrCreate({
    where: { code: 'chef_service' },
    defaults: {
      code: 'chef_service',
      nom: 'Chef de Service',
      description: 'Chef d\'un service métier (SAF, SGAS, SPCH, etc.) — validation administrative au sein du service.',
      is_system: true,
    },
  });
  console.log(`  ✓ Rôle chef_service : ${roleCreated ? 'créé' : 'déjà présent'} (id=${role.id})`);

  // 2) Créer/mettre à jour l'utilisateur saf@pslsh.org
  const pwdHash = await bcrypt.hash('Saf@2026', 12);
  let user = await User.findOne({ where: { email: 'saf@pslsh.org' } });

  if (user) {
    user.password_hash = pwdHash;
    user.nom = 'MAHAMAT';
    user.prenom = 'Ibrahim';
    user.telephone = '+235 66 12 34 56';
    user.service_code = 'SAF';
    user.is_active = true;
    await user.save();
    console.log(`  ✓ Utilisateur saf@pslsh.org : mis à jour (id=${user.id})`);
  } else {
    user = await User.create({
      email: 'saf@pslsh.org',
      password_hash: pwdHash,
      nom: 'MAHAMAT',
      prenom: 'Ibrahim',
      telephone: '+235 66 12 34 56',
      service_code: 'SAF',
      is_active: true,
    });
    console.log(`  ✓ Utilisateur saf@pslsh.org : créé (id=${user.id})`);
  }

  // 3) Retirer les rôles parasites éventuels (gestionnaire, etc.) pour ne garder que chef_service
  await UserRole.destroy({ where: { user_id: user.id } });
  await UserRole.create({ user_id: user.id, role_id: role.id });
  console.log('  ✓ Rôle chef_service assigné (anciens rôles retirés)');

  console.log('\n  ═══════════════════════════════════════════');
  console.log('  Identifiants Chef SAF :');
  console.log('    Email    : saf@pslsh.org');
  console.log('    Password : Saf@2026');
  console.log('    Nom      : Ibrahim MAHAMAT');
  console.log('    Service  : SAF');
  console.log('    Rôle     : chef_service');
  console.log('  ═══════════════════════════════════════════\n');

  await sequelize.close();
  process.exit(0);
})().catch((e) => { console.error(e); process.exit(1); });
