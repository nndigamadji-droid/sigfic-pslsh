const { LigneBudgetaire, sequelize } = require('../models');

async function checkAvailability(ligneBudgetaireId, montant) {
  const ligne = await LigneBudgetaire.findByPk(ligneBudgetaireId);
  if (!ligne) throw new Error('Ligne budgétaire introuvable');

  const budget = parseFloat(ligne.montant_revise) || parseFloat(ligne.montant_initial) || 0;
  const engage = parseFloat(ligne.montant_engage) || 0;
  const disponible = budget - engage;

  return {
    budget,
    engage,
    disponible,
    suffisant: disponible >= parseFloat(montant),
  };
}

async function engager(ligneBudgetaireId, montant, transaction) {
  const opts = transaction ? { transaction } : {};
  const ligne = await LigneBudgetaire.findByPk(ligneBudgetaireId, { ...opts, lock: true });
  if (!ligne) throw new Error('Ligne budgétaire introuvable');

  // Vérification sur la ligne déjà verrouillée (évite la race condition TOCTOU)
  const budget = parseFloat(ligne.montant_revise) || parseFloat(ligne.montant_initial) || 0;
  const engage = parseFloat(ligne.montant_engage) || 0;
  const disponible = budget - engage;
  if (disponible < parseFloat(montant)) throw new Error('Crédits budgétaires insuffisants');

  await ligne.update({ montant_engage: engage + parseFloat(montant) }, opts);
  return ligne;
}

async function liberer(ligneBudgetaireId, montant, transaction) {
  const opts = transaction ? { transaction } : {};
  const ligne = await LigneBudgetaire.findByPk(ligneBudgetaireId, opts);
  if (!ligne) return;
  const newEngage = Math.max(0, parseFloat(ligne.montant_engage) - parseFloat(montant));
  await ligne.update({ montant_engage: newEngage }, opts);
}

async function liquider(ligneBudgetaireId, montant, transaction) {
  const opts = transaction ? { transaction } : {};
  const ligne = await LigneBudgetaire.findByPk(ligneBudgetaireId, opts);
  if (!ligne) throw new Error('Ligne budgétaire introuvable');
  await ligne.update(
    { montant_liquide: parseFloat(ligne.montant_liquide) + parseFloat(montant) },
    opts
  );
}

async function payer(ligneBudgetaireId, montant, transaction) {
  const opts = transaction ? { transaction } : {};
  const ligne = await LigneBudgetaire.findByPk(ligneBudgetaireId, opts);
  if (!ligne) return;
  await ligne.update({ montant_paye: parseFloat(ligne.montant_paye) + parseFloat(montant) }, opts);
}

module.exports = { checkAvailability, engager, liberer, liquider, payer };
