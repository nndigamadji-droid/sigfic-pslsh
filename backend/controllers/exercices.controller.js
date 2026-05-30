const { Exercice, LigneBudgetaire, Dossier } = require('../models');
const auditService = require('../services/audit.service');

async function list(req, res, next) {
  try {
    const exercices = await Exercice.findAll({ order: [['annee', 'DESC']] });
    res.json({ success: true, data: exercices });
  } catch (err) {
    next(err);
  }
}

async function create(req, res, next) {
  try {
    const { annee, libelle, date_debut, date_fin } = req.body;
    const exercice = await Exercice.create({
      annee,
      libelle,
      date_debut,
      date_fin,
      created_by: req.user.id,
    });
    await auditService.log(req.user.id, 'exercices:create', 'exercice', exercice.id, {
      new: { annee },
    });
    res.status(201).json({ success: true, data: exercice });
  } catch (err) {
    next(err);
  }
}

async function show(req, res, next) {
  try {
    const e = await Exercice.findByPk(req.params.id, {
      include: [{ model: LigneBudgetaire, as: 'lignes_budgetaires' }],
    });
    if (!e) return res.status(404).json({ success: false, message: 'Exercice introuvable' });
    res.json({ success: true, data: e });
  } catch (err) {
    next(err);
  }
}

async function update(req, res, next) {
  try {
    const e = await Exercice.findByPk(req.params.id);
    if (!e) return res.status(404).json({ success: false, message: 'Exercice introuvable' });
    await e.update(req.body);
    await auditService.log(req.user.id, 'exercices:update', 'exercice', e.id, { new: req.body });
    res.json({ success: true, data: e });
  } catch (err) {
    next(err);
  }
}

async function clore(req, res, next) {
  try {
    const e = await Exercice.findByPk(req.params.id);
    if (!e) return res.status(404).json({ success: false, message: 'Exercice introuvable' });
    if (e.statut === 'clos')
      return res.status(400).json({ success: false, message: 'Exercice déjà clôturé' });
    await e.update({ statut: 'clos' });
    await auditService.log(req.user.id, 'exercices:clore', 'exercice', e.id, {});
    res.json({ success: true, message: 'Exercice clôturé avec succès' });
  } catch (err) {
    next(err);
  }
}

module.exports = { list, create, show, update, clore };
