process.env.NODE_ENV = 'test';
process.env.JWT_SECRET =
  process.env.JWT_SECRET || 'test_only_secret_do_not_use_in_production_xyz123';

async function seedTestDatabase() {
  const bcrypt = require('bcryptjs');
  const {
    sequelize,
    Permission,
    Role,
    RolePermission,
    User,
    UserRole,
    JournalComptable,
    DocumentType,
    Exercice,
    SourceFinancement,
    RubriqueBudgetaire,
  } = require('../models');
  const { PERMISSIONS } = require('../config/permissions');

  await sequelize.sync({ force: true });

  for (const [key, description] of Object.entries(PERMISSIONS)) {
    const [resource, action] = key.split(':');
    await Permission.findOrCreate({
      where: { resource, action },
      defaults: { description },
    });
  }

  const rolesData = [
    { code: 'admin', nom: 'Administrateur', description: 'Acces complet au systeme', is_system: true },
    { code: 'coordinateur', nom: 'Coordinateur', description: 'Validation et supervision', is_system: true },
    { code: 'gestionnaire', nom: 'Gestionnaire', description: 'Gestion des dossiers et achats', is_system: true },
    { code: 'comptable', nom: 'Comptable', description: 'Comptabilite et paiements', is_system: true },
    { code: 'auditeur', nom: 'Auditeur', description: 'Controle interne et audit', is_system: true },
    { code: 'archiviste', nom: 'Archiviste', description: 'Gestion documentaire', is_system: true },
    { code: 'lecture', nom: 'Lecture seule', description: 'Consultation uniquement', is_system: true },
  ];

  const roles = {};
  for (const roleData of rolesData) {
    const [role] = await Role.findOrCreate({
      where: { code: roleData.code },
      defaults: roleData,
    });
    roles[roleData.code] = role;
  }

  const permissions = await Permission.findAll();
  for (const permission of permissions) {
    await RolePermission.findOrCreate({
      where: { role_id: roles.admin.id, permission_id: permission.id },
    });
  }

  const readPermissions = permissions.filter((permission) => permission.action === 'read');
  for (const permission of readPermissions) {
    await RolePermission.findOrCreate({
      where: { role_id: roles.lecture.id, permission_id: permission.id },
    });
  }

  const [adminUser] = await User.findOrCreate({
    where: { email: 'admin.test@sigfic.invalid' },
    defaults: {
      nom: 'Administrateur',
      prenom: 'Systeme',
      email: 'admin.test@sigfic.invalid',
      password_hash: await bcrypt.hash('TestAdmin!2026', 10),
      is_active: true,
    },
  });
  await UserRole.findOrCreate({
    where: { user_id: adminUser.id, role_id: roles.admin.id },
    defaults: { assigned_by: adminUser.id },
  });

  const journals = [
    { code: 'CG', libelle: 'Journal de Caisse Generale', type: 'caisse' },
    { code: 'BQ', libelle: 'Journal de Banque', type: 'banque' },
    { code: 'OD', libelle: 'Journal des Operations Diverses', type: 'od' },
    { code: 'AC', libelle: 'Journal des Achats', type: 'achats' },
    { code: 'AN', libelle: 'Journal Analytique', type: 'analytique' },
  ];
  for (const journal of journals) {
    await JournalComptable.findOrCreate({ where: { code: journal.code }, defaults: journal });
  }

  const documentTypes = [
    { code: 'EB', libelle: 'Expression de besoin', module: 'passation' },
    { code: 'DC', libelle: 'Demande de cotation', module: 'passation' },
    { code: 'FAC', libelle: 'Facture', module: 'paiement' },
    { code: 'OP', libelle: 'Ordre de paiement', module: 'paiement' },
    { code: 'DIV', libelle: 'Document divers', module: 'general' },
  ];
  for (const documentType of documentTypes) {
    await DocumentType.findOrCreate({
      where: { code: documentType.code },
      defaults: documentType,
    });
  }

  await Exercice.findOrCreate({
    where: { annee: 2026 },
    defaults: {
      libelle: 'Exercice 2026',
      date_debut: '2026-01-01',
      date_fin: '2026-12-31',
      statut: 'en_cours',
      created_by: adminUser.id,
    },
  });

  await SourceFinancement.findOrCreate({
    where: { code: 'ETAT' },
    defaults: {
      libelle: "Budget de l'Etat",
      type: 'state',
      montant_total: 0,
    },
  });

  await RubriqueBudgetaire.findOrCreate({
    where: { code: '100' },
    defaults: {
      libelle: 'Ressources humaines',
      nature: 'charges',
      niveau: 1,
    },
  });
}

beforeAll(seedTestDatabase);

afterAll(async () => {
  const { sequelize } = require('../models');
  await sequelize.close();
});
