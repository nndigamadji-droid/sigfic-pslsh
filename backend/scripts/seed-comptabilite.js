/* Seed plan comptable OHADA (minimal) + 4 journaux courants */
const { sequelize, PlanComptable, JournalComptable } = require('../models');

const COMPTES = [
  // Classe 2 — Immobilisations
  { compte: '2154', libelle: 'Matériel et outillage industriel',        classe: 2, type: 'actif' },
  { compte: '2183', libelle: 'Matériel informatique',                   classe: 2, type: 'actif' },
  { compte: '2184', libelle: 'Mobilier et matériel de bureau',          classe: 2, type: 'actif' },
  // Classe 4 — Tiers
  { compte: '4011', libelle: 'Fournisseurs',                            classe: 4, type: 'passif' },
  { compte: '4111', libelle: 'Clients',                                 classe: 4, type: 'actif'  },
  { compte: '4421', libelle: 'État - Subventions à recevoir',           classe: 4, type: 'actif'  },
  // Classe 5 — Trésorerie
  { compte: '5121', libelle: 'Banques',                                 classe: 5, type: 'actif'  },
  { compte: '5710', libelle: 'Caisse',                                  classe: 5, type: 'actif'  },
  // Classe 6 — Charges
  { compte: '6061', libelle: 'Eau, électricité, glace',                 classe: 6, type: 'charge' },
  { compte: '60211', libelle: 'Médicaments',                            classe: 6, type: 'charge' },
  { compte: '60212', libelle: 'Réactifs de laboratoire',                classe: 6, type: 'charge' },
  { compte: '60213', libelle: 'Consommables médicaux',                  classe: 6, type: 'charge' },
  { compte: '60221', libelle: 'Composants électroniques',               classe: 6, type: 'charge' },
  { compte: '6063', libelle: 'Fournitures entretien petit équipement',  classe: 6, type: 'charge' },
  { compte: '6064', libelle: 'Fournitures administratives',             classe: 6, type: 'charge' },
  { compte: '6065', libelle: 'Consommables informatiques',              classe: 6, type: 'charge' },
  { compte: '6152', libelle: 'Entretien biens immobiliers',             classe: 6, type: 'charge' },
  { compte: '6156', libelle: 'Maintenance informatique',                classe: 6, type: 'charge' },
  { compte: '6181', libelle: 'Documentation générale',                  classe: 6, type: 'charge' },
  { compte: '6231', libelle: 'Frais de formation du personnel',         classe: 6, type: 'charge' },
  { compte: '6251', libelle: 'Voyages et déplacements',                 classe: 6, type: 'charge' },
  { compte: '6252', libelle: 'Frais de mission - per diem',             classe: 6, type: 'charge' },
  { compte: '6261', libelle: 'Frais postaux et télécommunications',     classe: 6, type: 'charge' },
  { compte: '6611', libelle: 'Appointements, salaires',                 classe: 6, type: 'charge' },
  { compte: '6612', libelle: 'Primes et gratifications',                classe: 6, type: 'charge' },
  { compte: '6631', libelle: 'Indemnités versées au personnel',         classe: 6, type: 'charge' },
  { compte: '6712', libelle: 'Dons et libéralités',                     classe: 6, type: 'charge' },
  { compte: '6571', libelle: 'Subventions et assistance bénéficiaires', classe: 6, type: 'charge' },
  // Classe 7 — Produits
  { compte: '7011', libelle: 'Subventions reçues partenaires',          classe: 7, type: 'produit' },
  { compte: '7080', libelle: 'Produits divers - dons',                  classe: 7, type: 'produit' },
];

const JOURNAUX = [
  { code: 'JA', libelle: 'Journal des Achats',     type: 'achats'  },
  { code: 'JV', libelle: 'Journal des Ventes',     type: 'ventes'  },
  { code: 'JB', libelle: 'Journal de Banque',      type: 'banque'  },
  { code: 'OD', libelle: 'Journal des Opérations Diverses', type: 'od' },
];

async function seed() {
  console.log('\n═══ Seed plan comptable OHADA + journaux ═══\n');
  let comptesAdded = 0, comptesSkipped = 0;
  for (const c of COMPTES) {
    const [, created] = await PlanComptable.findOrCreate({ where: { compte: c.compte }, defaults: c });
    if (created) comptesAdded++; else comptesSkipped++;
  }
  let journauxAdded = 0, journauxSkipped = 0;
  for (const j of JOURNAUX) {
    const [, created] = await JournalComptable.findOrCreate({ where: { code: j.code }, defaults: j });
    if (created) journauxAdded++; else journauxSkipped++;
  }
  console.log(`   ${comptesAdded} compte(s) créé(s), ${comptesSkipped} déjà présent(s)`);
  console.log(`   ${journauxAdded} journal(aux) créé(s), ${journauxSkipped} déjà présent(s)\n`);
  await sequelize.close();
  process.exit(0);
}

seed().catch((e) => { console.error(e); process.exit(1); });
