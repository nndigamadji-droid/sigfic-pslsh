const sequelize = require('../config/database');

// Import all models
const User = require('./User');
const Role = require('./Role');
const Permission = require('./Permission');
const RolePermission = require('./RolePermission');
const UserRole = require('./UserRole');
const Departement = require('./Departement');
const Agent = require('./Agent');
const AuditLog = require('./AuditLog');
const BudgetComptaMapping = require('./BudgetComptaMapping');
const WorkflowTransition = require('./WorkflowTransition');
const Exercice = require('./Exercice');
const PlanAction = require('./PlanAction');
const ActionStrategique = require('./ActionStrategique');
const Activite = require('./Activite');
const SourceFinancement = require('./SourceFinancement');
const RubriqueBudgetaire = require('./RubriqueBudgetaire');
const LigneBudgetaire = require('./LigneBudgetaire');
const Fournisseur = require('./Fournisseur');
const Beneficiaire = require('./Beneficiaire');
const Dossier = require('./Dossier');
const ExpressionBesoin = require('./ExpressionBesoin');
const DemandeCotation = require('./DemandeCotation');
const Offre = require('./Offre');
const AnalyseComparative = require('./AnalyseComparative');
const Attribution = require('./Attribution');
const BonCommande = require('./BonCommande');
const LigneBonCommande = require('./LigneBonCommande');
const Contrat = require('./Contrat');
const Reception = require('./Reception');
const LigneReception = require('./LigneReception');
const AttestationServiceFait = require('./AttestationServiceFait');
const ArticleStock = require('./ArticleStock');
const MouvementStock = require('./MouvementStock');
const Immobilisation = require('./Immobilisation');
const PlanComptable = require('./PlanComptable');
const JournalComptable = require('./JournalComptable');
const EcritureComptable = require('./EcritureComptable');
const LigneEcriture = require('./LigneEcriture');
const Facture = require('./Facture');
const Liquidation = require('./Liquidation');
const OrdrePaiement = require('./OrdrePaiement');
const Paiement = require('./Paiement');
const Controle = require('./Controle');
const Anomalie = require('./Anomalie');
const Audit = require('./Audit');
const Recommandation = require('./Recommandation');
const LigneExpressionBesoin = require('./LigneExpressionBesoin');
const DocumentType = require('./DocumentType');
const Document = require('./Document');

// ─── ASSOCIATIONS ──────────────────────────────────────────────────────────────

// Users ↔ Roles (many-to-many)
User.belongsToMany(Role, { through: UserRole, foreignKey: 'user_id', as: 'roles' });
Role.belongsToMany(User, { through: UserRole, foreignKey: 'role_id', as: 'users' });

// Roles ↔ Permissions (many-to-many)
Role.belongsToMany(Permission, {
  through: RolePermission,
  foreignKey: 'role_id',
  as: 'permissions',
});
Permission.belongsToMany(Role, {
  through: RolePermission,
  foreignKey: 'permission_id',
  as: 'roles',
});

// User ↔ Departement
User.belongsTo(Departement, { foreignKey: 'departement_id', as: 'departement' });
Departement.hasMany(User, { foreignKey: 'departement_id', as: 'users' });

// Agent ↔ User
Agent.belongsTo(User, { foreignKey: 'user_id', as: 'user' });
User.hasOne(Agent, { foreignKey: 'user_id', as: 'agent' });

// Planification
Exercice.hasMany(PlanAction, { foreignKey: 'exercice_id', as: 'plans' });
PlanAction.belongsTo(Exercice, { foreignKey: 'exercice_id', as: 'exercice' });

PlanAction.hasMany(ActionStrategique, { foreignKey: 'plan_action_id', as: 'actions' });
ActionStrategique.belongsTo(PlanAction, { foreignKey: 'plan_action_id', as: 'plan' });

ActionStrategique.hasMany(Activite, { foreignKey: 'action_strategique_id', as: 'activites' });
Activite.belongsTo(ActionStrategique, { foreignKey: 'action_strategique_id', as: 'action' });

// Budget
LigneBudgetaire.belongsTo(Exercice, { foreignKey: 'exercice_id', as: 'exercice' });
LigneBudgetaire.belongsTo(Activite, { foreignKey: 'activite_id', as: 'activite' });
LigneBudgetaire.belongsTo(RubriqueBudgetaire, { foreignKey: 'rubrique_id', as: 'rubrique' });
LigneBudgetaire.belongsTo(SourceFinancement, { foreignKey: 'source_financement_id', as: 'source' });
Exercice.hasMany(LigneBudgetaire, { foreignKey: 'exercice_id', as: 'lignes_budgetaires' });

// Dossier (entité centrale)
Dossier.belongsTo(Exercice, { foreignKey: 'exercice_id', as: 'exercice' });
Dossier.belongsTo(Activite, { foreignKey: 'activite_id', as: 'activite' });
Dossier.belongsTo(LigneBudgetaire, { foreignKey: 'ligne_budgetaire_id', as: 'ligne_budgetaire' });
Dossier.belongsTo(SourceFinancement, {
  foreignKey: 'source_financement_id',
  as: 'source_financement',
});
Dossier.belongsTo(User, { foreignKey: 'created_by', as: 'createur' });
Exercice.hasMany(Dossier, { foreignKey: 'exercice_id', as: 'dossiers' });

// Workflow
WorkflowTransition.belongsTo(Dossier, { foreignKey: 'dossier_id', as: 'dossier' });
WorkflowTransition.belongsTo(User, { foreignKey: 'transitioned_by', as: 'agent' });
Dossier.hasMany(WorkflowTransition, { foreignKey: 'dossier_id', as: 'transitions' });

// Passation — ExpressionBesoin (entité autonome qui précède le dossier)
// Relation inversée : ExpressionBesoin → Dossier (le dossier est généré depuis l'expression)
ExpressionBesoin.belongsTo(Exercice, { foreignKey: 'exercice_id', as: 'exercice' });
ExpressionBesoin.belongsTo(Activite, { foreignKey: 'activite_id', as: 'activite' });
ExpressionBesoin.belongsTo(LigneBudgetaire, {
  foreignKey: 'ligne_budgetaire_id',
  as: 'ligne_budgetaire',
});
ExpressionBesoin.belongsTo(SourceFinancement, {
  foreignKey: 'source_financement_id',
  as: 'source_financement',
});
ExpressionBesoin.belongsTo(Departement, { foreignKey: 'service_id', as: 'service' });
ExpressionBesoin.belongsTo(Dossier, { foreignKey: 'dossier_id', as: 'dossier' });
ExpressionBesoin.belongsTo(User, { foreignKey: 'created_by', as: 'createur' });
ExpressionBesoin.hasMany(LigneExpressionBesoin, {
  foreignKey: 'expression_besoin_id',
  as: 'lignes',
});

LigneExpressionBesoin.belongsTo(ExpressionBesoin, {
  foreignKey: 'expression_besoin_id',
  as: 'expression_besoin',
});

// Le dossier peut avoir été généré depuis une expression de besoin
Dossier.belongsTo(ExpressionBesoin, {
  foreignKey: 'expression_besoin_id',
  as: 'expression_besoin',
});

DemandeCotation.belongsTo(Dossier, { foreignKey: 'dossier_id', as: 'dossier' });
Dossier.hasOne(DemandeCotation, { foreignKey: 'dossier_id', as: 'demande_cotation' });

Offre.belongsTo(DemandeCotation, { foreignKey: 'demande_cotation_id', as: 'demande_cotation' });
Offre.belongsTo(Fournisseur, { foreignKey: 'fournisseur_id', as: 'fournisseur' });
DemandeCotation.hasMany(Offre, { foreignKey: 'demande_cotation_id', as: 'offres' });

AnalyseComparative.belongsTo(DemandeCotation, {
  foreignKey: 'demande_cotation_id',
  as: 'demande_cotation',
});
AnalyseComparative.belongsTo(Fournisseur, {
  foreignKey: 'fournisseur_selectionne_id',
  as: 'fournisseur_selectionne',
});

Attribution.belongsTo(Dossier, { foreignKey: 'dossier_id', as: 'dossier' });
Attribution.belongsTo(Fournisseur, { foreignKey: 'fournisseur_id', as: 'fournisseur' });
Dossier.hasOne(Attribution, { foreignKey: 'dossier_id', as: 'attribution' });

// Commandes
BonCommande.belongsTo(Dossier, { foreignKey: 'dossier_id', as: 'dossier' });
BonCommande.belongsTo(Fournisseur, { foreignKey: 'fournisseur_id', as: 'fournisseur' });
Dossier.hasMany(BonCommande, { foreignKey: 'dossier_id', as: 'bons_commande' });

LigneBonCommande.belongsTo(BonCommande, { foreignKey: 'bon_commande_id', as: 'bon_commande' });
BonCommande.hasMany(LigneBonCommande, { foreignKey: 'bon_commande_id', as: 'lignes' });

Contrat.belongsTo(Dossier, { foreignKey: 'dossier_id', as: 'dossier' });
Contrat.belongsTo(Fournisseur, { foreignKey: 'fournisseur_id', as: 'fournisseur' });
Dossier.hasMany(Contrat, { foreignKey: 'dossier_id', as: 'contrats' });

// Réception
Reception.belongsTo(Dossier, { foreignKey: 'dossier_id', as: 'dossier' });
Reception.belongsTo(BonCommande, { foreignKey: 'bon_commande_id', as: 'bon_commande' });
Dossier.hasMany(Reception, { foreignKey: 'dossier_id', as: 'receptions' });

LigneReception.belongsTo(Reception, { foreignKey: 'reception_id', as: 'reception' });
Reception.hasMany(LigneReception, { foreignKey: 'reception_id', as: 'lignes' });

AttestationServiceFait.belongsTo(Dossier, { foreignKey: 'dossier_id', as: 'dossier' });
Dossier.hasMany(AttestationServiceFait, { foreignKey: 'dossier_id', as: 'attestations' });

// Stock
MouvementStock.belongsTo(ArticleStock, { foreignKey: 'article_id', as: 'article' });
ArticleStock.hasMany(MouvementStock, { foreignKey: 'article_id', as: 'mouvements' });
MouvementStock.belongsTo(Dossier, { foreignKey: 'dossier_id', as: 'dossier' });

Immobilisation.belongsTo(Dossier, { foreignKey: 'dossier_id', as: 'dossier' });
Immobilisation.belongsTo(Fournisseur, { foreignKey: 'fournisseur_id', as: 'fournisseur' });

// Comptabilité
EcritureComptable.belongsTo(JournalComptable, { foreignKey: 'journal_id', as: 'journal' });
EcritureComptable.belongsTo(Dossier, { foreignKey: 'dossier_id', as: 'dossier' });
JournalComptable.hasMany(EcritureComptable, { foreignKey: 'journal_id', as: 'ecritures' });
Dossier.hasMany(EcritureComptable, { foreignKey: 'dossier_id', as: 'ecritures' });

LigneEcriture.belongsTo(EcritureComptable, { foreignKey: 'ecriture_id', as: 'ecriture' });
LigneEcriture.belongsTo(PlanComptable, { foreignKey: 'compte_id', as: 'compte' });
EcritureComptable.hasMany(LigneEcriture, { foreignKey: 'ecriture_id', as: 'lignes' });

// Paiement
Facture.belongsTo(Dossier, { foreignKey: 'dossier_id', as: 'dossier' });
Facture.belongsTo(Fournisseur, { foreignKey: 'fournisseur_id', as: 'fournisseur' });
Dossier.hasMany(Facture, { foreignKey: 'dossier_id', as: 'factures' });

Liquidation.belongsTo(Dossier, { foreignKey: 'dossier_id', as: 'dossier' });
Liquidation.belongsTo(Facture, { foreignKey: 'facture_id', as: 'facture' });
Dossier.hasOne(Liquidation, { foreignKey: 'dossier_id', as: 'liquidation' });

OrdrePaiement.belongsTo(Dossier, { foreignKey: 'dossier_id', as: 'dossier' });
OrdrePaiement.belongsTo(Liquidation, { foreignKey: 'liquidation_id', as: 'liquidation' });
OrdrePaiement.belongsTo(Fournisseur, { foreignKey: 'fournisseur_id', as: 'fournisseur' });
OrdrePaiement.belongsTo(Beneficiaire, { foreignKey: 'beneficiaire_id', as: 'beneficiaire' });
Dossier.hasOne(OrdrePaiement, { foreignKey: 'dossier_id', as: 'ordre_paiement' });

Paiement.belongsTo(OrdrePaiement, { foreignKey: 'ordre_paiement_id', as: 'ordre_paiement' });
OrdrePaiement.hasMany(Paiement, { foreignKey: 'ordre_paiement_id', as: 'paiements' });

// Contrôle
Controle.belongsTo(Dossier, { foreignKey: 'dossier_id', as: 'dossier' });
Controle.belongsTo(User, { foreignKey: 'controleur_id', as: 'controleur' });
Dossier.hasMany(Controle, { foreignKey: 'dossier_id', as: 'controles' });

Anomalie.belongsTo(Controle, { foreignKey: 'controle_id', as: 'controle' });
Anomalie.belongsTo(Dossier, { foreignKey: 'dossier_id', as: 'dossier' });
Controle.hasMany(Anomalie, { foreignKey: 'controle_id', as: 'anomalies' });

Recommandation.belongsTo(Audit, { foreignKey: 'audit_id', as: 'audit' });
Recommandation.belongsTo(Anomalie, { foreignKey: 'anomalie_id', as: 'anomalie' });
Audit.hasMany(Recommandation, { foreignKey: 'audit_id', as: 'recommandations' });

// Documents
Document.belongsTo(Dossier, { foreignKey: 'dossier_id', as: 'dossier' });
Document.belongsTo(DocumentType, { foreignKey: 'type_id', as: 'type' });
Document.belongsTo(User, { foreignKey: 'uploaded_by', as: 'uploadeur' });
Dossier.hasMany(Document, { foreignKey: 'dossier_id', as: 'documents' });

// AuditLog
AuditLog.belongsTo(User, { foreignKey: 'user_id', as: 'user' });

module.exports = {
  sequelize,
  User,
  Role,
  Permission,
  RolePermission,
  UserRole,
  Departement,
  Agent,
  AuditLog,
  BudgetComptaMapping,
  WorkflowTransition,
  Exercice,
  PlanAction,
  ActionStrategique,
  Activite,
  SourceFinancement,
  RubriqueBudgetaire,
  LigneBudgetaire,
  Fournisseur,
  Beneficiaire,
  Dossier,
  ExpressionBesoin,
  LigneExpressionBesoin,
  DemandeCotation,
  Offre,
  AnalyseComparative,
  Attribution,
  BonCommande,
  LigneBonCommande,
  Contrat,
  Reception,
  LigneReception,
  AttestationServiceFait,
  ArticleStock,
  MouvementStock,
  Immobilisation,
  PlanComptable,
  JournalComptable,
  EcritureComptable,
  LigneEcriture,
  Facture,
  Liquidation,
  OrdrePaiement,
  Paiement,
  Controle,
  Anomalie,
  Audit,
  Recommandation,
  DocumentType,
  Document,
};
