/**
 * workflow.js — FSM du dossier d'opération SIGFIC-PSLSH
 *
 * ─── Deux circuits coexistent ───────────────────────────────────────────────
 *
 * CIRCUIT A — Dossier issu d'une expression de besoin validée (circuit normal)
 * ─────────────────────────────────────────────────────────────────────────────
 *
 *   [Expression de besoin — statuts gérés dans ExpressionBesoin, hors FSM dossier]
 *       brouillon → soumis → [valide | rejete | a_revoir]
 *
 *   [Dossier généré automatiquement]
 *       dossier_genere
 *         → en_validation_af       ← Centre de validation (Validation 2 — SAF/coord.)
 *         → autorise               ← Autorisé par SAF/coordination
 *         → engage                 ← Dossier officiellement engagé
 *         → cotation_lancee        ← Demande de cotation émise
 *         → offres_recues          ← 3 pro forma minimum enregistrées
 *         → analyse_en_cours       ← Tableau comparatif en cours
 *         → offre_retenue          ← Offre sélectionnée (Validation 3)
 *         → en_imputation          ← Envoyé Budget – Dépenses (Validation 4)
 *         → impute                 ← Ligne disponible, imputation validée
 *         OR
 *         → ligne_insuffisante     ← Ligne insuffisante ou épuisée
 *         → en_revision_budgetaire ← Centre de validation : arbitrage / révision
 *         → [retour vers engage après révision, ou rejete]
 *
 *         → commande               ← Bon de commande émis
 *         → receptionne            ← Bien/service reçu
 *         → service_fait           ← Service fait / attestation signée
 *         → liquide                ← Liquidation validée
 *         → ordonnance             ← Ordre de paiement émis
 *         → paye                   ← Paiement effectué
 *         → archive                ← Dossier clôturé et archivé
 *
 * CIRCUIT B — Dossier créé manuellement (rétrocompatibilité)
 * ─────────────────────────────────────────────────────────────────────────────
 *       brouillon → soumis → valide → en_cotation → analyse
 *         → attribue → commande → ... → archive
 *
 * ─── Statuts transversaux ───────────────────────────────────────────────────
 *       rejete     : dossier bloqué définitivement (depuis presque tout statut)
 *       suspendu   : dossier mis en attente (réversible vers valide ou engage)
 */

// ─── Inventaire complet des statuts ─────────────────────────────────────────

const DOSSIER_STATUTS = {
  // Circuit A — généré depuis expression de besoin
  DOSSIER_GENERE: 'dossier_genere',
  EN_VALIDATION_AF: 'en_validation_af',
  AUTORISE: 'autorise',
  ENGAGE: 'engage',
  COTATION_LANCEE: 'cotation_lancee',
  OFFRES_RECUES: 'offres_recues',
  ANALYSE_EN_COURS: 'analyse_en_cours',
  OFFRE_RETENUE: 'offre_retenue',
  EN_IMPUTATION: 'en_imputation',
  IMPUTE: 'impute',
  LIGNE_INSUFFISANTE: 'ligne_insuffisante',
  EN_REVISION_BUDGETAIRE: 'en_revision_budgetaire',

  // Circuit commun (BC → paiement)
  COMMANDE: 'commande',
  RECEPTIONNE: 'receptionne',
  SERVICE_FAIT: 'service_fait',
  LIQUIDE: 'liquide',
  ORDONNANCE: 'ordonnance',
  PAYE: 'paye',
  ARCHIVE: 'archive',

  // Circuit B — rétrocompat dossier manuel
  BROUILLON: 'brouillon',
  SOUMIS: 'soumis',
  VALIDE: 'valide',
  EN_COTATION: 'en_cotation',
  ANALYSE: 'analyse',
  ATTRIBUE: 'attribue',

  // Transversaux
  REJETE: 'rejete',
  SUSPENDU: 'suspendu',
};

// ─── Matrice de transitions ──────────────────────────────────────────────────

const TRANSITIONS = {
  // Circuit A
  dossier_genere: ['en_validation_af', 'rejete'],
  en_validation_af: ['autorise', 'rejete', 'dossier_genere'], // dossier_genere = renvoi au demandeur
  autorise: ['engage', 'rejete', 'suspendu'],
  engage: ['cotation_lancee', 'suspendu', 'rejete'],
  cotation_lancee: ['offres_recues', 'suspendu'],
  offres_recues: ['analyse_en_cours', 'cotation_lancee'], // cotation_lancee = relancer
  analyse_en_cours: ['offre_retenue', 'offres_recues', 'rejete'],
  offre_retenue: ['en_imputation', 'rejete'],
  en_imputation: ['impute', 'ligne_insuffisante'],
  impute: ['commande', 'suspendu'],
  ligne_insuffisante: ['en_revision_budgetaire', 'rejete'],
  en_revision_budgetaire: ['engage', 'rejete'], // engage = re-déclencher après révision

  // Circuit commun BC → archivage
  commande: ['receptionne', 'suspendu'],
  receptionne: ['service_fait', 'suspendu'],
  service_fait: ['liquide', 'suspendu'],
  liquide: ['ordonnance', 'suspendu'],
  ordonnance: ['paye', 'rejete'],
  paye: ['archive'],
  archive: [],

  // Circuit B — rétrocompat
  brouillon: ['soumis', 'rejete'],
  soumis: ['valide', 'rejete', 'brouillon'],
  valide: ['en_cotation', 'rejete', 'suspendu'],
  en_cotation: ['analyse', 'rejete', 'suspendu'],
  analyse: ['attribue', 'en_cotation', 'rejete'],
  attribue: ['commande', 'rejete', 'suspendu'],

  // Transversaux
  rejete: ['brouillon', 'dossier_genere'],
  suspendu: ['engage', 'valide', 'rejete'],
};

// ─── Habilitations par transition ───────────────────────────────────────────
//
// Rôles utilisés :
//   admin        : accès complet
//   coordinateur : pilotage, validations, arbitrages
//   gestionnaire : opérations courantes
//   comptable    : liquidation, paiement
//   saf          : validation administrative et financière (Validation 2)
//   controleur   : lecture / observations
//
// Validations métier :
//   Validation 2 = en_validation_af → autorise (SAF + coordinateur)
//   Validation 3 = analyse_en_cours → offre_retenue (coordinateur + gestionnaire)
//   Validation 4 = en_imputation → impute|ligne_insuffisante (coordinateur + gestionnaire)

const TRANSITION_ROLES = {
  // ── Circuit A ──────────────────────────────────────────────────────────────
  'dossier_genere->en_validation_af': ['gestionnaire', 'coordinateur', 'admin'],
  'dossier_genere->rejete': ['coordinateur', 'admin'],

  // Validation 2 — SAF / coordination
  'en_validation_af->autorise': ['saf', 'coordinateur', 'admin'],
  'en_validation_af->rejete': ['saf', 'coordinateur', 'admin'],
  'en_validation_af->dossier_genere': ['saf', 'coordinateur', 'admin'], // renvoi

  'autorise->engage': ['coordinateur', 'admin'],
  'autorise->rejete': ['coordinateur', 'admin'],
  'autorise->suspendu': ['coordinateur', 'admin'],

  'engage->cotation_lancee': ['gestionnaire', 'admin'],
  'engage->suspendu': ['coordinateur', 'admin'],
  'engage->rejete': ['coordinateur', 'admin'],

  'cotation_lancee->offres_recues': ['gestionnaire', 'admin'],
  'cotation_lancee->suspendu': ['coordinateur', 'admin'],

  'offres_recues->analyse_en_cours': ['gestionnaire', 'coordinateur', 'admin'],
  'offres_recues->cotation_lancee': ['coordinateur', 'admin'],

  // Validation 3 — sélection de l'offre retenue
  'analyse_en_cours->offre_retenue': ['coordinateur', 'gestionnaire', 'admin'],
  'analyse_en_cours->offres_recues': ['coordinateur', 'gestionnaire', 'admin'],
  'analyse_en_cours->rejete': ['coordinateur', 'admin'],

  'offre_retenue->en_imputation': ['coordinateur', 'gestionnaire', 'admin'],
  'offre_retenue->rejete': ['coordinateur', 'admin'],

  // Validation 4 — imputation budgétaire
  'en_imputation->impute': ['coordinateur', 'gestionnaire', 'admin'],
  'en_imputation->ligne_insuffisante': ['coordinateur', 'gestionnaire', 'admin'],

  'impute->commande': ['gestionnaire', 'admin'],
  'impute->suspendu': ['coordinateur', 'admin'],

  'ligne_insuffisante->en_revision_budgetaire': ['coordinateur', 'admin'],
  'ligne_insuffisante->rejete': ['coordinateur', 'admin'],

  'en_revision_budgetaire->engage': ['coordinateur', 'admin'],
  'en_revision_budgetaire->rejete': ['coordinateur', 'admin'],

  // ── Circuit commun BC → archivage ─────────────────────────────────────────
  'commande->receptionne': ['gestionnaire', 'admin'],
  'commande->suspendu': ['coordinateur', 'admin'],

  'receptionne->service_fait': ['gestionnaire', 'admin'],
  'receptionne->suspendu': ['coordinateur', 'admin'],

  'service_fait->liquide': ['comptable', 'admin'],
  'service_fait->suspendu': ['coordinateur', 'admin'],

  'liquide->ordonnance': ['coordinateur', 'admin'],
  'liquide->suspendu': ['coordinateur', 'admin'],

  'ordonnance->paye': ['comptable', 'admin'],
  'ordonnance->rejete': ['coordinateur', 'admin'],

  'paye->archive': ['admin'],

  // ── Circuit B — rétrocompat dossier manuel ─────────────────────────────────
  'brouillon->soumis': ['gestionnaire', 'admin'],
  'soumis->valide': ['coordinateur', 'admin'],
  'soumis->brouillon': ['coordinateur', 'gestionnaire', 'admin'],
  'soumis->rejete': ['coordinateur', 'admin'],
  'valide->en_cotation': ['gestionnaire', 'admin'],
  'valide->rejete': ['coordinateur', 'admin'],
  'valide->suspendu': ['coordinateur', 'admin'],
  'en_cotation->analyse': ['gestionnaire', 'admin'],
  'en_cotation->rejete': ['coordinateur', 'admin'],
  'analyse->attribue': ['coordinateur', 'admin'],
  'analyse->en_cotation': ['gestionnaire', 'admin'],
  'analyse->rejete': ['coordinateur', 'admin'],
  'attribue->commande': ['gestionnaire', 'admin'],
  'attribue->rejete': ['coordinateur', 'admin'],
  'attribue->suspendu': ['coordinateur', 'admin'],

  // ── Transversaux ──────────────────────────────────────────────────────────
  'rejete->brouillon': ['gestionnaire', 'admin'],
  'rejete->dossier_genere': ['gestionnaire', 'admin'],
  'suspendu->engage': ['coordinateur', 'admin'],
  'suspendu->valide': ['coordinateur', 'admin'],
  'suspendu->rejete': ['coordinateur', 'admin'],
};

// ─── Libellés affichables par statut ────────────────────────────────────────

const STATUT_LABELS = {
  dossier_genere: 'Dossier généré',
  en_validation_af: 'En attente validation A&F',
  autorise: 'Autorisé',
  engage: 'Engagé',
  cotation_lancee: 'Demande de cotation lancée',
  offres_recues: 'Offres / pro forma reçues',
  analyse_en_cours: 'Analyse comparative en cours',
  offre_retenue: 'Offre retenue',
  en_imputation: 'En attente imputation budgétaire',
  impute: 'Imputé',
  ligne_insuffisante: 'Ligne budgétaire insuffisante',
  en_revision_budgetaire: 'En révision budgétaire',
  commande: 'Bon de commande émis',
  receptionne: 'Réceptionné',
  service_fait: 'Service fait',
  liquide: 'Liquidé',
  ordonnance: 'Ordonnancé',
  paye: 'Payé',
  archive: 'Archivé',
  brouillon: 'Brouillon',
  soumis: 'Soumis',
  valide: 'Validé',
  en_cotation: 'En cotation',
  analyse: 'Analysé',
  attribue: 'Attribué',
  rejete: 'Rejeté',
  suspendu: 'Suspendu',
};

// ─── Couleurs Bootstrap par statut ──────────────────────────────────────────

const STATUT_BADGES = {
  dossier_genere: 'info',
  en_validation_af: 'warning',
  autorise: 'primary',
  engage: 'primary',
  cotation_lancee: 'info',
  offres_recues: 'info',
  analyse_en_cours: 'warning',
  offre_retenue: 'primary',
  en_imputation: 'warning',
  impute: 'success',
  ligne_insuffisante: 'danger',
  en_revision_budgetaire: 'danger',
  commande: 'primary',
  receptionne: 'primary',
  service_fait: 'primary',
  liquide: 'success',
  ordonnance: 'success',
  paye: 'success',
  archive: 'dark',
  brouillon: 'secondary',
  soumis: 'warning',
  valide: 'primary',
  en_cotation: 'info',
  analyse: 'info',
  attribue: 'primary',
  rejete: 'danger',
  suspendu: 'secondary',
};

// ─── Fonctions utilitaires ───────────────────────────────────────────────────

function canTransition(fromStatus, toStatus) {
  const allowed = TRANSITIONS[fromStatus] || [];
  return allowed.includes(toStatus);
}

function isRoleAllowed(fromStatus, toStatus, userRoles) {
  const key = `${fromStatus}->${toStatus}`;
  const allowedRoles = TRANSITION_ROLES[key] || ['admin'];
  return userRoles.some((role) => allowedRoles.includes(role));
}

module.exports = {
  DOSSIER_STATUTS,
  TRANSITIONS,
  TRANSITION_ROLES,
  STATUT_LABELS,
  STATUT_BADGES,
  canTransition,
  isRoleAllowed,
};
