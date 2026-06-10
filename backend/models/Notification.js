const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Notification = sequelize.define('Notification', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },

  // ── Destinataire (habilitation) ──────────────────────────────────────────
  user_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    comment: 'FK users.id — destinataire exclusif',
  },
  role_required: {
    type: DataTypes.STRING(40),
    comment: 'Rôle minimal requis pour voir cette notification (double check)',
  },
  permission_required: {
    type: DataTypes.STRING(80),
    comment: 'Permission requise (ex: dossiers:validate) pour voir la notif',
  },

  // ── Catégorisation ───────────────────────────────────────────────────────
  type: {
    type: DataTypes.ENUM('info', 'task', 'reminder', 'alert', 'message'),
    allowNull: false,
    defaultValue: 'info',
  },
  category: {
    type: DataTypes.ENUM(
      'validation', 'budget', 'finance', 'dossier', 'stock',
      'paiement', 'systeme', 'audit', 'rh', 'autre'
    ),
    allowNull: false,
    defaultValue: 'systeme',
  },
  priority: {
    type: DataTypes.ENUM('low', 'normal', 'high', 'urgent'),
    defaultValue: 'normal',
  },

  // ── Contenu ──────────────────────────────────────────────────────────────
  title:    { type: DataTypes.STRING(150), allowNull: false },
  message:  { type: DataTypes.TEXT, allowNull: false },
  icon:     { type: DataTypes.STRING(40),  comment: 'FontAwesome class (sans fa- prefix)' },

  // ── Lien fonctionnel ─────────────────────────────────────────────────────
  related_module: { type: DataTypes.STRING(40), comment: 'dossiers | budget | validation | ...' },
  related_id:     { type: DataTypes.STRING(40), comment: 'ID polymorphique de l\'entité source' },
  action_url:     { type: DataTypes.STRING(300), comment: 'Deep link (ex: /pages/dossiers/detail.html?id=…)' },
  action_label:   { type: DataTypes.STRING(60),  defaultValue: 'Ouvrir' },

  // ── Cycle de vie ─────────────────────────────────────────────────────────
  status: {
    type: DataTypes.ENUM('unread', 'read', 'done', 'snoozed', 'dismissed'),
    allowNull: false,
    defaultValue: 'unread',
  },
  due_date:       { type: DataTypes.DATE, comment: 'Échéance pour les rappels' },
  read_at:        { type: DataTypes.DATE },
  done_at:        { type: DataTypes.DATE },
  snoozed_until:  { type: DataTypes.DATE },

  // ── Émetteur ─────────────────────────────────────────────────────────────
  emitted_by: { type: DataTypes.INTEGER, comment: 'FK users.id de l\'utilisateur à l\'origine (null si système)' },
}, {
  tableName: 'notifications',
  indexes: [
    { fields: ['user_id', 'status'] },
    { fields: ['type', 'priority'] },
    { fields: ['due_date'] },
    { fields: ['related_module', 'related_id'] },
  ],
});

module.exports = Notification;
