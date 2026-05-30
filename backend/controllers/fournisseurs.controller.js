const { Fournisseur, Offre, Attribution, BonCommande } = require('../models');
const auditService = require('../services/audit.service');

async function list(req, res, next) {
  try {
    const data = await Fournisseur.findAll({ order: [['raison_sociale', 'ASC']] });
    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
}

async function create(req, res, next) {
  try {
    const data = await Fournisseur.create(req.body);
    await auditService.log(req.user.id, 'fournisseurs:create', 'fournisseur', data.id, {
      new: req.body,
    });
    res.status(201).json({ success: true, data });
  } catch (err) {
    next(err);
  }
}

async function show(req, res, next) {
  try {
    const data = await Fournisseur.findByPk(req.params.id);
    if (!data) return res.status(404).json({ success: false, message: 'Fournisseur introuvable' });
    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
}

async function update(req, res, next) {
  try {
    const f = await Fournisseur.findByPk(req.params.id);
    if (!f) return res.status(404).json({ success: false, message: 'Fournisseur introuvable' });
    await f.update(req.body);
    await auditService.log(req.user.id, 'fournisseurs:update', 'fournisseur', f.id, {
      new: req.body,
    });
    res.json({ success: true, data: f });
  } catch (err) {
    next(err);
  }
}

module.exports = { list, create, show, update };
