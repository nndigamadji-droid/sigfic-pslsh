# Design UX mobile-first ClickUp light

Date: 2026-07-07
Projet: SIGFIC-PSLSH/IST
Statut: design valide par l'utilisateur, en attente de revue finale avant implementation

## 1. Objectif

Refondre progressivement l'experience frontend pour obtenir une interface mobile-first fluide, professionnelle et productive, inspiree des principes de ClickUp sans transformer SIGFIC-PSLSH en outil generique.

Le systeme doit rester institutionnel, sobre et conforme a la logique metier PSLSH/IST: dossiers d'operation, budget, validation, paiement, controle, archivage et reporting.

## 2. Decisions validees

- Direction principale: Hub personnel mobile-first.
- Navigation mobile: Accueil, Dossiers, Creer, Notifications, Plus.
- Bouton central: Creer.
- Style: "ClickUp light", c'est-a-dire rapide, clair, oriente action, mais sans surcharge visuelle.
- Principe UX: divulgation progressive, moins de fatigue visuelle, plus d'espace blanc utile.

## 3. Probleme actuel

L'interface actuelle contient plusieurs elements qui degradent l'experience mobile:

- pages pensees desktop puis reduites sur telephone;
- grilles et tableaux trop larges;
- texte tronque ou cache dans les cartes;
- navigation mobile presente mais pas encore centrale dans l'usage;
- beaucoup de CSS inline par page, ce qui rend l'harmonisation difficile;
- certains formulaires affichent trop de champs a la fois;
- les pages d'actes engageants utilisent des hauteurs fixes et des zones scroll internes peu confortables;
- les tableaux restent des tableaux sur mobile au lieu de devenir des cartes exploitables.

## 4. Experience cible

### 4.1 Accueil comme hub personnel

L'accueil devient la premiere surface de travail. Il ne doit plus etre seulement une liste de modules.

Il affiche:

- salutation et role de l'utilisateur;
- recherche globale;
- 3 actions rapides selon le role;
- file prioritaire des actions attendues;
- raccourcis vers les dossiers et validations;
- resume des alertes importantes;
- acces secondaire aux modules.

Exemples d'actions rapides:

- Nouvelle expression de besoin;
- Nouveau dossier;
- Ordonnancer;
- Ajouter une piece;
- Exporter un rapport;
- Enregistrer un controle.

### 4.2 Barre mobile fixe

Sur telephone, la navigation principale devient:

1. Accueil
2. Dossiers
3. Creer
4. Notifications
5. Plus

Le bouton Creer ouvre un panneau d'actions rapide, avec les actions autorisees par role.

Le menu Plus contient:

- Planification;
- Budget;
- Finances;
- Controle et audit;
- Administration;
- Reporting;
- Aide;
- Deconnexion.

### 4.3 Desktop

Le desktop conserve une sidebar productive, mais elle doit etre alignee avec la logique mobile:

- meme regroupement des navigateurs;
- acces rapide au hub;
- menu Creer disponible dans la topbar;
- sidebar moins surchargee par defaut;
- sections repliees par defaut sauf section active.

## 5. Composants frontend a introduire

### 5.1 Shell global

Responsabilites:

- topbar responsive;
- sidebar desktop;
- drawer mobile;
- bottom nav mobile;
- bouton Creer;
- menu Plus;
- etats actifs de navigation;
- protection contre les debordements horizontaux.

Fichiers probables:

- `frontend/src/css/main.css`
- `frontend/src/js/roles.js`

### 5.2 Hub personnel

Responsabilites:

- presenter les actions prioritaires;
- afficher les raccourcis du role;
- adapter les cartes par role;
- reduire le nombre d'informations visibles au premier ecran.

Fichier principal:

- `frontend/pages/accueil/index.html`

### 5.3 Panneau Creer

Comportement:

- ouvert depuis le bouton central mobile ou la topbar desktop;
- liste d'actions role-aware;
- fermeture par fond, echap, ou action selectionnee;
- aucun scroll horizontal;
- grandes zones tactiles.

Actions initiales:

- Expression de besoin;
- Dossier d'operation;
- Paiement;
- Document;
- Controle;
- Rapport.

### 5.4 Cartes mobiles pour tableaux

Sur mobile, les tableaux critiques doivent etre presentes en cartes.

Chaque carte doit montrer:

- reference;
- statut;
- libelle court;
- montant si applicable;
- service ou responsable;
- prochaine action;
- bouton d'ouverture.

Le tableau desktop reste disponible sur grand ecran.

### 5.5 Formulaires en etapes

Les formulaires longs doivent etre decoupes:

1. Informations generales;
2. Budget et imputation;
3. Pieces justificatives;
4. Validation et enregistrement.

Chaque etape doit avoir:

- titre court;
- aide minimale;
- champs visibles uniquement si necessaires;
- boutons Retour, Suivant, Enregistrer.

## 6. Pages prioritaires

Phase 1:

- shell global;
- accueil;
- bouton Creer;
- navigation mobile.

Phase 2:

- actes engageants coordonnateur;
- actes SAF;
- actes agent;
- actes controle.

Phase 3:

- dossiers;
- besoins;
- validation;
- archives.

Phase 4:

- budget;
- paiement;
- finances;
- reporting.

## 7. Regles de design

- Mobile-first: le telephone est la base, desktop est une extension.
- Pas de texte tronque si l'information est essentielle.
- Les longues listes utilisent recherche, filtres et sections repliees.
- Les cartes ne doivent pas contenir d'autres cartes decoratives.
- Boutons tactiles minimum 44px de hauteur.
- Typographie compacte mais lisible.
- Pas de footer institutionnel dans les pages applicatives.
- Couleurs sobres: bleu institutionnel en base, accents fonctionnels limites.
- Pas de surcharge decorative.
- Les icones servent a scanner, pas a decorer.

## 8. Accessibilite et confort

- Focus visible sur boutons, liens et champs.
- Etats actifs clairs dans la navigation.
- Contrastes suffisants.
- Zones tactiles confortables.
- Modales plein ecran sur mobile.
- Toasts visibles au-dessus de la bottom nav.
- Retour navigateur apres deconnexion toujours bloque par le garde session.

## 9. Donnees et securite

La refonte UX ne doit pas ajouter de stockage metier en localStorage sauf si c'est deja un comportement existant a remplacer progressivement.

Les actions metier doivent passer par l'API backend quand les endpoints existent.

La logique de roles reste pilotee par:

- session utilisateur;
- roles;
- permissions;
- service;
- routes autorisees.

## 10. Verification attendue

Avant de declarer la refonte terminee:

- tester largeur mobile 360px;
- tester largeur mobile 414px;
- tester tablette 768px;
- tester desktop 1366px;
- verifier absence de scroll horizontal;
- verifier bottom nav sur toutes les pages applicatives;
- verifier menu Creer par role;
- verifier que les tests backend/frontend existants passent;
- verifier visuellement les pages prioritaires avec capture Playwright si disponible.

## 11. Hors scope initial

Cette spec ne couvre pas:

- refonte backend;
- changement de modele de donnees;
- design marketing ou landing page publique;
- reorganisation complete de tous les modules metier;
- reecriture totale en framework React/Vue.

## 12. Definition de succes

La refonte est consideree reussie quand:

- un utilisateur mobile peut se connecter, lire ses priorites, creer une action et ouvrir un dossier sans zoomer;
- la navigation principale tient en 5 entrees mobiles;
- les pages ne coupent plus le texte essentiel;
- les tableaux critiques deviennent utilisables sur telephone;
- l'experience desktop reste productive;
- le style global est coherent et professionnel.
