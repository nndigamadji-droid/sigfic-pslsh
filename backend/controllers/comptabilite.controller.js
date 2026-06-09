const {
  PlanComptable,
  JournalComptable,
  EcritureComptable,
  LigneEcriture,
  Dossier,
  sequelize,
} = require('../models');
const auditService = require('../services/audit.service');
const { Op } = require('sequelize');

async function listPlanComptable(req, res, next) {
  try {
    const data = await PlanComptable.findAll({
      where: { is_active: true },
      order: [['compte', 'ASC']],
    });
    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
}

async function listJournaux(req, res, next) {
  try {
    const data = await JournalComptable.findAll();
    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
}

async function listEcritures(req, res, next) {
  try {
    const where = {};
    if (req.query.journal_id) where.journal_id = req.query.journal_id;
    if (req.query.dossier_id) where.dossier_id = req.query.dossier_id;
    if (req.query.statut) where.statut = req.query.statut;
    if (req.query.date_debut && req.query.date_fin) {
      where.date_ecriture = { [Op.between]: [req.query.date_debut, req.query.date_fin] };
    }
    const data = await EcritureComptable.findAll({
      where,
      include: [
        { model: JournalComptable, as: 'journal', attributes: ['id', 'code', 'libelle'] },
        {
          model: LigneEcriture,
          as: 'lignes',
          include: [
            { model: PlanComptable, as: 'compte', attributes: ['id', 'compte', 'libelle'] },
          ],
        },
      ],
      order: [['date_ecriture', 'DESC']],
    });
    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
}

async function createEcriture(req, res, next) {
  try {
    const { lignes, ...ecData } = req.body;
    if (!lignes || lignes.length < 2) {
      return res
        .status(400)
        .json({ success: false, message: 'Une écriture doit avoir au moins 2 lignes' });
    }
    const totalDebit = lignes.reduce((s, l) => s + parseFloat(l.debit || 0), 0);
    const totalCredit = lignes.reduce((s, l) => s + parseFloat(l.credit || 0), 0);
    if (Math.abs(totalDebit - totalCredit) > 0.01) {
      return res
        .status(400)
        .json({
          success: false,
          message: `Déséquilibre débit/crédit: ${totalDebit} ≠ ${totalCredit}`,
        });
    }

    const ecriture = await EcritureComptable.create({ ...ecData, saisie_par: req.user.id });
    await LigneEcriture.bulkCreate(lignes.map((l) => ({ ...l, ecriture_id: ecriture.id })));

    await auditService.log(req.user.id, 'comptabilite:create_ecriture', 'ecriture', ecriture.id, {
      new: { journal_id: ecData.journal_id },
    });
    res.status(201).json({ success: true, data: ecriture });
  } catch (err) {
    next(err);
  }
}

async function showEcriture(req, res, next) {
  try {
    const data = await EcritureComptable.findByPk(req.params.id, {
      include: [
        { model: JournalComptable, as: 'journal' },
        { model: LigneEcriture, as: 'lignes', include: [{ model: PlanComptable, as: 'compte' }] },
        { model: Dossier, as: 'dossier', attributes: ['id', 'reference', 'objet'] },
      ],
    });
    if (!data) return res.status(404).json({ success: false, message: 'Écriture introuvable' });
    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
}

async function validerEcriture(req, res, next) {
  try {
    const e = await EcritureComptable.findByPk(req.params.id);
    if (!e) return res.status(404).json({ success: false, message: 'Écriture introuvable' });
    if (e.statut !== 'brouillon')
      return res.status(400).json({ success: false, message: 'Écriture déjà validée' });
    await e.update({ statut: 'validee', validee_par: req.user.id, validee_le: new Date() });
    await auditService.log(req.user.id, 'comptabilite:valider', 'ecriture', e.id, {});
    res.json({ success: true, data: e, message: 'Écriture validée' });
  } catch (err) {
    next(err);
  }
}

async function grandLivre(req, res, next) {
  try {
    const { compte, date_debut, date_fin } = req.query;
    const whereEcriture = { statut: 'validee' };
    if (date_debut && date_fin)
      whereEcriture.date_ecriture = { [Op.between]: [date_debut, date_fin] };

    const whereLigne = {};
    if (compte) {
      const compteRecord = await PlanComptable.findOne({ where: { compte } });
      if (compteRecord) whereLigne.compte_id = compteRecord.id;
    }

    const data = await LigneEcriture.findAll({
      where: whereLigne,
      include: [
        {
          model: EcritureComptable,
          as: 'ecriture',
          where: whereEcriture,
          include: [{ model: JournalComptable, as: 'journal' }],
        },
        { model: PlanComptable, as: 'compte' },
      ],
      order: [[{ model: EcritureComptable, as: 'ecriture' }, 'date_ecriture', 'ASC']],
    });

    let solde = 0;
    const lignes = data.map((l) => {
      solde += parseFloat(l.debit) - parseFloat(l.credit);
      return { ...l.toJSON(), solde_cumule: solde };
    });

    res.json({ success: true, data: lignes });
  } catch (err) {
    next(err);
  }
}

async function balance(req, res, next) {
  try {
    const { exercice_id } = req.query;
    const data = await LigneEcriture.findAll({
      include: [
        {
          model: EcritureComptable,
          as: 'ecriture',
          where: { statut: 'validee' },
          required: true,
        },
        {
          model: PlanComptable,
          as: 'compte',
          attributes: ['compte', 'libelle', 'classe', 'type'],
        },
      ],
      attributes: [
        'compte_id',
        [sequelize.fn('SUM', sequelize.col('debit')), 'total_debit'],
        [sequelize.fn('SUM', sequelize.col('credit')), 'total_credit'],
      ],
      group: ['compte_id'],
      raw: false,
    });
    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
}

async function fromEngagement(req, res, next) {
  const t = await sequelize.transaction();
  try {
    const {
      code_compte_debit,
      code_compte_credit,
      montant,
      libelle,
      reference,
      dossier_ref,
      dossier_id,
      journal_code,
      date_ecriture,
    } = req.body;

    if (!code_compte_debit || !code_compte_credit || !montant) {
      await t.rollback();
      return res.status(400).json({
        success: false,
        message: 'code_compte_debit, code_compte_credit et montant sont requis',
      });
    }
    const m = parseFloat(montant);
    if (!m || m <= 0) {
      await t.rollback();
      return res.status(400).json({ success: false, message: 'Montant invalide' });
    }

    const [cD, cC, journal] = await Promise.all([
      PlanComptable.findOne({ where: { compte: String(code_compte_debit) }, transaction: t }),
      PlanComptable.findOne({ where: { compte: String(code_compte_credit) }, transaction: t }),
      JournalComptable.findOne({ where: { code: journal_code || 'JA' }, transaction: t }),
    ]);

    const missing = [];
    if (!cD) missing.push(`compte débit ${code_compte_debit}`);
    if (!cC) missing.push(`compte crédit ${code_compte_credit}`);
    if (!journal) missing.push(`journal ${journal_code || 'JA'}`);
    if (missing.length) {
      await t.rollback();
      return res.status(404).json({
        success: false,
        message: 'Référentiel comptable incomplet : ' + missing.join(', '),
      });
    }

    const ecriture = await EcritureComptable.create({
      journal_id: journal.id,
      dossier_id: dossier_id || null,
      reference: reference || null,
      date_ecriture: date_ecriture || new Date().toISOString().slice(0, 10),
      libelle: libelle || `Engagement ${reference || ''}`.trim(),
      numero_piece: dossier_ref || null,
      statut: 'brouillon',
      saisie_par: req.user && req.user.id,
    }, { transaction: t });

    await LigneEcriture.bulkCreate([
      { ecriture_id: ecriture.id, compte_id: cD.id, libelle_ligne: libelle || '', debit:  m, credit: 0 },
      { ecriture_id: ecriture.id, compte_id: cC.id, libelle_ligne: libelle || '', debit:  0, credit: m },
    ], { transaction: t });

    await t.commit();
    try {
      await auditService.log(req.user && req.user.id, 'comptabilite:auto_engagement',
        'ecriture', ecriture.id,
        { compte_debit: code_compte_debit, compte_credit: code_compte_credit, montant: m, dossier_ref });
    } catch (_) {}

    const full = await EcritureComptable.findByPk(ecriture.id, {
      include: [
        { model: LigneEcriture, as: 'lignes', include: [{ model: PlanComptable, as: 'compte' }] },
        { model: JournalComptable, as: 'journal' },
      ],
    });
    res.status(201).json({ success: true, data: full });
  } catch (err) {
    try { await t.rollback(); } catch (_) {}
    next(err);
  }
}

async function ecrituresByDossierRef(req, res, next) {
  try {
    const ref = req.params.ref;
    const rows = await EcritureComptable.findAll({
      where: { numero_piece: ref },
      include: [
        { model: LigneEcriture, as: 'lignes', include: [{ model: PlanComptable, as: 'compte' }] },
        { model: JournalComptable, as: 'journal' },
      ],
      order: [['date_ecriture', 'DESC'], ['id', 'DESC']],
    });
    res.json({ success: true, data: rows });
  } catch (err) { next(err); }
}

module.exports = {
  listPlanComptable,
  listJournaux,
  listEcritures,
  createEcriture,
  fromEngagement,
  ecrituresByDossierRef,
  showEcriture,
  validerEcriture,
  grandLivre,
  balance,
};
