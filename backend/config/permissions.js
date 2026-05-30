const PERMISSIONS = {
  // Administration
  'users:read': 'Voir les utilisateurs',
  'users:create': 'Créer un utilisateur',
  'users:update': 'Modifier un utilisateur',
  'users:delete': 'Supprimer un utilisateur',
  'roles:read': 'Voir les rôles',
  'roles:manage': 'Gérer les rôles et permissions',
  'departements:read': 'Voir les départements',
  'departements:manage': 'Gérer les départements',
  'agents:read': 'Voir les agents',
  'agents:manage': 'Gérer les agents',
  'audit:read': "Consulter le journal d'audit",
  // Planification
  'exercices:read': 'Voir les exercices',
  'exercices:manage': 'Gérer les exercices',
  'planification:read': 'Voir la planification',
  'planification:manage': 'Gérer la planification',
  // Budget
  'budget:read': 'Voir le budget',
  'budget:manage': 'Gérer le budget',
  'budget:amender': 'Amender le budget',
  // Dossiers
  'dossiers:read': 'Voir les dossiers',
  'dossiers:create': 'Créer un dossier',
  'dossiers:update': 'Modifier un dossier',
  'dossiers:delete': 'Supprimer un dossier',
  'dossiers:validate': 'Valider un dossier',
  'dossiers:workflow': "Changer le statut d'un dossier",
  // Passation
  'passation:read': 'Voir la passation',
  'passation:manage': 'Gérer la passation',
  'fournisseurs:read': 'Voir les fournisseurs',
  'fournisseurs:manage': 'Gérer les fournisseurs',
  // Commandes
  'commandes:read': 'Voir les commandes',
  'commandes:manage': 'Gérer les commandes',
  'contrats:read': 'Voir les contrats',
  'contrats:manage': 'Gérer les contrats',
  // Réception et stock
  'receptions:read': 'Voir les réceptions',
  'receptions:manage': 'Gérer les réceptions',
  'stock:read': 'Voir le stock',
  'stock:manage': 'Gérer le stock',
  'immobilisations:read': 'Voir les immobilisations',
  'immobilisations:manage': 'Gérer les immobilisations',
  // Comptabilité
  'comptabilite:read': 'Voir la comptabilité',
  'comptabilite:saisie': 'Saisir des écritures',
  'comptabilite:valider': 'Valider des écritures',
  'comptabilite:cloturer': 'Clôturer un exercice',
  // Paiement
  'paiement:read': 'Voir les paiements',
  'paiement:liquider': 'Liquider une dépense',
  'paiement:ordonnancer': 'Ordonnancer un paiement',
  'paiement:payer': 'Enregistrer un paiement',
  'paiement:rapprochement': 'Gérer le rapprochement bancaire',
  // Contrôle interne
  'controle:read': 'Voir les contrôles',
  'controle:manage': 'Gérer les contrôles',
  'audit:manage': 'Gérer les audits',
  // Documents
  'documents:read': 'Voir les documents',
  'documents:upload': 'Télécharger des documents',
  'documents:delete': 'Supprimer des documents',
  // Reporting
  'reporting:read': 'Voir les rapports',
  'reporting:export': 'Exporter les rapports',
};

module.exports = { PERMISSIONS };
