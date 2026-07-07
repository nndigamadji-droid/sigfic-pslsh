/* Seed : role chef_service + utilisateur optionnel fourni par environnement. */
const bcrypt = require('bcryptjs');
const { sequelize, Role, User, UserRole } = require('../models');

const allowUserProvisioning = process.env.ALLOW_USER_PROVISIONING === 'true';
const provisionEmail = String(process.env.PROVISION_CHEF_SERVICE_EMAIL || '').trim().toLowerCase();
const provisionPassword = process.env.PROVISION_CHEF_SERVICE_PASSWORD || '';
const provisionResetPassword = process.env.PROVISION_RESET_PASSWORD === 'true';

(async () => {
  console.log('\n=== Seed Chef de Service ===\n');

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

  if (!allowUserProvisioning) {
    console.log('  Provision utilisateur ignoree. Definissez ALLOW_USER_PROVISIONING=true pour creer un compte.');
    await sequelize.close();
    process.exit(0);
  }

  if (!provisionEmail || !provisionPassword) {
    throw new Error(
      'PROVISION_CHEF_SERVICE_EMAIL et PROVISION_CHEF_SERVICE_PASSWORD sont requis avec ALLOW_USER_PROVISIONING=true.'
    );
  }

  // 2) Creer/mettre a jour l'utilisateur fourni par variables d'environnement.
  const pwdHash = await bcrypt.hash(provisionPassword, 12);
  let user = await User.findOne({ where: { email: provisionEmail } });

  if (user) {
    if (provisionResetPassword) {
      user.password_hash = pwdHash;
    }
    user.nom = process.env.PROVISION_CHEF_SERVICE_NOM || user.nom || 'Chef';
    user.prenom = process.env.PROVISION_CHEF_SERVICE_PRENOM || user.prenom || 'Service';
    user.telephone = process.env.PROVISION_CHEF_SERVICE_TELEPHONE || user.telephone || null;
    user.service_code = process.env.PROVISION_CHEF_SERVICE_CODE || user.service_code || 'SAF';
    user.is_active = true;
    await user.save();
    console.log(`  Utilisateur provisionne : deja present (id=${user.id})`);
  } else {
    user = await User.create({
      email: provisionEmail,
      password_hash: pwdHash,
      nom: process.env.PROVISION_CHEF_SERVICE_NOM || 'Chef',
      prenom: process.env.PROVISION_CHEF_SERVICE_PRENOM || 'Service',
      telephone: process.env.PROVISION_CHEF_SERVICE_TELEPHONE || null,
      service_code: process.env.PROVISION_CHEF_SERVICE_CODE || 'SAF',
      is_active: true,
    });
    console.log(`  Utilisateur provisionne : cree (id=${user.id})`);
  }

  // 3) Ajouter le role sans retirer les roles existants.
  await UserRole.findOrCreate({ where: { user_id: user.id, role_id: role.id } });
  console.log('  Role chef_service assigne');
  console.log('\n  Provision terminee. Aucun identifiant sensible n est affiche.\n');

  await sequelize.close();
  process.exit(0);
})().catch((e) => { console.error(e); process.exit(1); });
