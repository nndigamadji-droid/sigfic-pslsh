const {
  Dossier,
  Exercice,
  Activite,
  LigneBudgetaire,
  SourceFinancement,
  User,
  Attribution,
  BonCommande,
  Reception,
  Facture,
  Liquidation,
  OrdrePaiement,
  Document,
  WorkflowTransition,
  ExpressionBesoin,
  EcritureComptable,
  Controle,
  Anomalie,
} = require('../models');
const workflowService = require('../services/workflow.service');
const referenceService = require('../services/reference.service');
const budgetService = require('../services/budget.service');
const auditService = require('../services/audit.service');
const { TRANSITIONS } = require('../config/workflow');

async function list(req, res, next) {
  try {
    const where = {};
    if (req.query.statut) where.statut = req.query.statut;
    if (req.query.exercice_id) where.exercice_id = req.query.exercice_id;
    if (req.query.activite_id) where.activite_id = req.query.activite_id;

    const dossiers = await Dossier.findAll({
      where,
      include: [
        { model: Exercice, as: 'exercice', attributes: ['id', 'annee'] },
        { model: Activite, as: 'activite', attributes: ['id', 'code', 'libelle'] },
        {
          model: LigneBudgetaire,
          as: 'ligne_budgetaire',
          attributes: ['id', 'libelle', 'montant_revise', 'montant_engage'],
        },
        { model: User, as: 'createur', attributes: ['id', 'nom', 'prenom'] },
      ],
      order: [['createdAt', 'DESC']],
    });
    res.json({ success: true, data: dossiers });
  } catch (err) {
    next(err);
  }
}

async function create(req, res, next) {
  try {
    const {
      exercice_id,
      activite_id,
      ligne_budgetaire_id,
      source_financement_id,
      objet,
      type_depense,
      montant_estime,
    } = req.body;

    if (ligne_budgetaire_id && montant_estime) {
      const { suffisant } = await budgetService.checkAvailability(
        ligne_budgetaire_id,
        montant_estime
      );
      if (!suffisant)
        return res
          .status(400)
          .json({ success: false, message: 'Crédits budgétaires insuffisants' });
    }

    const reference = await referenceService.generateDossierRef(
      exercice_id ? (await Exercice.findByPk(exercice_id))?.annee : null
    );

    const dossier = await Dossier.create({
      reference,
      exercice_id,
      activite_id,
      ligne_budgetaire_id,
      source_financement_id,
      objet,
      type_depense,
      montant_estime: montant_estime || 0,
      created_by: req.user.id,
    });

    await auditService.log(req.user.id, 'dossiers:create', 'dossier', dossier.id, {
      new: { reference, objet },
    });
    res.status(201).json({ success: true, data: dossier });
  } catch (err) {
    next(err);
  }
}

async function show(req, res, next) {
  try {
    const dossier = await Dossier.findByPk(req.params.id, {
      include: [
        { model: Exercice, as: 'exercice' },
        { model: Activite, as: 'activite' },
        { model: LigneBudgetaire, as: 'ligne_budgetaire' },
        { model: SourceFinancement, as: 'source_financement' },
        { model: User, as: 'createur', attributes: ['id', 'nom', 'prenom'] },
        { model: ExpressionBesoin, as: 'besoins' },
        {
          model: Attribution,
          as: 'attribution',
          include: [{ model: require('../models/Fournisseur'), as: 'fournisseur' }],
        },
        { model: BonCommande, as: 'bons_commande' },
        { model: Reception, as: 'receptions' },
        { model: Facture, as: 'factures' },
        { model: Liquidation, as: 'liquidation' },
        { model: OrdrePaiement, as: 'ordre_paiement' },
        {
          model: Document,
          as: 'documents',
          include: [{ model: require('../models/DocumentType'), as: 'type' }],
        },
        { model: Controle, as: 'controles' },
        { model: Anomalie, as: 'anomalies' },
        {
          model: WorkflowTransition,
          as: 'transitions',
          include: [{ model: User, as: 'agent', attributes: ['nom', 'prenom'] }],
        },
      ],
    });
    if (!dossier) return res.status(404).json({ success: false, message: 'Dossier introuvable' });

    // Transitions disponibles
    const transitions_possibles = TRANSITIONS[dossier.statut] || [];
    res.json({ success: true, data: { ...dossier.toJSON(), transitions_possibles } });
  } catch (err) {
    next(err);
  }
}

async function update(req, res, next) {
  try {
    const dossier = await Dossier.findByPk(req.params.id);
    if (!dossier) return res.status(404).json({ success: false, message: 'Dossier introuvable' });
    if (!['brouillon', 'rejete'].includes(dossier.statut)) {
      return res
        .status(400)
        .json({
          success: false,
          message: 'Seuls les dossiers en brouillon/rejeté peuvent être modifiés',
        });
    }
    const old = dossier.toJSON();
    await dossier.update(req.body);
    await auditService.log(req.user.id, 'dossiers:update', 'dossier', dossier.id, {
      old,
      new: req.body,
    });
    res.json({ success: true, data: dossier });
  } catch (err) {
    next(err);
  }
}

async function destroy(req, res, next) {
  try {
    const dossier = await Dossier.findByPk(req.params.id);
    if (!dossier) return res.status(404).json({ success: false, message: 'Dossier introuvable' });
    if (dossier.statut !== 'brouillon') {
      return res
        .status(400)
        .json({
          success: false,
          message: 'Seuls les dossiers en brouillon peuvent être supprimés',
        });
    }
    await dossier.destroy();
    await auditService.log(req.user.id, 'dossiers:delete', 'dossier', dossier.id, {});
    res.json({ success: true, message: 'Dossier supprimé' });
  } catch (err) {
    next(err);
  }
}

async function doTransition(req, res, next) {
  try {
    const { to_statut, comment } = req.body;
    const dossier = await workflowService.transition(
      req.params.id,
      to_statut,
      req.user.id,
      comment
    );
    res.json({ success: true, data: dossier, message: `Dossier passé à l'état: ${to_statut}` });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
}

async function getWorkflowHistory(req, res, next) {
  try {
    const history = await workflowService.getHistory(req.params.id);
    res.json({ success: true, data: history });
  } catch (err) {
    next(err);
  }
}

module.exports = { list, create, show, update, destroy, doTransition, getWorkflowHistory };
