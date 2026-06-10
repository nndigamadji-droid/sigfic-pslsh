/* Seed : rôle comptable_principal + 20 permissions d'émission + utilisateur démo */
const bcrypt = require('bcryptjs');
const { sequelize, Role, Permission, RolePermission, User, UserRole } = require('../models');

const PERMS_EMISSION = [
  // Pièces opérationnelles
  { resource:'eb',                 action:'create',  description:'Créer une expression de besoin' },
  // Pièces administratives (SAF)
  { resource:'bc',                 action:'emit',    description:'Émettre un Bon de Commande' },
  { resource:'attestation_sf',     action:'emit',    description:'Émettre une Attestation de Service Fait' },
  { resource:'pv_reception',       action:'emit',    description:'Émettre un PV de Réception' },
  { resource:'validation',         action:'saf',     description:'Signer validation administrative étape SAF' },
  // Pièces comptables (Comptable Principal)
  { resource:'avis_comptable',     action:'emit',    description:'Émettre un avis comptable sur EB' },
  { resource:'validation',         action:'compta',  description:'Signer validation comptable' },
  { resource:'bon_a_payer',        action:'emit',    description:'Apposer mention « bon à payer »' },
  { resource:'ov',                 action:'emit',    description:'Émettre un Ordre de Virement' },
  { resource:'op',                 action:'emit',    description:'Émettre un Ordre de Paiement' },
  { resource:'bordereau_paie',     action:'emit',    description:'Émettre un bordereau de paie' },
  { resource:'decharge',           action:'emit',    description:'Émettre une décharge / quittance' },
  { resource:'ecriture',           action:'create',  description:'Saisir des écritures comptables' },
  { resource:'dossier_comptable',  action:'open',    description:'Ouvrir un dossier comptable' },
  { resource:'dossier_comptable',  action:'close',   description:'Clôturer un dossier comptable' },
  { resource:'dossier_comptable',  action:'archive', description:'Archiver un dossier comptable' },
  { resource:'rapprochement',      action:'emit',    description:'Émettre rapprochement bancaire' },
  // Décisions (Coordo)
  { resource:'ordonnancement',     action:'sign',    description:'Signer ordonnancement final' },
  { resource:'virement_credit',    action:'execute', description:'Exécuter un virement de crédit' },
  // Contrôle
  { resource:'audit',              action:'emit',    description:'Émettre un rapport d\'audit' },
];

const ROLE_PERMS = {
  comptable_principal: [
    'eb:create',
    'avis_comptable:emit', 'validation:compta',
    'bon_a_payer:emit', 'ov:emit', 'op:emit',
    'bordereau_paie:emit', 'decharge:emit',
    'ecriture:create',
    'dossier_comptable:open', 'dossier_comptable:close', 'dossier_comptable:archive',
    'rapprochement:emit',
  ],
  chef_service: ['eb:create', 'bc:emit', 'attestation_sf:emit', 'pv_reception:emit', 'validation:saf'],
  coordination: ['ordonnancement:sign', 'virement_credit:execute'],
  controleur:   ['audit:emit'],
  agent:        ['eb:create'],
};

async function seed() {
  console.log('\n═══ Seed Comptable Principal — rôle + permissions + user ═══\n');

  // 1) Permissions
  const permIdByKey = {};
  let permAdded = 0;
  for (const p of PERMS_EMISSION) {
    const [perm, created] = await Permission.findOrCreate({
      where: { resource: p.resource, action: p.action },
      defaults: p,
    });
    permIdByKey[`${p.resource}:${p.action}`] = perm.id;
    if (created) permAdded++;
  }
  console.log(`   ${permAdded} permission(s) créée(s), ${PERMS_EMISSION.length - permAdded} déjà présente(s)`);

  // 2) Rôle comptable_principal
  const [role, roleCreated] = await Role.findOrCreate({
    where: { code: 'comptable_principal' },
    defaults: {
      code: 'comptable_principal',
      nom: 'Comptable Principal',
      description: 'Agent de l\'État pécuniairement responsable. Émet pièces comptables engageantes.',
      is_system: true,
    },
  });
  console.log(`   Rôle comptable_principal : ${roleCreated ? 'créé' : 'déjà présent'} (id=${role.id})`);

  // 3) Mapping rôle → permissions
  let mappingAdded = 0;
  for (const [roleCode, perms] of Object.entries(ROLE_PERMS)) {
    const r = await Role.findOne({ where: { code: roleCode } });
    if (!r) { console.log(`   ⚠ rôle ${roleCode} introuvable, skip`); continue; }
    for (const key of perms) {
      const permId = permIdByKey[key];
      if (!permId) continue;
      const [, c] = await RolePermission.findOrCreate({
        where: { role_id: r.id, permission_id: permId },
        defaults: { role_id: r.id, permission_id: permId },
      });
      if (c) mappingAdded++;
    }
  }
  console.log(`   ${mappingAdded} liaison(s) rôle↔permission ajoutée(s)`);

  // 4) Utilisateur démo
  const pwdHash = await bcrypt.hash('Compta@2026', 12);
  const [user, userCreated] = await User.findOrCreate({
    where: { email: 'comptable@pslsh.org' },
    defaults: {
      email: 'comptable@pslsh.org', password: pwdHash,
      nom: 'NDJEKOUNTA', prenom: 'Marie',
      civilite: 'Mme', telephone: '+235 66 11 22 33',
      service_code: 'SAF', is_active: true,
    },
  });
  console.log(`   Utilisateur comptable@pslsh.org : ${userCreated ? 'créé' : 'déjà présent'} (id=${user.id})`);

  await UserRole.findOrCreate({
    where: { user_id: user.id, role_id: role.id },
    defaults: { user_id: user.id, role_id: role.id },
  });
  console.log(`   Rôle assigné à ${user.email}`);

  console.log('\n   ✓ Connexion : comptable@pslsh.org / Compta@2026\n');
  await sequelize.close();
  process.exit(0);
}

seed().catch((e) => { console.error(e); process.exit(1); });
