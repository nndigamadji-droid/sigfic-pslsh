const { Controle, Anomalie, Audit, Recommandation, Dossier, User } = require('../models');
const auditService = require('../services/audit.service');

async function listControles(req, res, next) {
  try {
    const data = await Controle.findAll({
      include: [
        { model: Dossier, as: 'dossier', attributes: ['id', 'reference', 'objet'] },
        { model: User, as: 'controleur', attributes: ['id', 'nom', 'prenom'] },
        { model: Anomalie, as: 'anomalies' },
      ],
      order: [['date_controle', 'DESC']],
    });
    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
}

async function createControle(req, res, next) {
  try {
    const data = await Controle.create({ ...req.body, controleur_id: req.user.id });
    res.status(201).json({ success: true, data });
  } catch (err) {
    next(err);
  }
}

async function updateControle(req, res, next) {
  try {
    const c = await Controle.findByPk(req.params.id);
    if (!c) return res.status(404).json({ success: false, message: 'Contrôle introuvable' });
    await c.update(req.body);
    await auditService.log(req.user.id, 'controle:update', 'controle', c.id, { new: req.body });
    res.json({ success: true, data: c });
  } catch (err) {
    next(err);
  }
}

async function listAnomalies(req, res, next) {
  try {
    const where = {};
    if (req.query.dossier_id) where.dossier_id = req.query.dossier_id;
    if (req.query.statut) where.statut = req.query.statut;
    const data = await Anomalie.findAll({
      where,
      include: [{ model: Dossier, as: 'dossier', attributes: ['id', 'reference', 'objet'] }],
      order: [['createdAt', 'DESC']],
    });
    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
}

async function updateAnomalie(req, res, next) {
  try {
    const a = await Anomalie.findByPk(req.params.id);
    if (!a) return res.status(404).json({ success: false, message: 'Anomalie introuvable' });
    await a.update(req.body);
    res.json({ success: true, data: a });
  } catch (err) {
    next(err);
  }
}

async function listAudits(req, res, next) {
  try {
    const data = await Audit.findAll({
      include: [{ model: Recommandation, as: 'recommandations' }],
      order: [['date_debut', 'DESC']],
    });
    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
}

async function createAudit(req, res, next) {
  try {
    const data = await Audit.create({ ...req.body, created_by: req.user.id });
    res.status(201).json({ success: true, data });
  } catch (err) {
    next(err);
  }
}

async function showAudit(req, res, next) {
  try {
    const data = await Audit.findByPk(req.params.id, {
      include: [{ model: Recommandation, as: 'recommandations' }],
    });
    if (!data) return res.status(404).json({ success: false, message: 'Audit introuvable' });
    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
}

async function listRecommandations(req, res, next) {
  try {
    const where = req.query.audit_id ? { audit_id: req.query.audit_id } : {};
    const data = await Recommandation.findAll({ where, order: [['echeance', 'ASC']] });
    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
}

async function createRecommandation(req, res, next) {
  try {
    const data = await Recommandation.create(req.body);
    res.status(201).json({ success: true, data });
  } catch (err) {
    next(err);
  }
}

async function updateRecommandation(req, res, next) {
  try {
    const r = await Recommandation.findByPk(req.params.id);
    if (!r) return res.status(404).json({ success: false, message: 'Recommandation introuvable' });
    await r.update(req.body);
    res.json({ success: true, data: r });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  listControles,
  createControle,
  updateControle,
  listAnomalies,
  updateAnomalie,
  listAudits,
  createAudit,
  showAudit,
  listRecommandations,
  createRecommandation,
  updateRecommandation,
};
