const {
  LigneBudgetaire,
  Dossier,
  Paiement,
  OrdrePaiement,
  EcritureComptable,
  LigneEcriture,
  PlanComptable,
  SourceFinancement,
  Exercice,
  Activite,
  sequelize,
} = require('../models');
const { Op } = require('sequelize');

async function suiviBudgetaire(req, res, next) {
  try {
    const { exercice_id } = req.query;
    const where = exercice_id ? { exercice_id } : {};
    const data = await LigneBudgetaire.findAll({
      where,
      include: [
        {
          model: require('../models/RubriqueBudgetaire'),
          as: 'rubrique',
          attributes: ['code', 'libelle'],
        },
        { model: SourceFinancement, as: 'source', attributes: ['code', 'libelle'] },
        { model: Activite, as: 'activite', attributes: ['code', 'libelle'] },
      ],
      order: [['id', 'ASC']],
    });
    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
}

async function executionFinanciere(req, res, next) {
  try {
    const { exercice_id } = req.query;
    const where = exercice_id ? { exercice_id } : {};
    const data = await Dossier.findAll({
      where,
      attributes: [
        'statut',
        'type_depense',
        [sequelize.fn('COUNT', sequelize.col('id')), 'nb_dossiers'],
        [sequelize.fn('SUM', sequelize.col('montant_estime')), 'total_estime'],
        [sequelize.fn('SUM', sequelize.col('montant_engage')), 'total_engage'],
        [sequelize.fn('SUM', sequelize.col('montant_liquide')), 'total_liquide'],
        [sequelize.fn('SUM', sequelize.col('montant_paye')), 'total_paye'],
      ],
      group: ['statut', 'type_depense'],
      raw: true,
    });
    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
}

async function compteGestion(req, res, next) {
  try {
    const { exercice_id } = req.query;
    // Synthèse charges vs produits
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
    });
    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
}

async function kpis(req, res, next) {
  try {
    const dashboardService = require('../services/dashboard.service');
    const data = await dashboardService.getKPIs(req.query.exercice_id || null);
    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
}

module.exports = { suiviBudgetaire, executionFinanciere, compteGestion, kpis };
