require('dotenv').config();
const { sequelize, Permission, Role, RolePermission, User, JournalComptable, DocumentType, Exercice, SourceFinancement, RubriqueBudgetaire } = require('../models');
const bcrypt = require('bcryptjs');
const { PERMISSIONS } = require('../config/permissions');

async function seed() {
  try {
    await sequelize.authenticate();
    await sequelize.sync({ alter: false });
    console.log('Démarrage du seeding...\n');

    // ── 1. Permissions ────────────────────────────────────────────────────────
    console.log('1. Seeding permissions...');
    for (const [key, description] of Object.entries(PERMISSIONS)) {
      const [resource, action] = key.split(':');
      await Permission.findOrCreate({ where: { resource, action }, defaults: { description } });
    }
    console.log(`   ✓ ${Object.keys(PERMISSIONS).length} permissions`);

    // ── 2. Rôles ──────────────────────────────────────────────────────────────
    console.log('2. Seeding rôles...');
    const rolesData = [
      { code: 'admin',        nom: 'Administrateur',          description: 'Accès complet au système',          is_system: true },
      { code: 'coordinateur', nom: 'Coordinateur',            description: 'Validation et supervision',         is_system: true },
      { code: 'gestionnaire', nom: 'Gestionnaire',            description: 'Gestion des dossiers et achats',    is_system: true },
      { code: 'comptable',    nom: 'Comptable',               description: 'Comptabilité et paiements',         is_system: true },
      { code: 'auditeur',     nom: 'Auditeur',                description: 'Contrôle interne et audit',         is_system: true },
      { code: 'archiviste',   nom: 'Archiviste',              description: 'Gestion documentaire',              is_system: true },
      { code: 'lecture',      nom: 'Lecture seule',           description: 'Consultation uniquement',           is_system: true },
    ];
    const roles = {};
    for (const r of rolesData) {
      const [role] = await Role.findOrCreate({ where: { code: r.code }, defaults: r });
      roles[r.code] = role;
    }
    console.log('   ✓ 7 rôles');

    // ── 3. Attribution des permissions aux rôles ──────────────────────────────
    console.log('3. Attribution permissions aux rôles...');
    const allPerms = await Permission.findAll();
    const permMap = {};
    allPerms.forEach(p => { permMap[`${p.resource}:${p.action}`] = p; });

    // Admin : tout
    for (const perm of allPerms) {
      await RolePermission.findOrCreate({ where: { role_id: roles.admin.id, permission_id: perm.id } });
    }

    // Coordinateur
    const coordPerms = ['dossiers:read','dossiers:validate','dossiers:workflow','budget:read','passation:read','commandes:read','receptions:read','paiement:read','paiement:ordonnancer','reporting:read','reporting:export','documents:read','controle:read','exercices:read','fournisseurs:read','stock:read','comptabilite:read'];
    for (const key of coordPerms) {
      if (permMap[key]) await RolePermission.findOrCreate({ where: { role_id: roles.coordinateur.id, permission_id: permMap[key].id } });
    }

    // Gestionnaire
    const gestPerms = ['dossiers:read','dossiers:create','dossiers:update','dossiers:workflow','passation:read','passation:manage','commandes:read','commandes:manage','contrats:read','contrats:manage','receptions:read','receptions:manage','fournisseurs:read','fournisseurs:manage','stock:read','stock:manage','budget:read','documents:read','documents:upload','exercices:read'];
    for (const key of gestPerms) {
      if (permMap[key]) await RolePermission.findOrCreate({ where: { role_id: roles.gestionnaire.id, permission_id: permMap[key].id } });
    }

    // Comptable
    const comptPerms = ['comptabilite:read','comptabilite:saisie','comptabilite:valider','paiement:read','paiement:liquider','paiement:ordonnancer','paiement:payer','paiement:rapprochement','dossiers:read','budget:read','reporting:read','reporting:export','documents:read','documents:upload'];
    for (const key of comptPerms) {
      if (permMap[key]) await RolePermission.findOrCreate({ where: { role_id: roles.comptable.id, permission_id: permMap[key].id } });
    }

    // Auditeur
    const auditPerms = ['audit:read','audit:manage','controle:read','controle:manage','dossiers:read','budget:read','comptabilite:read','paiement:read','reporting:read','documents:read'];
    for (const key of auditPerms) {
      if (permMap[key]) await RolePermission.findOrCreate({ where: { role_id: roles.auditeur.id, permission_id: permMap[key].id } });
    }

    // Lecture seule
    const readPerms = allPerms.filter(p => p.action === 'read').map(p => p.id);
    for (const permId of readPerms) {
      await RolePermission.findOrCreate({ where: { role_id: roles.lecture.id, permission_id: permId } });
    }

    console.log('   ✓ Permissions attribuées');

    // ── 4. Utilisateur admin par défaut ───────────────────────────────────────
    console.log('4. Création utilisateur admin...');
    const [adminUser, created] = await User.findOrCreate({
      where: { email: 'admin@pslsh.org' },
      defaults: {
        nom:          'Administrateur',
        prenom:       'Système',
        email:        'admin@pslsh.org',
        password_hash: await bcrypt.hash('Admin@2026', 10),
        is_active:    true,
      },
    });
    if (created) {
      const { UserRole } = require('../models');
      await UserRole.findOrCreate({ where: { user_id: adminUser.id, role_id: roles.admin.id }, defaults: { assigned_by: adminUser.id } });
    }
    console.log(`   ✓ Admin: admin@pslsh.org / Admin@2026`);

    // ── 5. Journaux comptables ────────────────────────────────────────────────
    console.log('5. Seeding journaux comptables...');
    const journaux = [
      { code: 'CG', libelle: 'Journal de Caisse Générale',   type: 'caisse' },
      { code: 'BQ', libelle: 'Journal de Banque',            type: 'banque' },
      { code: 'OD', libelle: 'Journal des Opérations Diverses', type: 'od' },
      { code: 'AC', libelle: 'Journal des Achats',           type: 'achats' },
      { code: 'AN', libelle: 'Journal Analytique',           type: 'analytique' },
    ];
    for (const j of journaux) {
      await JournalComptable.findOrCreate({ where: { code: j.code }, defaults: j });
    }
    console.log('   ✓ 5 journaux');

    // ── 6. Plan comptable SYSCOHADA (extrait) ─────────────────────────────────
    console.log('6. Seeding plan comptable SYSCOHADA...');
    const { PlanComptable } = require('../models');
    const comptes = [
      { compte: '10',    libelle: 'Capital',                              classe: 1, type: 'passif' },
      { compte: '101',   libelle: 'Capital social',                       classe: 1, type: 'passif' },
      { compte: '12',    libelle: 'Résultat de l\'exercice',               classe: 1, type: 'passif' },
      { compte: '16',    libelle: 'Emprunts et dettes financières',        classe: 1, type: 'passif' },
      { compte: '20',    libelle: 'Immobilisations incorporelles',         classe: 2, type: 'actif' },
      { compte: '21',    libelle: 'Terrains',                              classe: 2, type: 'actif' },
      { compte: '22',    libelle: 'Bâtiments',                             classe: 2, type: 'actif' },
      { compte: '24',    libelle: 'Matériel et mobilier',                  classe: 2, type: 'actif' },
      { compte: '244',   libelle: 'Matériel informatique',                 classe: 2, type: 'actif' },
      { compte: '245',   libelle: 'Matériel de transport',                 classe: 2, type: 'actif' },
      { compte: '31',    libelle: 'Marchandises',                          classe: 3, type: 'actif' },
      { compte: '36',    libelle: 'Emballages récupérables',               classe: 3, type: 'actif' },
      { compte: '40',    libelle: 'Fournisseurs et comptes rattachés',     classe: 4, type: 'passif' },
      { compte: '401',   libelle: 'Fournisseurs',                          classe: 4, type: 'passif' },
      { compte: '404',   libelle: 'Fournisseurs d\'immobilisations',       classe: 4, type: 'passif' },
      { compte: '41',    libelle: 'Clients et comptes rattachés',          classe: 4, type: 'actif' },
      { compte: '42',    libelle: 'Personnel',                             classe: 4, type: 'passif' },
      { compte: '421',   libelle: 'Personnel - Rémunérations dues',        classe: 4, type: 'passif' },
      { compte: '43',    libelle: 'Organismes sociaux',                    classe: 4, type: 'passif' },
      { compte: '44',    libelle: 'État et collectivités',                  classe: 4, type: 'passif' },
      { compte: '47',    libelle: 'Débiteurs et créditeurs divers',        classe: 4, type: 'passif' },
      { compte: '51',    libelle: 'Banques, établissements financiers',    classe: 5, type: 'actif' },
      { compte: '511',   libelle: 'Banque principale',                     classe: 5, type: 'actif' },
      { compte: '52',    libelle: 'Banques - Crédits de décaissement',     classe: 5, type: 'actif' },
      { compte: '57',    libelle: 'Caisse',                                classe: 5, type: 'actif' },
      { compte: '571',   libelle: 'Caisse principale',                     classe: 5, type: 'actif' },
      { compte: '60',    libelle: 'Achats et variations de stocks',        classe: 6, type: 'charge' },
      { compte: '601',   libelle: 'Achats de marchandises',                classe: 6, type: 'charge' },
      { compte: '604',   libelle: 'Achats de fournitures consommables',    classe: 6, type: 'charge' },
      { compte: '605',   libelle: 'Achats de matières premières',          classe: 6, type: 'charge' },
      { compte: '61',    libelle: 'Transports',                            classe: 6, type: 'charge' },
      { compte: '62',    libelle: 'Services extérieurs A',                  classe: 6, type: 'charge' },
      { compte: '621',   libelle: 'Sous-traitance générale',               classe: 6, type: 'charge' },
      { compte: '622',   libelle: 'Locations et charges locatives',        classe: 6, type: 'charge' },
      { compte: '623',   libelle: 'Redevances de crédit-bail',             classe: 6, type: 'charge' },
      { compte: '624',   libelle: 'Entretien, réparations et maintenance', classe: 6, type: 'charge' },
      { compte: '625',   libelle: 'Primes d\'assurances',                  classe: 6, type: 'charge' },
      { compte: '626',   libelle: 'Études et recherches',                  classe: 6, type: 'charge' },
      { compte: '63',    libelle: 'Services extérieurs B',                  classe: 6, type: 'charge' },
      { compte: '631',   libelle: 'Frais bancaires',                       classe: 6, type: 'charge' },
      { compte: '632',   libelle: 'Rémunérations d\'intermédiaires',       classe: 6, type: 'charge' },
      { compte: '633',   libelle: 'Publicité, publications',               classe: 6, type: 'charge' },
      { compte: '634',   libelle: 'Transports et déplacements',            classe: 6, type: 'charge' },
      { compte: '635',   libelle: 'Missions et réceptions',                classe: 6, type: 'charge' },
      { compte: '637',   libelle: 'Services bancaires et assimilés',       classe: 6, type: 'charge' },
      { compte: '64',    libelle: 'Impôts et taxes',                       classe: 6, type: 'charge' },
      { compte: '65',    libelle: 'Autres charges',                        classe: 6, type: 'charge' },
      { compte: '651',   libelle: 'Pertes sur créances irrécouvrables',    classe: 6, type: 'charge' },
      { compte: '66',    libelle: 'Charges de personnel',                  classe: 6, type: 'charge' },
      { compte: '661',   libelle: 'Appointements et salaires',             classe: 6, type: 'charge' },
      { compte: '662',   libelle: 'Commissions',                           classe: 6, type: 'charge' },
      { compte: '664',   libelle: 'Indemnités et avantages divers',        classe: 6, type: 'charge' },
      { compte: '67',    libelle: 'Frais financiers',                      classe: 6, type: 'charge' },
      { compte: '68',    libelle: 'Dotations aux amortissements',          classe: 6, type: 'charge' },
      { compte: '70',    libelle: 'Ventes',                                classe: 7, type: 'produit' },
      { compte: '71',    libelle: 'Subventions d\'exploitation',           classe: 7, type: 'produit' },
      { compte: '75',    libelle: 'Autres produits',                       classe: 7, type: 'produit' },
      { compte: '77',    libelle: 'Revenus financiers',                    classe: 7, type: 'produit' },
    ];
    for (const c of comptes) {
      await PlanComptable.findOrCreate({ where: { compte: c.compte }, defaults: c });
    }
    console.log(`   ✓ ${comptes.length} comptes SYSCOHADA`);

    // ── 7. Types de documents ─────────────────────────────────────────────────
    console.log('7. Seeding types de documents...');
    const docTypes = [
      { code: 'EB',   libelle: 'Expression de besoin',             module: 'passation' },
      { code: 'DC',   libelle: 'Demande de cotation',              module: 'passation' },
      { code: 'OFF',  libelle: 'Offre fournisseur',                module: 'passation' },
      { code: 'TAC',  libelle: 'Tableau comparatif',               module: 'passation' },
      { code: 'LAN',  libelle: 'Lettre de notification',           module: 'passation' },
      { code: 'BC',   libelle: 'Bon de commande',                  module: 'commandes' },
      { code: 'CTR',  libelle: 'Contrat',                          module: 'commandes' },
      { code: 'PVR',  libelle: 'Procès-verbal de réception',       module: 'reception' },
      { code: 'ASF',  libelle: 'Attestation de service fait',      module: 'reception' },
      { code: 'BSO',  libelle: 'Bordereau de sortie',              module: 'stock' },
      { code: 'FAC',  libelle: 'Facture',                          module: 'paiement' },
      { code: 'LIQ',  libelle: 'Fiche de liquidation',            module: 'paiement' },
      { code: 'OP',   libelle: 'Ordre de paiement',               module: 'paiement' },
      { code: 'REL',  libelle: 'Relevé bancaire',                  module: 'paiement' },
      { code: 'AUD',  libelle: 'Rapport d\'audit',                 module: 'controle' },
      { code: 'DIV',  libelle: 'Document divers',                  module: 'general' },
    ];
    for (const dt of docTypes) {
      await DocumentType.findOrCreate({ where: { code: dt.code }, defaults: dt });
    }
    console.log(`   ✓ ${docTypes.length} types de documents`);

    // ── 8. Exercice courant ───────────────────────────────────────────────────
    console.log('8. Exercice 2026...');
    await Exercice.findOrCreate({
      where: { annee: 2026 },
      defaults: { libelle: 'Exercice 2026', date_debut: '2026-01-01', date_fin: '2026-12-31', statut: 'en_cours', created_by: adminUser.id },
    });
    console.log('   ✓ Exercice 2026');

    // ── 9. Sources de financement ─────────────────────────────────────────────
    console.log('9. Sources de financement...');
    const sources = [
      { code: 'ETAT',  libelle: 'Budget de l\'État',              type: 'state',    montant_total: 0 },
      { code: 'FM',    libelle: 'Fonds Mondial',                   type: 'bailleur', bailleur: 'The Global Fund', montant_total: 0 },
      { code: 'PEPFAR',libelle: 'PEPFAR / USAID',                  type: 'bailleur', bailleur: 'PEPFAR/USAID', montant_total: 0 },
      { code: 'OMS',   libelle: 'Organisation Mondiale de la Santé', type: 'bailleur', bailleur: 'OMS', montant_total: 0 },
      { code: 'PROP',  libelle: 'Ressources propres',              type: 'propre',   montant_total: 0 },
    ];
    for (const s of sources) {
      await SourceFinancement.findOrCreate({ where: { code: s.code }, defaults: s });
    }
    console.log('   ✓ 5 sources de financement');

    // ── 10. Rubriques budgétaires ─────────────────────────────────────────────
    console.log('10. Rubriques budgétaires...');
    const rubriques = [
      { code: '100', libelle: 'Ressources humaines',               nature: 'charges', niveau: 1 },
      { code: '101', libelle: 'Salaires et indemnités',            nature: 'charges', niveau: 2 },
      { code: '102', libelle: 'Per diem et missions',              nature: 'charges', niveau: 2 },
      { code: '200', libelle: 'Fournitures et consommables',       nature: 'charges', niveau: 1 },
      { code: '201', libelle: 'Fournitures de bureau',             nature: 'charges', niveau: 2 },
      { code: '202', libelle: 'Consommables médicaux',             nature: 'charges', niveau: 2 },
      { code: '300', libelle: 'Services et prestations',           nature: 'charges', niveau: 1 },
      { code: '301', libelle: 'Services de conseil',               nature: 'charges', niveau: 2 },
      { code: '302', libelle: 'Formation',                          nature: 'charges', niveau: 2 },
      { code: '303', libelle: 'Communication',                     nature: 'charges', niveau: 2 },
      { code: '400', libelle: 'Équipements et matériels',          nature: 'immobilisations', niveau: 1 },
      { code: '401', libelle: 'Matériel informatique',             nature: 'immobilisations', niveau: 2 },
      { code: '402', libelle: 'Matériel médical',                  nature: 'immobilisations', niveau: 2 },
      { code: '500', libelle: 'Frais généraux',                    nature: 'charges', niveau: 1 },
      { code: '501', libelle: 'Loyers',                             nature: 'charges', niveau: 2 },
      { code: '502', libelle: 'Eau, électricité, internet',        nature: 'charges', niveau: 2 },
      { code: '600', libelle: 'Activités communautaires',          nature: 'charges', niveau: 1 },
    ];
    for (const r of rubriques) {
      await RubriqueBudgetaire.findOrCreate({ where: { code: r.code }, defaults: r });
    }
    console.log(`   ✓ ${rubriques.length} rubriques budgétaires`);

    console.log('\n✅ Seeding terminé avec succès!\n');
    console.log('Connexion: admin@pslsh.org / Admin@2026\n');
    process.exit(0);
  } catch (err) {
    console.error('Erreur seeding:', err);
    process.exit(1);
  }
}

seed();
