const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

/**
 * Dossier — entité centrale du système.
 *
 * Deux origines possibles :
 *   a) Généré automatiquement depuis une ExpressionBesoin validée
 *      → expression_besoin_id renseigné, statut initial = 'dossier_genere'
 *   b) Créé manuellement (cas exceptionnels)
 *      → expression_besoin_id null, statut initial = 'brouillon'
 *
 * Workflow enrichi :
 *   dossier_genere
 *     → en_validation_af              [Validation 2 : SAF / coordination]
 *     → autorise
 *     → engage
 *     → cotation_lancee
 *     → offres_recues
 *     → analyse_en_cours
 *     → offre_retenue                 [Validation 3 : offre sélectionnée]
 *     → en_imputation                 [Budget – Dépenses]
 *     → impute / ligne_insuffisante   [Validation 4]
 *     → en_revision_budgetaire        [si ligne insuffisante → centre validation]
 *     → commande → receptionne → service_fait
 *     → liquide → ordonnance → paye → archive
 *
 * Workflow manuel (rétrocompatible) :
 *   brouillon → soumis → valide → en_cotation → ... → paye → archive
 */
const Dossier = sequelize.define(
  'Dossier',
  {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    reference: { type: DataTypes.STRING(30), unique: true },

    // Rattachements planification / budget
    exercice_id: { type: DataTypes.INTEGER, allowNull: false },
    activite_id: { type: DataTypes.INTEGER },
    ligne_budgetaire_id: { type: DataTypes.INTEGER },
    source_financement_id: { type: DataTypes.INTEGER },

    // Origine : expression de besoin ayant généré ce dossier
    expression_besoin_id: { type: DataTypes.INTEGER },

    // Description
    objet: { type: DataTypes.STRING(500), allowNull: false },
    type_depense: {
      type: DataTypes.ENUM(
        'fournitures',
        'services',
        'travaux',
        'immobilisations',
        'frais_mission',
        'autres'
      ),
      defaultValue: 'fournitures',
    },

    // Montants
    montant_estime: { type: DataTypes.DECIMAL(18, 2), defaultValue: 0 },
    montant_engage: { type: DataTypes.DECIMAL(18, 2), defaultValue: 0 },
    montant_liquide: { type: DataTypes.DECIMAL(18, 2), defaultValue: 0 },
    montant_paye: { type: DataTypes.DECIMAL(18, 2), defaultValue: 0 },

    // ── Statut ───────────────────────────────────────────────────────────────────
    statut: { type: DataTypes.STRING(30), defaultValue: 'brouillon' },

    // ── Traçabilité Validation 1 (soumission manuelle / rétrocompat) ─────────────
    soumis_par: { type: DataTypes.INTEGER },
    soumis_le: { type: DataTypes.DATE },
    valide_par: { type: DataTypes.INTEGER },
    valide_le: { type: DataTypes.DATE },
    rejete_par: { type: DataTypes.INTEGER },
    rejete_le: { type: DataTypes.DATE },
    motif_rejet: { type: DataTypes.TEXT },

    // ── Traçabilité Validation 2 (administrative et financière — SAF) ────────────
    valide2_par: { type: DataTypes.INTEGER },
    valide2_le: { type: DataTypes.DATE },
    rejete2_par: { type: DataTypes.INTEGER },
    rejete2_le: { type: DataTypes.DATE },
    motif_rejet2: { type: DataTypes.TEXT },

    // ── Traçabilité Imputation budgétaire (Validation 4) ────────────────────────
    imputation_validee_par: { type: DataTypes.INTEGER },
    imputation_validee_le: { type: DataTypes.DATE },
    motif_ligne_insuffisante: { type: DataTypes.TEXT },

    observations: { type: DataTypes.TEXT },
    created_by: { type: DataTypes.INTEGER },
  },
  {
    tableName: 'dossiers',
    paranoid: true,
  }
);

module.exports = Dossier;
