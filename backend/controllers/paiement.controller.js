const {
  Facture,
  Liquidation,
  OrdrePaiement,
  Paiement,
  Dossier,
  Fournisseur,
  Beneficiaire,
  WorkflowTransition,
  sequelize,
} = require('../models');
const referenceService = require('../services/reference.service');
const budgetService = require('../services/budget.service');
const auditService = require('../services/audit.service');

// ─── Factures ─────────────────────────────────────────────────────────────────
async function listFactures(req, res, next) {
  try {
    const where = req.query.dossier_id ? { dossier_id: req.query.dossier_id } : {};
    const data = await Facture.findAll({
      where,
      include: [
        { model: Dossier, as: 'dossier', attributes: ['id', 'reference', 'objet'] },
        { model: Fournisseur, as: 'fournisseur', attributes: ['id', 'raison_sociale'] },
      ],
      order: [['date_reception', 'DESC']],
    });
    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
}

async function createFacture(req, res, next) {
  try {
    if (req.body.dossier_id) {
      const dossier = await Dossier.findByPk(req.body.dossier_id);
      if (!dossier) return res.status(404).json({ success: false, message: 'Dossier introuvable' });
      if (!['service_fait', 'liquide', 'ordonnance'].includes(dossier.statut)) {
        return res
          .status(400)
          .json({
            success: false,
            message: `Une facture ne peut être enregistrée que sur un dossier "service_fait" (statut actuel : "${dossier.statut}")`,
          });
      }
    }
    const data = await Facture.create(req.body);
    await auditService.log(req.user.id, 'paiement:create_facture', 'facture', data.id, {
      new: { dossier_id: data.dossier_id, montant: data.montant },
    });
    res.status(201).json({ success: true, data });
  } catch (err) {
    next(err);
  }
}

async function showFacture(req, res, next) {
  try {
    const data = await Facture.findByPk(req.params.id, {
      include: [
        { model: Dossier, as: 'dossier' },
        { model: Fournisseur, as: 'fournisseur' },
      ],
    });
    if (!data) return res.status(404).json({ success: false, message: 'Facture introuvable' });
    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
}

async function verifierFacture(req, res, next) {
  try {
    const f = await Facture.findByPk(req.params.id);
    if (!f) return res.status(404).json({ success: false, message: 'Facture introuvable' });
    if (f.statut !== 'en_attente') {
      return res
        .status(400)
        .json({
          success: false,
          message: `Seule une facture "en_attente" peut être vérifiée (statut actuel : "${f.statut}")`,
        });
    }
    await f.update({ statut: 'verifie', verifie_par: req.user.id });
    await auditService.log(req.user.id, 'paiement:verifier_facture', 'facture', f.id, {
      old: { statut: 'en_attente' },
      new: { statut: 'verifie' },
    });
    res.json({ success: true, data: f });
  } catch (err) {
    next(err);
  }
}

// ─── Liquidations ─────────────────────────────────────────────────────────────
async function listLiquidations(req, res, next) {
  try {
    const data = await Liquidation.findAll({
      include: [{ model: Dossier, as: 'dossier', attributes: ['id', 'reference', 'objet'] }],
      order: [['date_liquidation', 'DESC']],
    });
    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
}

async function createLiquidation(req, res, next) {
  const t = await sequelize.transaction();
  try {
    const dossier = await Dossier.findByPk(req.body.dossier_id);
    if (!dossier) {
      await t.rollback();
      return res.status(404).json({ success: false, message: 'Dossier introuvable' });
    }
    if (dossier.statut !== 'service_fait') {
      await t.rollback();
      return res
        .status(400)
        .json({
          success: false,
          message: `La liquidation nécessite un dossier "service_fait" (statut actuel : "${dossier.statut}")`,
        });
    }

    const reference = await referenceService.generateLiquidationRef();
    const data = await Liquidation.create(
      { ...req.body, reference, liquide_par: req.user.id },
      { transaction: t }
    );

    if (dossier.ligne_budgetaire_id) {
      await budgetService.liquider(dossier.ligne_budgetaire_id, req.body.montant_liquide, t);
    }
    await dossier.update(
      {
        montant_liquide:
          parseFloat(dossier.montant_liquide || 0) + parseFloat(req.body.montant_liquide),
      },
      { transaction: t }
    );

    await auditService.log(req.user.id, 'paiement:liquidation', 'liquidation', data.id, {
      new: { reference, montant: req.body.montant_liquide },
    });
    await t.commit();
    res.status(201).json({ success: true, data });
  } catch (err) {
    await t.rollback();
    next(err);
  }
}

// ─── Ordres de paiement ───────────────────────────────────────────────────────
async function listOP(req, res, next) {
  try {
    const data = await OrdrePaiement.findAll({
      include: [
        { model: Dossier, as: 'dossier', attributes: ['id', 'reference', 'objet'] },
        { model: Fournisseur, as: 'fournisseur', attributes: ['id', 'raison_sociale'] },
        { model: Beneficiaire, as: 'beneficiaire', attributes: ['id', 'nom', 'prenom'] },
      ],
      order: [['date_emission', 'DESC']],
    });
    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
}

async function createOP(req, res, next) {
  try {
    const reference = await referenceService.generateOrdrePaiementRef();
    const data = await OrdrePaiement.create({ ...req.body, reference, emis_par: req.user.id });
    await auditService.log(req.user.id, 'paiement:create_op', 'ordre_paiement', data.id, {
      new: { reference },
    });
    res.status(201).json({ success: true, data });
  } catch (err) {
    next(err);
  }
}

async function showOP(req, res, next) {
  try {
    const data = await OrdrePaiement.findByPk(req.params.id, {
      include: [
        { model: Dossier, as: 'dossier' },
        { model: Liquidation, as: 'liquidation' },
        { model: Fournisseur, as: 'fournisseur' },
        { model: Beneficiaire, as: 'beneficiaire' },
        { model: Paiement, as: 'paiements' },
      ],
    });
    if (!data) return res.status(404).json({ success: false, message: 'OP introuvable' });
    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
}

async function signerOP(req, res, next) {
  try {
    const op = await OrdrePaiement.findByPk(req.params.id);
    if (!op) return res.status(404).json({ success: false, message: 'OP introuvable' });
    if (!['brouillon', 'soumis'].includes(op.statut)) {
      return res
        .status(400)
        .json({
          success: false,
          message: `Seul un OP "brouillon" ou "soumis" peut être signé (statut actuel : "${op.statut}")`,
        });
    }
    await op.update({ statut: 'emis', signe_par: req.user.id });
    await auditService.log(req.user.id, 'paiement:signer_op', 'ordre_paiement', op.id, {
      old: { statut: op.statut },
      new: { statut: 'emis' },
    });
    res.json({ success: true, data: op });
  } catch (err) {
    next(err);
  }
}

// ─── Paiements ────────────────────────────────────────────────────────────────
async function createPaiement(req, res, next) {
  const t = await sequelize.transaction();
  try {
    const op = await OrdrePaiement.findByPk(req.body.ordre_paiement_id, {
      include: [{ model: Dossier, as: 'dossier' }],
      transaction: t,
    });
    if (!op) {
      await t.rollback();
      return res.status(404).json({ success: false, message: 'OP introuvable' });
    }
    if (op.statut !== 'emis') {
      await t.rollback();
      return res
        .status(400)
        .json({
          success: false,
          message: `L'OP doit être signé ("emis") pour enregistrer un paiement (statut actuel : "${op.statut}")`,
        });
    }
    if (!op.dossier || op.dossier.statut !== 'ordonnance') {
      await t.rollback();
      return res
        .status(400)
        .json({
          success: false,
          message: `Le dossier doit être "ordonnance" pour être payé (statut actuel : "${op.dossier?.statut}")`,
        });
    }

    const p = await Paiement.create({ ...req.body, saisie_par: req.user.id }, { transaction: t });
    await op.update({ statut: 'execute' }, { transaction: t });

    if (op.dossier.ligne_budgetaire_id) {
      await budgetService.payer(op.dossier.ligne_budgetaire_id, req.body.montant_paye, t);
    }
    await op.dossier.update(
      {
        statut: 'paye',
        montant_paye: parseFloat(op.dossier.montant_paye || 0) + parseFloat(req.body.montant_paye),
      },
      { transaction: t }
    );

    // Enregistrement de la transition workflow dans la transaction
    await WorkflowTransition.create(
      {
        dossier_id: op.dossier.id,
        from_status: 'ordonnance',
        to_status: 'paye',
        comment: null,
        transitioned_by: req.user.id,
      },
      { transaction: t }
    );

    await t.commit();

    await auditService.log(req.user.id, 'workflow:ordonnance->paye', 'dossier', op.dossier.id, {
      old: { statut: 'ordonnance' },
      new: { statut: 'paye' },
    });
    await auditService.log(req.user.id, 'paiement:payer', 'paiement', p.id, { new: req.body });

    res.status(201).json({ success: true, data: p });
  } catch (err) {
    await t.rollback();
    next(err);
  }
}

async function listPaiements(req, res, next) {
  try {
    const data = await Paiement.findAll({
      include: [
        {
          model: OrdrePaiement,
          as: 'ordre_paiement',
          include: [{ model: Dossier, as: 'dossier', attributes: ['id', 'reference'] }],
        },
      ],
      order: [['date_paiement', 'DESC']],
    });
    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  listFactures,
  createFacture,
  showFacture,
  verifierFacture,
  listLiquidations,
  createLiquidation,
  listOP,
  createOP,
  showOP,
  signerOP,
  createPaiement,
  listPaiements,
};
