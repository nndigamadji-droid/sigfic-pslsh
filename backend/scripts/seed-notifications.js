/* Seed de notifications de demonstration, desactive par defaut. */
const { sequelize, User, Notification } = require('../models');

const allowDemoSeed = process.env.ALLOW_DEMO_SEED === 'true';
const seedAdminEmail = process.env.SEED_ADMIN_EMAIL || '';

async function seed() {
  if (!allowDemoSeed) {
    throw new Error('ALLOW_DEMO_SEED=true est requis pour injecter des notifications de demonstration.');
  }
  if (!seedAdminEmail) {
    throw new Error('SEED_ADMIN_EMAIL est requis pour cibler un administrateur.');
  }

  console.log('\n═══ Seed notifications de demonstration ═══\n');
  const admin = await User.findOne({ where: { email: seedAdminEmail } });
  if (!admin) { console.log(`  ⚠ ${seedAdminEmail} introuvable, seed annulé`); process.exit(1); }

  const now = new Date();
  const j = (n) => new Date(now.getTime() + n * 24 * 3600 * 1000);

  const items = [
    // ── ALERTES (priority high/urgent) ────────────────────────────────────
    { type:'alert', category:'budget', priority:'urgent',
      title:'Dépassement budgétaire L-DF2-001',
      message:'La ligne « Fournitures et consommables de bureau » est engagée à 141% (17 534 000 FCFA / 12 470 000). Action immédiate requise.',
      icon:'exclamation-triangle',
      related_module:'budget', related_id:'L004',
      action_url:'/pages/budget/lignes.html', action_label:'Voir la ligne' },

    { type:'alert', category:'finance', priority:'high',
      title:'Délai moyen de traitement excède 30 jours',
      message:'Le délai moyen entre engagement et paiement atteint 38 jours. Vérifier les goulots dans le circuit de validation.',
      icon:'clock',
      related_module:'finances', related_id:null,
      action_url:'/pages/finances/etats-financiers.html?tab=rapport', action_label:'Ouvrir rapport' },

    { type:'alert', category:'validation', priority:'high',
      title:'4 dossiers bloqués depuis plus de 5 jours',
      message:'Les dossiers DOS-2026-0007, 0011, 0019, 0022 attendent votre signature comme coordonnateur.',
      icon:'folder-open',
      related_module:'validation', related_id:null,
      action_url:'/pages/validation/index.html', action_label:'Voir les dossiers' },

    // ── TÂCHES (priority normal/high) ─────────────────────────────────────
    { type:'task', category:'validation', priority:'high',
      title:'Validation à signer : DOS-2026-0019',
      message:'Achat simple « Fournitures de bureau SAF » — montant 250 000 FCFA — ordonnancement en attente.',
      icon:'check-double', due_date: j(2),
      related_module:'dossiers', related_id:'DOS-2026-0019',
      action_url:'/pages/dossiers/detail.html?id=DOS-2026-0019', action_label:'Ouvrir le dossier' },

    { type:'task', category:'dossier', priority:'normal',
      title:'Pièces manquantes : DOS-2026-0008',
      message:'Construction entrepôt — 3 pièces sur 14 restent à téléverser (offres, PV attribution, contrat).',
      icon:'file-upload', due_date: j(5),
      related_module:'dossiers', related_id:'DOS-2026-0008',
      action_url:'/pages/dossiers/detail.html?id=DOS-2026-0008', action_label:'Ouvrir le dossier' },

    { type:'task', category:'paiement', priority:'normal',
      title:'Liquidation à effectuer : 3 factures',
      message:'Trois factures fournisseur reçues attendent la liquidation comptable.',
      icon:'file-invoice-dollar', due_date: j(7),
      related_module:'paiement', related_id:null,
      action_url:'/pages/paiement/index.html', action_label:'Voir les factures' },

    // ── RAPPELS (reminder) ────────────────────────────────────────────────
    { type:'reminder', category:'finance', priority:'normal',
      title:'Rapprochement bancaire CBT — échéance dans 3 jours',
      message:'Le rapprochement mensuel du compte CBT N\'Djamena doit être validé avant le 15/06.',
      icon:'sync-alt', due_date: j(3),
      related_module:'finances', related_id:'CBT',
      action_url:'/pages/comptabilite/rapprochement.html', action_label:'Faire le rapprochement' },

    { type:'reminder', category:'budget', priority:'low',
      title:'Comité de pilotage trimestriel — dans 14 jours',
      message:'Préparer la synthèse Q2 : taux d\'exécution, écarts budgétaires, rapport bailleurs.',
      icon:'calendar-day', due_date: j(14),
      related_module:'budget', related_id:null,
      action_url:'/pages/budget/synthese.html', action_label:'Préparer la synthèse' },

    // ── MESSAGES (type info, conversationnel) ─────────────────────────────
    { type:'message', category:'systeme', priority:'low',
      title:'Bienvenue dans SIGFIC-PSLSH v2.0',
      message:'La nouvelle version intègre le moteur OHADA + Tchad, le mapping budgétaire automatique et le rapport financier global.',
      icon:'info-circle',
      related_module:'systeme', related_id:null,
      action_url:'/pages/dashboard/index.html', action_label:'Voir le tableau de bord' },

    { type:'message', category:'rh', priority:'low',
      title:'Nouveau message du SAF',
      message:'Note de service : la fenêtre de saisie des demandes d\'engagement pour Q2 ferme le 25 juin.',
      icon:'comment-dots',
      related_module:'rh', related_id:null,
      action_url:'#', action_label:'Lire la note' },

    // ── INFOS (type info, système) ────────────────────────────────────────
    { type:'info', category:'audit', priority:'normal',
      title:'Audit trail : 24 nouvelles entrées',
      message:'12 engagements, 5 virements de crédit et 7 modifications de lignes budgétaires enregistrés depuis 24h.',
      icon:'history', status:'read', read_at: j(-1),
      related_module:'audit', related_id:null,
      action_url:'/pages/controle/audit.html', action_label:'Consulter le journal' },
  ];

  let created = 0, skipped = 0;
  for (const it of items) {
    const exists = await Notification.findOne({ where: { user_id: admin.id, title: it.title } });
    if (exists) { skipped++; continue; }
    await Notification.create({ ...it, user_id: admin.id });
    created++;
  }
  console.log(`   ${created} notification(s) créée(s), ${skipped} déjà présente(s)\n`);
  await sequelize.close();
  process.exit(0);
}

seed().catch((e) => { console.error(e); process.exit(1); });
