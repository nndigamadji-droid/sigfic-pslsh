const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

/**
 * Offre — pro forma ou offre formelle reçue en réponse à une demande de cotation.
 *
 * Pour les achats/fournitures : 3 pro forma minimum obligatoires (contrôle côté controller).
 * Une seule offre peut être marquée `retenue = true` par demande de cotation.
 */
const Offre = sequelize.define(
  'Offre',
  {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    demande_cotation_id: { type: DataTypes.INTEGER, allowNull: false },
    fournisseur_id: { type: DataTypes.INTEGER, allowNull: false },

    // Type d'offre
    type: {
      type: DataTypes.ENUM('pro_forma', 'formelle'),
      defaultValue: 'pro_forma',
    },

    // Données de l'offre
    date_reception: { type: DataTypes.DATEONLY },
    montant_total: { type: DataTypes.DECIMAL(18, 2), defaultValue: 0 },
    devise: { type: DataTypes.STRING(5), defaultValue: 'XOF' },
    delai_livraison: { type: DataTypes.INTEGER }, // en jours
    validite_offre: { type: DataTypes.DATEONLY },
    fichier_offre: { type: DataTypes.STRING(255) },

    // Statut de réception/qualification
    statut: {
      type: DataTypes.ENUM('recu', 'valide', 'rejete'),
      defaultValue: 'recu',
    },

    // Sélection après analyse comparative (Validation 3)
    retenue: { type: DataTypes.BOOLEAN, defaultValue: false },
    date_retenue: { type: DataTypes.DATE },
    retenu_par: { type: DataTypes.INTEGER },

    notes: { type: DataTypes.TEXT },
  },
  {
    tableName: 'offres',
    paranoid: true,
  }
);

module.exports = Offre;
