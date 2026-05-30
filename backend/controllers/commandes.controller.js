const {
  BonCommande,
  LigneBonCommande,
  Contrat,
  Dossier,
  Fournisseur,
  Attribution,
  sequelize,
} = require('../models');
const referenceService = require('../services/reference.service');
const auditService = require('../services/audit.service');

// ─── Bons de commande ─────────────────────────────────────────────────────────
async function listBC(req, res, next) {
  try {
    const data = await BonCommande.findAll({
      include: [
        { model: Dossier, as: 'dossier', attributes: ['id', 'reference', 'objet'] },
        { model: Fournisseur, as: 'fournisseur' },
        { model: LigneBonCommande, as: 'lignes' },
      ],
      order: [['createdAt', 'DESC']],
    });
    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
}

async function createBC(req, res, next) {
  const t = await sequelize.transaction();
  try {
    const reference = await referenceService.generateBonCommandeRef();
    const { lignes, ...bcData } = req.body;
    const bc = await BonCommande.create(
      { ...bcData, reference, created_by: req.user.id },
      { transaction: t }
    );

    if (lignes && lignes.length > 0) {
      const montantTotal = lignes.reduce(
        (sum, l) => sum + parseFloat(l.prix_unitaire) * parseFloat(l.quantite),
        0
      );
      await LigneBonCommande.bulkCreate(
        lignes.map((l) => ({
          ...l,
          bon_commande_id: bc.id,
          montant_ligne: parseFloat(l.prix_unitaire) * parseFloat(l.quantite),
        })),
        { transaction: t }
      );
      await bc.update({ montant_total: montantTotal }, { transaction: t });
    }

    await auditService.log(req.user.id, 'commandes:create_bc', 'bon_commande', bc.id, {
      new: { reference },
    });
    await t.commit();
    res.status(201).json({ success: true, data: bc });
  } catch (err) {
    await t.rollback();
    next(err);
  }
}

async function showBC(req, res, next) {
  try {
    const data = await BonCommande.findByPk(req.params.id, {
      include: [
        { model: Dossier, as: 'dossier' },
        { model: Fournisseur, as: 'fournisseur' },
        { model: LigneBonCommande, as: 'lignes' },
      ],
    });
    if (!data) return res.status(404).json({ success: false, message: 'BC introuvable' });
    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
}

async function updateBC(req, res, next) {
  try {
    const bc = await BonCommande.findByPk(req.params.id);
    if (!bc) return res.status(404).json({ success: false, message: 'BC introuvable' });
    await bc.update(req.body);
    res.json({ success: true, data: bc });
  } catch (err) {
    next(err);
  }
}

// ─── Contrats ─────────────────────────────────────────────────────────────────
async function listContrats(req, res, next) {
  try {
    const data = await Contrat.findAll({
      include: [
        { model: Dossier, as: 'dossier', attributes: ['id', 'reference', 'objet'] },
        { model: Fournisseur, as: 'fournisseur' },
      ],
      order: [['createdAt', 'DESC']],
    });
    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
}

async function createContrat(req, res, next) {
  try {
    const data = await Contrat.create({ ...req.body, created_by: req.user.id });
    await auditService.log(req.user.id, 'commandes:create_contrat', 'contrat', data.id, {
      new: req.body,
    });
    res.status(201).json({ success: true, data });
  } catch (err) {
    next(err);
  }
}

async function showContrat(req, res, next) {
  try {
    const data = await Contrat.findByPk(req.params.id, {
      include: [
        { model: Dossier, as: 'dossier' },
        { model: Fournisseur, as: 'fournisseur' },
      ],
    });
    if (!data) return res.status(404).json({ success: false, message: 'Contrat introuvable' });
    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
}

async function updateContrat(req, res, next) {
  try {
    const c = await Contrat.findByPk(req.params.id);
    if (!c) return res.status(404).json({ success: false, message: 'Contrat introuvable' });
    await c.update(req.body);
    res.json({ success: true, data: c });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  listBC,
  createBC,
  showBC,
  updateBC,
  listContrats,
  createContrat,
  showContrat,
  updateContrat,
};
