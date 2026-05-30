const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const WorkflowTransition = sequelize.define(
  'WorkflowTransition',
  {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    dossier_id: { type: DataTypes.INTEGER, allowNull: false },
    from_status: { type: DataTypes.STRING(30) },
    to_status: { type: DataTypes.STRING(30), allowNull: false },
    comment: { type: DataTypes.TEXT },
    transitioned_by: { type: DataTypes.INTEGER },
  },
  { tableName: 'workflow_transitions', paranoid: false, updatedAt: false }
);

module.exports = WorkflowTransition;
