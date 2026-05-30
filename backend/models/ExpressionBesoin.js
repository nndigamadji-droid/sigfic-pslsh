const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

/**
 * ExpressionBesoin — entité autonome qui précède le dossier.
 *
 * Workflow propre : brouillon → soumis → [valide | rejete | a_revoir]
 * Une fois validée, elle peut être déclenchée → génération automatique du dossier.
 *
 * Relation : ExpressionBesoin (1) → Dossier (1)  [dossier_id null jusqu'au déclenchement]
 *            ExpressionBesoin (1) → LigneExpressionBesoin (N)
 */
const ExpressionBesoin = sequelize.define(
  'ExpressionBesoin',
  {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },

    // Identification
    reference: { type: DataTypes.STRING(30), unique: true },
    titre: { type: DataTypes.STRING(300), allowNull: false },
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

    // Rattachements planification / budget
    exercice_id: { type: DataTypes.INTEGER },
    activite_id: { type: DataTypes.INTEGER },
    ligne_budgetaire_id: { type: DataTypes.INTEGER },
    source_financement_id: { type: DataTypes.INTEGER },

    // Structure demandeuse
    service_id: { type: DataTypes.INTEGER }, // FK departements

    // Montant consolidé (calculé à partir des lignes)
    montant_total_estime: { type: DataTypes.DECIMAL(18, 2), defaultValue: 0 },

    // Justification générale
    justification: { type: DataTypes.TEXT },

    // ── Statuts ──────────────────────────────────────────────────────────────────
    // Niveau expression de besoin (Validation 1)
    statut: {
      type: DataTypes.ENUM('brouillon', 'soumis', 'a_revoir', 'rejete', 'valide'),
      defaultValue: 'brouillon',
    },
    motif_rejet: { type: DataTypes.TEXT },
    motif_revision: { type: DataTypes.TEXT },

    // Traçabilité Validation 1
    soumis_par: { type: DataTypes.INTEGER },
    soumis_le: { type: DataTypes.DATE },
    valide_par: { type: DataTypes.INTEGER },
    valide_le: { type: DataTypes.DATE },
    rejete_par: { type: DataTypes.INTEGER },
    rejete_le: { type: DataTypes.DATE },

    // Lien vers le dossier généré (null tant que non déclenchée)
    dossier_id: { type: DataTypes.INTEGER },

    created_by: { type: DataTypes.INTEGER },
  },
  {
    tableName: 'expressions_besoins',
    paranoid: true,
  }
);

module.exports = ExpressionBesoin;
