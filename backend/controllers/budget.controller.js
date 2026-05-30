const {
  LigneBudgetaire,
  RubriqueBudgetaire,
  SourceFinancement,
  Exercice,
  Activite,
  sequelize,
} = require('../models');
const budgetService = require('../services/budget.service');
const auditService = require('../services/audit.service');
const { Op } = require('sequelize');

// ─── Sources de financement ───────────────────────────────────────────────────
async function listSources(req, res, next) {
  try {
    const data = await SourceFinancement.findAll({ order: [['code', 'ASC']] });
    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
}

async function createSource(req, res, next) {
  try {
    const data = await SourceFinancement.create(req.body);
    res.status(201).json({ success: true, data });
  } catch (err) {
    next(err);
  }
}

async function showSource(req, res, next) {
  try {
    const data = await SourceFinancement.findByPk(req.params.id);
    if (!data) return res.status(404).json({ success: false, message: 'Source introuvable' });
    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
}

async function updateSource(req, res, next) {
  try {
    const src = await SourceFinancement.findByPk(req.params.id);
    if (!src) return res.status(404).json({ success: false, message: 'Source introuvable' });
    await src.update(req.body);
    res.json({ success: true, data: src });
  } catch (err) {
    next(err);
  }
}

// ─── Rubriques budgétaires ────────────────────────────────────────────────────
async function listRubriques(req, res, next) {
  try {
    const data = await RubriqueBudgetaire.findAll({ order: [['code', 'ASC']] });
    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
}

async function createRubrique(req, res, next) {
  try {
    const data = await RubriqueBudgetaire.create(req.body);
    res.status(201).json({ success: true, data });
  } catch (err) {
    next(err);
  }
}

// ─── Lignes budgétaires ───────────────────────────────────────────────────────
async function listLignes(req, res, next) {
  try {
    const where = {};
    if (req.query.exercice_id) where.exercice_id = req.query.exercice_id;
    if (req.query.source_id) where.source_financement_id = req.query.source_id;

    const data = await LigneBudgetaire.findAll({
      where,
      include: [
        { model: RubriqueBudgetaire, as: 'rubrique', attributes: ['id', 'code', 'libelle'] },
        { model: SourceFinancement, as: 'source', attributes: ['id', 'code', 'libelle'] },
        { model: Exercice, as: 'exercice', attributes: ['id', 'annee'] },
        { model: Activite, as: 'activite', attributes: ['id', 'code', 'libelle'] },
      ],
      order: [['id', 'ASC']],
    });
    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
}

async function createLigne(req, res, next) {
  try {
    const ligne = await LigneBudgetaire.create({ ...req.body, created_by: req.user.id });
    await auditService.log(req.user.id, 'budget:create_ligne', 'ligne_budgetaire', ligne.id, {
      new: req.body,
    });
    res.status(201).json({ success: true, data: ligne });
  } catch (err) {
    next(err);
  }
}

async function showLigne(req, res, next) {
  try {
    const ligne = await LigneBudgetaire.findByPk(req.params.id, {
      include: [
        { model: RubriqueBudgetaire, as: 'rubrique' },
        { model: SourceFinancement, as: 'source' },
      ],
    });
    if (!ligne)
      return res.status(404).json({ success: false, message: 'Ligne budgétaire introuvable' });
    res.json({ success: true, data: ligne });
  } catch (err) {
    next(err);
  }
}

async function updateLigne(req, res, next) {
  try {
    const ligne = await LigneBudgetaire.findByPk(req.params.id);
    if (!ligne)
      return res.status(404).json({ success: false, message: 'Ligne budgétaire introuvable' });
    await ligne.update(req.body);
    await auditService.log(req.user.id, 'budget:update_ligne', 'ligne_budgetaire', ligne.id, {
      new: req.body,
    });
    res.json({ success: true, data: ligne });
  } catch (err) {
    next(err);
  }
}

async function checkDisponibilite(req, res, next) {
  try {
    const { montant } = req.query;
    const result = await budgetService.checkAvailability(req.params.id, montant || 0);
    res.json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
}

async function amender(req, res, next) {
  try {
    const { montant_revise, motif } = req.body;
    const ligne = await LigneBudgetaire.findByPk(req.params.id);
    if (!ligne)
      return res.status(404).json({ success: false, message: 'Ligne budgétaire introuvable' });
    const old = { montant_revise: ligne.montant_revise };
    await ligne.update({ montant_revise });
    await auditService.log(req.user.id, 'budget:amender', 'ligne_budgetaire', ligne.id, {
      old,
      new: { montant_revise, motif },
    });
    res.json({ success: true, data: ligne, message: 'Budget amendé avec succès' });
  } catch (err) {
    next(err);
  }
}

// Suivi budgétaire global
async function suiviBudgetaire(req, res, next) {
  try {
    const where = {};
    if (req.query.exercice_id) where.exercice_id = req.query.exercice_id;

    const data = await LigneBudgetaire.findAll({
      where,
      include: [
        { model: RubriqueBudgetaire, as: 'rubrique', attributes: ['code', 'libelle'] },
        { model: SourceFinancement, as: 'source', attributes: ['code', 'libelle'] },
      ],
      attributes: [
        'id',
        'libelle',
        'exercice_id',
        'rubrique_id',
        'source_financement_id',
        'montant_initial',
        'montant_revise',
        'montant_engage',
        'montant_liquide',
        'montant_paye',
        [
          sequelize.literal('ROUND((montant_paye * 100.0 / NULLIF(montant_revise, 0)), 2)'),
          'taux_execution',
        ],
      ],
      order: [['id', 'ASC']],
    });
    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  listSources,
  createSource,
  showSource,
  updateSource,
  listRubriques,
  createRubrique,
  listLignes,
  createLigne,
  showLigne,
  updateLigne,
  checkDisponibilite,
  amender,
  suiviBudgetaire,
};
