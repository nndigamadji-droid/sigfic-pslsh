const {
  Reception,
  LigneReception,
  AttestationServiceFait,
  Dossier,
  BonCommande,
  User,
} = require('../models');
const referenceService = require('../services/reference.service');
const auditService = require('../services/audit.service');

async function listReceptions(req, res, next) {
  try {
    const data = await Reception.findAll({
      include: [
        { model: Dossier, as: 'dossier', attributes: ['id', 'reference', 'objet'] },
        { model: BonCommande, as: 'bon_commande', attributes: ['id', 'reference'] },
      ],
      order: [['date_reception', 'DESC']],
    });
    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
}

async function createReception(req, res, next) {
  try {
    const { lignes, ...recData } = req.body;
    const reception = await Reception.create({ ...recData, created_by: req.user.id });
    if (lignes && lignes.length > 0) {
      await LigneReception.bulkCreate(lignes.map((l) => ({ ...l, reception_id: reception.id })));
    }
    await auditService.log(req.user.id, 'receptions:create', 'reception', reception.id, {
      new: recData,
    });
    res.status(201).json({ success: true, data: reception });
  } catch (err) {
    next(err);
  }
}

async function showReception(req, res, next) {
  try {
    const data = await Reception.findByPk(req.params.id, {
      include: [
        { model: Dossier, as: 'dossier' },
        { model: LigneReception, as: 'lignes' },
      ],
    });
    if (!data) return res.status(404).json({ success: false, message: 'Réception introuvable' });
    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
}

async function validerReception(req, res, next) {
  try {
    const r = await Reception.findByPk(req.params.id);
    if (!r) return res.status(404).json({ success: false, message: 'Réception introuvable' });
    await r.update({ statut: 'valide' });
    await auditService.log(req.user.id, 'receptions:valider', 'reception', r.id, {});
    res.json({ success: true, data: r, message: 'Réception validée' });
  } catch (err) {
    next(err);
  }
}

// ─── Attestations de service fait ─────────────────────────────────────────────
async function listASF(req, res, next) {
  try {
    const data = await AttestationServiceFait.findAll({
      include: [{ model: Dossier, as: 'dossier', attributes: ['id', 'reference', 'objet'] }],
      order: [['createdAt', 'DESC']],
    });
    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
}

async function createASF(req, res, next) {
  try {
    const reference = await referenceService.generateASFRef();
    const data = await AttestationServiceFait.create({
      ...req.body,
      reference,
      created_by: req.user.id,
    });
    await auditService.log(req.user.id, 'receptions:create_asf', 'attestation', data.id, {
      new: { reference },
    });
    res.status(201).json({ success: true, data });
  } catch (err) {
    next(err);
  }
}

async function signerASF(req, res, next) {
  try {
    const asf = await AttestationServiceFait.findByPk(req.params.id);
    if (!asf) return res.status(404).json({ success: false, message: 'ASF introuvable' });
    await asf.update({ statut: 'signe', agent_validateur_id: req.user.id });
    await auditService.log(req.user.id, 'receptions:signer_asf', 'attestation', asf.id, {});
    res.json({ success: true, data: asf, message: 'ASF signée' });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  listReceptions,
  createReception,
  showReception,
  validerReception,
  listASF,
  createASF,
  signerASF,
};
