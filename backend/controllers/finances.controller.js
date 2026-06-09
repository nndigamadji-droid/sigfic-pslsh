/* ════════════════════════════════════════════════════════════════════════════
   Contrôleur Finances — agrégations OHADA + Tchad
   Cycle 4 : balance budgétaire (compte de gestion)
   Cycle 5 : bilan, compte de résultat, TFT, KPIs rapport financier
   ════════════════════════════════════════════════════════════════════════════ */
const { sequelize, EcritureComptable, LigneEcriture, PlanComptable, JournalComptable } = require('../models');
const { Op, fn, col, literal } = require('sequelize');

/* ── Cycle 3 — Balance des Comptes 6 colonnes ─────────────────────────────── */
async function balanceComptes(req, res, next) {
  try {
    const { date_debut, date_fin } = req.query;
    const where = {};
    if (date_debut || date_fin) {
      where.date_ecriture = {};
      if (date_debut) where.date_ecriture[Op.gte] = date_debut;
      if (date_fin)   where.date_ecriture[Op.lte] = date_fin;
    }
    const lignes = await LigneEcriture.findAll({
      include: [
        { model: EcritureComptable, as: 'ecriture', where, required: true },
        { model: PlanComptable, as: 'compte' },
      ],
    });
    const map = {};
    for (const l of lignes) {
      const compte = l.compte;
      if (!compte) continue;
      const key = compte.compte;
      if (!map[key]) {
        map[key] = {
          numero: compte.compte, intitule: compte.libelle, classe: compte.classe,
          mouvement_debit: 0, mouvement_credit: 0,
        };
      }
      map[key].mouvement_debit  += parseFloat(l.debit  || 0);
      map[key].mouvement_credit += parseFloat(l.credit || 0);
    }
    const rows = Object.values(map)
      .sort((a, b) => a.numero.localeCompare(b.numero))
      .map((r) => {
        const solde = r.mouvement_debit - r.mouvement_credit;
        r.solde_debit  = solde > 0 ?  solde : 0;
        r.solde_credit = solde < 0 ? -solde : 0;
        r.solde_ouverture = 0; // base seed sans antériorité pour l'instant
        return r;
      });
    const totaux = rows.reduce((s, r) => ({
      mouvement_debit:  s.mouvement_debit  + r.mouvement_debit,
      mouvement_credit: s.mouvement_credit + r.mouvement_credit,
      solde_debit:      s.solde_debit      + r.solde_debit,
      solde_credit:     s.solde_credit     + r.solde_credit,
    }), { mouvement_debit:0, mouvement_credit:0, solde_debit:0, solde_credit:0 });
    res.json({ success:true, data:{ rows, totaux, equilibre: Math.abs(totaux.mouvement_debit - totaux.mouvement_credit) < 0.01 } });
  } catch (err) { next(err); }
}

/* ── Cycle 4 — Balance Budgétaire / Compte de Gestion ─────────────────────── */
async function balanceBudgetaire(req, res, next) {
  try {
    // Lignes consolidées : pour chaque compte de charge (classe 6) ou immo (classe 2),
    // on cumule les écritures et on les présente comme Engagements_Emis / Paiements
    const lignes = await LigneEcriture.findAll({
      include: [
        { model: EcritureComptable, as: 'ecriture' },
        { model: PlanComptable, as: 'compte', where: { classe: { [Op.in]: [2, 6] } } },
      ],
    });
    const map = {};
    for (const l of lignes) {
      const c = l.compte;
      if (!c) continue;
      if (!map[c.compte]) {
        map[c.compte] = {
          code: c.compte, intitule: c.libelle, classe: c.classe,
          engagements: 0, liquidations: 0, ordonnancements: 0, paiements: 0,
        };
      }
      const debit = parseFloat(l.debit || 0);
      // Convention démo : un débit sur compte de charge = engagement
      // (le système réel distinguerait via le journal et statut)
      map[c.compte].engagements   += debit;
      map[c.compte].liquidations  += debit;
      map[c.compte].ordonnancements += debit;
      // Les paiements seraient ceux du JB (journal banque)
      const journal = l.ecriture && l.ecriture.journal_id;
      // Placeholder : impossible sans data → on laisse 0
    }
    const rows = Object.values(map).sort((a, b) => a.code.localeCompare(b.code));
    const totaux = rows.reduce((s, r) => ({
      engagements:    s.engagements    + r.engagements,
      liquidations:   s.liquidations   + r.liquidations,
      ordonnancements:s.ordonnancements+ r.ordonnancements,
      paiements:      s.paiements      + r.paiements,
    }), { engagements:0, liquidations:0, ordonnancements:0, paiements:0 });
    res.json({ success:true, data:{ rows, totaux } });
  } catch (err) { next(err); }
}

/* ── Cycle 5 — Compte de Résultat (charges classe 6, produits classe 7) ───── */
async function compteResultat(req, res, next) {
  try {
    const lignes = await LigneEcriture.findAll({
      include: [
        { model: EcritureComptable, as: 'ecriture' },
        { model: PlanComptable, as: 'compte', where: { classe: { [Op.in]: [6, 7] } } },
      ],
    });
    let totalCharges = 0, totalProduits = 0;
    const charges = {}, produits = {};
    for (const l of lignes) {
      const c = l.compte;
      if (!c) continue;
      const debit = parseFloat(l.debit || 0);
      const credit = parseFloat(l.credit || 0);
      if (c.classe === 6) {
        charges[c.compte] = charges[c.compte] || { code:c.compte, libelle:c.libelle, montant:0 };
        charges[c.compte].montant += (debit - credit);
        totalCharges += (debit - credit);
      } else if (c.classe === 7) {
        produits[c.compte] = produits[c.compte] || { code:c.compte, libelle:c.libelle, montant:0 };
        produits[c.compte].montant += (credit - debit);
        totalProduits += (credit - debit);
      }
    }
    const resultat = totalProduits - totalCharges;
    res.json({ success:true, data:{
      charges:  Object.values(charges).sort((a,b) => a.code.localeCompare(b.code)),
      produits: Object.values(produits).sort((a,b) => a.code.localeCompare(b.code)),
      total_charges:  totalCharges,
      total_produits: totalProduits,
      resultat,
      type_resultat: resultat >= 0 ? 'excedent' : 'deficit',
    }});
  } catch (err) { next(err); }
}

/* ── Cycle 5 — Bilan SYSCOHADA simplifié ──────────────────────────────────── */
async function bilanOhada(req, res, next) {
  try {
    const lignes = await LigneEcriture.findAll({
      include: [
        { model: EcritureComptable, as: 'ecriture' },
        { model: PlanComptable, as: 'compte', where: { classe: { [Op.in]: [1, 2, 3, 4, 5] } } },
      ],
    });
    const map = {};
    for (const l of lignes) {
      const c = l.compte;
      if (!c) continue;
      if (!map[c.compte]) {
        map[c.compte] = { code:c.compte, libelle:c.libelle, classe:c.classe, type:c.type, solde:0 };
      }
      map[c.compte].solde += parseFloat(l.debit || 0) - parseFloat(l.credit || 0);
    }
    // Rubrique simplifiée
    const actif  = { immobilisations:[], creances:[], tresorerie:[], total:0 };
    const passif = { capitaux:[], dettes_lt:[], dettes_ct:[], total:0 };
    for (const r of Object.values(map)) {
      if (r.classe === 2) { actif.immobilisations.push(r); actif.total += r.solde; }
      else if (r.classe === 4 && r.solde > 0) { actif.creances.push(r); actif.total += r.solde; }
      else if (r.classe === 5) { actif.tresorerie.push(r); actif.total += r.solde; }
      else if (r.classe === 1) { passif.capitaux.push(r); passif.total += Math.abs(r.solde); }
      else if (r.classe === 4 && r.solde < 0) { passif.dettes_ct.push({ ...r, solde:-r.solde }); passif.total += -r.solde; }
    }
    res.json({ success:true, data:{ actif, passif, equilibre: Math.abs(actif.total - passif.total) < 0.01 } });
  } catch (err) { next(err); }
}

/* ── Cycle 5 — KPIs rapport financier final ──────────────────────────────── */
async function kpisFinanciers(req, res, next) {
  try {
    const dotationActuelle = parseFloat(req.query.dotation || 0); // injecté depuis frontend
    const ecritures = await EcritureComptable.findAll({
      include: [
        { model: LigneEcriture, as: 'lignes', include: [{ model: PlanComptable, as: 'compte' }] },
        { model: JournalComptable, as: 'journal' },
      ],
    });
    let totalEngage = 0, totalPaye = 0;
    let nDelais = 0, sommeDelais = 0;
    const today = new Date();
    for (const e of ecritures) {
      const isEng = (e.journal && e.journal.code === 'JA');
      const isPay = (e.journal && e.journal.code === 'JB');
      const m = (e.lignes || []).reduce((s, l) => s + parseFloat(l.debit || 0), 0);
      if (isEng) {
        totalEngage += m;
        const d = (new Date(e.date_ecriture) - today) / (24 * 3600 * 1000);
        sommeDelais += Math.abs(d);
        nDelais++;
      }
      if (isPay) totalPaye += m;
    }
    res.json({ success:true, data:{
      taux_engagement:   dotationActuelle > 0 ? +(totalEngage / dotationActuelle * 100).toFixed(2) : null,
      taux_decaissement: dotationActuelle > 0 ? +(totalPaye   / dotationActuelle * 100).toFixed(2) : null,
      delai_moyen_jours: nDelais > 0 ? Math.round(sommeDelais / nDelais) : null,
      ecritures_count: ecritures.length,
      total_engage: totalEngage,
      total_paye: totalPaye,
      dotation_actuelle: dotationActuelle,
      alerte_delai: nDelais > 0 && (sommeDelais / nDelais) > 30,
    }});
  } catch (err) { next(err); }
}

/* ── Carnet de trésorerie (Cycle 2) ──────────────────────────────────────── */
async function carnetTresorerie(req, res, next) {
  try {
    const lignes = await LigneEcriture.findAll({
      include: [
        { model: EcritureComptable, as: 'ecriture' },
        { model: PlanComptable, as: 'compte', where: { classe: 5 } },
      ],
    });
    const map = {};
    for (const l of lignes) {
      const c = l.compte;
      if (!c) continue;
      if (!map[c.compte]) map[c.compte] = { code:c.compte, libelle:c.libelle, entrees:0, sorties:0 };
      map[c.compte].entrees += parseFloat(l.debit  || 0);
      map[c.compte].sorties += parseFloat(l.credit || 0);
    }
    const rows = Object.values(map).map((r) => ({ ...r, solde: r.entrees - r.sorties }));
    res.json({ success:true, data:rows });
  } catch (err) { next(err); }
}

module.exports = {
  balanceComptes, balanceBudgetaire, compteResultat, bilanOhada,
  kpisFinanciers, carnetTresorerie,
};
