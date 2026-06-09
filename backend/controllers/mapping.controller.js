const { BudgetComptaMapping } = require('../models');

async function list(req, res, next) {
  try {
    const where = {};
    if (req.query.sens) where.sens_flux = req.query.sens;
    if (req.query.compte) where.compte_syscohada = req.query.compte;
    const rows = await BudgetComptaMapping.findAll({
      where, order: [['code_ligne_budget', 'ASC']],
    });
    res.json({ success: true, data: rows });
  } catch (err) { next(err); }
}

async function findByCode(req, res, next) {
  try {
    const row = await BudgetComptaMapping.findOne({
      where: { code_ligne_budget: req.params.code, statut_lien: true },
    });
    if (!row) return res.status(404).json({ success: false, message: 'Mapping introuvable' });
    res.json({ success: true, data: row });
  } catch (err) { next(err); }
}

async function create(req, res, next) {
  try {
    const { code_ligne_budget, compte_syscohada, sens_flux } = req.body;
    if (!code_ligne_budget || !compte_syscohada) {
      return res.status(400).json({ success: false, message: 'code_ligne_budget et compte_syscohada requis' });
    }
    if (sens_flux && !['D', 'C'].includes(sens_flux)) {
      return res.status(400).json({ success: false, message: 'sens_flux doit être D ou C' });
    }
    const row = await BudgetComptaMapping.create({
      ...req.body,
      source: 'manuel',
      created_by: req.user && req.user.id,
    });
    res.status(201).json({ success: true, data: row });
  } catch (err) {
    if (err.name === 'SequelizeUniqueConstraintError') {
      return res.status(409).json({ success: false, message: 'Cette clé budgétaire est déjà mappée' });
    }
    next(err);
  }
}

async function update(req, res, next) {
  try {
    const row = await BudgetComptaMapping.findByPk(req.params.id);
    if (!row) return res.status(404).json({ success: false, message: 'Mapping introuvable' });
    await row.update({
      ...req.body,
      updated_by: req.user && req.user.id,
    });
    res.json({ success: true, data: row });
  } catch (err) { next(err); }
}

async function remove(req, res, next) {
  try {
    const row = await BudgetComptaMapping.findByPk(req.params.id);
    if (!row) return res.status(404).json({ success: false, message: 'Mapping introuvable' });
    await row.update({ statut_lien: false, updated_by: req.user && req.user.id });
    res.json({ success: true, message: 'Mapping désactivé' });
  } catch (err) { next(err); }
}

async function bulkSeed(req, res, next) {
  try {
    const items = Array.isArray(req.body) ? req.body : req.body.items;
    if (!Array.isArray(items)) {
      return res.status(400).json({ success: false, message: 'Tableau d\'éléments requis' });
    }
    const userId = req.user && req.user.id;
    const results = [];
    for (const it of items) {
      if (!it.code_ligne_budget || !it.compte_syscohada) continue;
      const [row, created] = await BudgetComptaMapping.findOrCreate({
        where: { code_ligne_budget: it.code_ligne_budget },
        defaults: {
          compte_syscohada: it.compte_syscohada,
          compte_libelle:   it.compte_libelle,
          sens_flux:        it.sens_flux || 'D',
          source:           it.source || 'auto-classifier',
          derive_score:     it.derive_score || 0,
          created_by:       userId,
        },
      });
      results.push({ code: row.code_ligne_budget, created });
    }
    res.json({
      success: true,
      data: { total: results.length, created: results.filter((r) => r.created).length, items: results },
    });
  } catch (err) { next(err); }
}

module.exports = { list, findByCode, create, update, remove, bulkSeed };
