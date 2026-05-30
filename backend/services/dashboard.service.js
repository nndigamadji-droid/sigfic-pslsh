const {
  Dossier,
  LigneBudgetaire,
  OrdrePaiement,
  Anomalie,
  Exercice,
  sequelize,
} = require('../models');
const { Op } = require('sequelize');

async function getKPIs(exerciceId) {
  // Dossiers par statut
  const dossiers = await Dossier.findAll({
    where: exerciceId ? { exercice_id: exerciceId } : {},
    attributes: ['statut', [sequelize.fn('COUNT', sequelize.col('id')), 'count']],
    group: ['statut'],
    raw: true,
  });

  // Budget global
  const budget = await LigneBudgetaire.findOne({
    where: exerciceId ? { exercice_id: exerciceId } : {},
    attributes: [
      [sequelize.fn('SUM', sequelize.col('montant_initial')), 'total_initial'],
      [sequelize.fn('SUM', sequelize.col('montant_revise')), 'total_revise'],
      [sequelize.fn('SUM', sequelize.col('montant_engage')), 'total_engage'],
      [sequelize.fn('SUM', sequelize.col('montant_liquide')), 'total_liquide'],
      [sequelize.fn('SUM', sequelize.col('montant_paye')), 'total_paye'],
    ],
    raw: true,
  });

  // Anomalies ouvertes
  const anomaliesOuvertes = await Anomalie.count({ where: { statut: 'ouverte' } });

  // Paiements récents
  const paiementsRecents = await OrdrePaiement.count({
    where: {
      statut: 'execute',
      updatedAt: { [Op.gte]: new Date(Date.now() - 30 * 24 * 3600 * 1000) },
    },
  });

  return { dossiers, budget, anomaliesOuvertes, paiementsRecents };
}

module.exports = { getKPIs };
