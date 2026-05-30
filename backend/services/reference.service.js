const {
  Dossier,
  ExpressionBesoin,
  BonCommande,
  DemandeCotation,
  OrdrePaiement,
  Liquidation,
  AttestationServiceFait,
} = require('../models');

async function generateExpressionBesoinRef(exercice) {
  const year = exercice || new Date().getFullYear();
  const count = await ExpressionBesoin.count({
    where: { reference: { [require('sequelize').Op.like]: `EB-${year}-%` } },
    paranoid: false,
  });
  return `EB-${year}-${String(count + 1).padStart(4, '0')}`;
}

async function generateDossierRef(exercice) {
  const year = exercice || new Date().getFullYear();
  const count = await Dossier.count({
    where: { reference: { [require('sequelize').Op.like]: `DOS-${year}-%` } },
    paranoid: false,
  });
  return `DOS-${year}-${String(count + 1).padStart(4, '0')}`;
}

async function generateBonCommandeRef() {
  const year = new Date().getFullYear();
  const count = await BonCommande.count({ paranoid: false });
  return `BC-${year}-${String(count + 1).padStart(4, '0')}`;
}

async function generateDemandeCotationRef() {
  const year = new Date().getFullYear();
  const count = await DemandeCotation.count({ paranoid: false });
  return `DC-${year}-${String(count + 1).padStart(4, '0')}`;
}

async function generateOrdrePaiementRef() {
  const year = new Date().getFullYear();
  const count = await OrdrePaiement.count({ paranoid: false });
  return `OP-${year}-${String(count + 1).padStart(4, '0')}`;
}

async function generateLiquidationRef() {
  const year = new Date().getFullYear();
  const count = await Liquidation.count({ paranoid: false });
  return `LIQ-${year}-${String(count + 1).padStart(4, '0')}`;
}

async function generateASFRef() {
  const year = new Date().getFullYear();
  const count = await AttestationServiceFait.count({ paranoid: false });
  return `ASF-${year}-${String(count + 1).padStart(4, '0')}`;
}

module.exports = {
  generateExpressionBesoinRef,
  generateDossierRef,
  generateBonCommandeRef,
  generateDemandeCotationRef,
  generateOrdrePaiementRef,
  generateLiquidationRef,
  generateASFRef,
};
