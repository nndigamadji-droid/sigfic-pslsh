# AGENTS.md

## 1. Contexte général du projet

Ce projet consiste à concevoir, structurer et développer une application web complète de gestion administrative, financière, comptable, budgétaire, logistique, documentaire et de contrôle interne du Programme Sectoriel de Lutte contre le Sida, les Hépatites Virales et les Infections Sexuellement Transmissibles (PSLSH/IST).

L’application doit être conforme :

* au manuel de procédures administratives, financières et comptables du PSLSH/IST (édition 2025) ;
* aux exigences du SYSCOHADA ;
* aux normes de gestion publique (engagement, liquidation, ordonnancement, paiement) ;
* aux exigences des partenaires techniques et financiers (PTF) ;
* aux principes de traçabilité, transparence, reddition des comptes et auditabilité.

L’application doit couvrir l’ensemble du cycle de gestion :
Planification → Budgétisation → Passation → Exécution → Comptabilité → Paiement → Contrôle → Archivage → Reporting.

---

## 2. Objectif global

Mettre en place un système d’information intégré permettant :

* la gestion complète des opérations administratives et financières ;
* le suivi budgétaire en temps réel ;
* la production automatique des états financiers et rapports ;
* la gestion des pièces justificatives ;
* la traçabilité des opérations ;
* le contrôle interne et l’audit ;
* la sécurisation des processus et des données.

---

## 3. Principe fondamental : le dossier d’opération

Le système repose sur une entité centrale appelée **dossier d’opération** (ou dossier de dépense).

Chaque dossier regroupe :

* expression de besoin ;
* demande de cotation ;
* offres ;
* analyse comparative ;
* attribution ;
* bon de commande ou contrat ;
* réception / service fait ;
* facture ;
* liquidation ;
* ordre de paiement ;
* paiement ;
* pièces justificatives ;
* contrôles et anomalies.

Aucune opération financière ne doit exister en dehors d’un dossier.

---

## 4. Architecture fonctionnelle complète

### 4.1 Administration et sécurité

* gestion des utilisateurs ;
* gestion des rôles ;
* gestion des permissions ;
* gestion des agents ;
* gestion des départements ;
* gestion des profils ;
* gestion des signatures ;
* journal des actions (audit log) ;
* gestion du workflow.

---

### 4.2 Planification

* exercices ;
* PTCA ;
* PTBA ;
* PAO ;
* actions stratégiques ;
* activités ;
* indicateurs ;
* cibles ;
* calendrier ;
* localisation.

---

### 4.3 Budget et nomenclature

* rubriques budgétaires ;
* lignes budgétaires ;
* sources de financement ;
* ventilation par activité ;
* ventilation par source ;
* ventilation par nature de dépense ;
* gestion des crédits ;
* révisions budgétaires ;
* suivi du budget.

---

### 4.4 Expression des besoins

* saisie des besoins ;
* désignation ;
* quantités ;
* justification ;
* rattachement budgétaire ;
* validation.

---

### 4.5 Passation des marchés

* demande de cotation ;
* appel d’offres ;
* réception des offres ;
* analyse comparative ;
* sélection ;
* attribution ;
* traçabilité des fournisseurs.

---

### 4.6 Commandes et contrats

* bons de commande ;
* contrats ;
* marchés ;
* suivi d’exécution ;
* délais ;
* engagements contractuels.

---

### 4.7 Réception et service fait

* réception des biens ;
* attestation de service fait ;
* procès-verbal ;
* validation technique ;
* validation administrative.

---

### 4.8 Gestion des stocks et immobilisations

* gestion des articles ;
* entrées ;
* sorties ;
* bordereaux ;
* inventaires ;
* gestion du carburant ;
* gestion du matériel ;
* immobilisations.

---

### 4.9 Comptabilité

* plan comptable ;
* journaux (caisse, banque, OD, analytique) ;
* écritures comptables ;
* grand livre ;
* balance ;
* compte de gestion ;
* comptabilité analytique ;
* comptabilité par source de financement.

---

### 4.10 Paiement

* liquidation ;
* ordonnancement ;
* ordre de paiement ;
* suivi des paiements ;
* modes de paiement ;
* rapprochement bancaire ;
* gestion des avances.

---

### 4.11 Contrôle interne et audit

* contrôles ;
* anomalies ;
* rejets ;
* audits ;
* recommandations ;
* plans d’actions ;
* suivi des corrections.

---

### 4.12 Archivage documentaire

* stockage des pièces ;
* classification ;
* versionnage ;
* consultation ;
* sécurité des documents.

---

### 4.13 Reporting

* rapports financiers ;
* suivi budgétaire ;
* tableaux de bord ;
* états analytiques ;
* rapports bailleurs ;
* exports.

---

## 5. Structure complète de la base de données

### Tables principales

#### Administration

users, roles, permissions, user_roles, agents, departements, workflow_history

#### Planification

exercices, plans_action, actions_strategiques, activites

#### Budget

sources_financement, rubriques_budgetaires, lignes_budgetaires

#### Tiers

fournisseurs, beneficiaires, partenaires, comptes_bancaires

#### Dossier

dossiers

#### Passation

expressions_besoins, demandes_cotation, offres, analyses_comparatives

#### Commande

bons_commande

#### Réception

receptions, attestations_service_fait

#### Stock

stocks_articles, mouvements_stock

#### Comptabilité

journaux, ecritures, ecriture_lignes, imputations_analytiques

#### Paiement

factures, liquidations, ordres_paiement, paiements, rejets_paiement

#### Contrôle

controles, anomalies, audits, recommandations

#### Documents

documents, document_types

#### Reporting

rapports, comptes_gestion, clotures

---

## 6. Relations essentielles

* un exercice contient plusieurs plans ;
* un plan contient plusieurs actions ;
* une action contient plusieurs activités ;
* une activité contient plusieurs dossiers ;
* un dossier contient toutes les pièces ;
* un dossier est lié à une ligne budgétaire ;
* un dossier est lié à une source de financement ;
* un dossier génère des écritures comptables ;
* un dossier génère un ordre de paiement ;
* un ordre de paiement génère un paiement.

---

## 7. Workflow métier

États du dossier :

* brouillon ;
* soumis ;
* validé ;
* en cotation ;
* analysé ;
* attribué ;
* commandé ;
* réceptionné ;
* service fait ;
* liquidé ;
* ordonnancé ;
* payé ;
* rejeté ;
* suspendu ;
* archivé.

---

## 8. Contraintes métier obligatoires

* aucune dépense sans budget ;
* aucune dépense sans dossier ;
* aucune facture sans pièce justificative ;
* aucune facture incohérente acceptée ;
* séparation des fonctions obligatoire ;
* validation obligatoire avant paiement ;
* traçabilité obligatoire ;
* archivage obligatoire.

---

## 9. Règles comptables

* respect du SYSCOHADA ;
* journaux obligatoires ;
* équilibre débit/crédit ;
* imputation obligatoire ;
* suivi analytique ;
* clôture des comptes ;
* production des états financiers.

---

## 10. Sécurité

* authentification ;
* autorisation ;
* contrôle des accès ;
* audit log ;
* sauvegarde ;
* protection des données ;
* validation des entrées.

---

## 11. Interface utilisateur

* design sobre ;
* navigation claire ;
* tableaux ;
* filtres ;
* formulaires structurés ;
* dashboards ;
* ergonomie administrative.

---

## 12. Technologies recommandées

* backend : Laravel ;
* base de données : PostgreSQL ou MySQL ;
* frontend : interface web admin ;
* API si nécessaire.

---

## 13. Règles pour Codex

* respecter la logique métier ;
* ne pas simplifier excessivement ;
* ne pas casser les workflows ;
* ne pas mélanger les modules ;
* toujours structurer ;
* toujours nommer correctement ;
* toujours expliquer brièvement.

---

## 14. Phases du projet

1. cadrage ;
2. architecture ;
3. base de données ;
4. modules ;
5. interfaces ;
6. backend ;
7. frontend ;
8. tests ;
9. sécurité ;
10. déploiement.

---

## 15. Objectif final

Créer une application robuste, professionnelle, conforme aux procédures, capable de gérer intégralement le PSLSH/IST, avec traçabilité totale, contrôle interne, reporting fiable et conformité aux normes comptables et financières.


# AGENTS.md

## 1. Contexte du projet

Ce projet consiste à concevoir et développer une application web professionnelle de gestion administrative, budgétaire, financière, comptable, logistique et documentaire du **PSLSH/IST**.

L’application doit refléter fidèlement les procédures du Programme Sectoriel de Lutte contre le Sida, les Hépatites virales et les Infections Sexuellement Transmissibles (PSLSH/IST), en s’appuyant sur :

* le manuel de procédures administratives, financières et comptables ;
* le rapport financier et comptable ;
* le PTCA / PAO / PTBA ;
* la nomenclature budgétaire ;
* le compte de gestion ;
* les pièces types déjà disponibles : expression de besoin, demande de cotation, tableau comparatif, bon de commande, attestation de service fait, PV de réception, ordre de paiement, état de paiement, bordereau de sortie, etc.

L’application n’est pas un simple logiciel de comptabilité.
Elle doit fonctionner comme un **système intégré de gestion de programme public**, couvrant toute la chaîne :

* planification ;
* budgétisation ;
* passation / achats ;
* exécution ;
* comptabilité ;
* paiement ;
* contrôle interne ;
* archivage ;
* reporting.

---

## 2. Objectif principal

Construire une application web sécurisée permettant de :

* gérer les opérations administratives et financières du PSLSH/IST ;
* suivre le budget et son exécution ;
* enregistrer les opérations comptables ;
* gérer les pièces justificatives et les validations ;
* produire automatiquement les états, rapports et documents de gestion ;
* assurer la traçabilité complète des dossiers et opérations.

---

## 3. Logique métier fondamentale

Le cœur fonctionnel du système est le **dossier d’opération / dossier de dépense**.

Toute opération doit être structurée autour d’un dossier unique pouvant contenir :

* expression de besoin ;
* demande de cotation ;
* offres reçues ;
* analyse comparative ;
* bon de commande / contrat ;
* réception / service fait ;
* facture ;
* ordre de paiement ;
* paiement ;
* pièces justificatives ;
* contrôles / anomalies / rejets éventuels.

La logique métier générale est :

Planification → Budget → Dossier d’opération → Exécution → Comptabilité → Paiement → Contrôle → Archivage → Reporting

---

## 4. Modules fonctionnels attendus

L’application doit être organisée en modules cohérents.

### 4.1. Administration et sécurité

* utilisateurs ;
* rôles ;
* permissions ;
* profils agents ;
* séparation des fonctions ;
* historique des actions ;
* validations et workflow.

### 4.2. Planification

* exercices ;
* PTCA / PAO / PTBA ;
* actions stratégiques ;
* activités ;
* cibles ;
* calendrier.

### 4.3. Budget et nomenclature

* rubriques budgétaires ;
* lignes budgétaires ;
* sources de financement ;
* imputation ;
* ventilation par activité, action, source et nature de dépense.

### 4.4. Expression des besoins

* saisie des besoins ;
* désignation ;
* quantités ;
* justifications ;
* rattachement budgétaire.

### 4.5. Passation / achats

* demande de cotation ;
* réception des offres ;
* analyse comparative ;
* attribution ;
* suivi fournisseur.

### 4.6. Commandes / contrats

* bon de commande ;
* contrats ;
* marchés ;
* délais ;
* statuts d’exécution.

### 4.7. Réception / service fait / stock

* réception des biens ;
* attestation de service fait ;
* procès-verbal de réception ;
* bordereau de sortie ;
* stock ;
* magasin ;
* immobilisations.

### 4.8. Comptabilité

* journaux ;
* écritures ;
* plan comptable ;
* journal caisse ;
* journal banque ;
* journal OD ;
* analytique ;
* grand livre ;
* balance ;
* compte de gestion.

### 4.9. Paiement

* liquidation ;
* ordre de paiement ;
* suivi du paiement ;
* modes de paiement ;
* rapprochement avec pièces justificatives.

### 4.10. Contrôle interne et audit

* contrôles de conformité ;
* anomalies ;
* rejets ;
* observations ;
* recommandations ;
* suivi des corrections.

### 4.11. Archivage documentaire

* stockage des pièces ;
* classement par dossier ;
* recherche ;
* versionnage ;
* consultation sécurisée.

### 4.12. Reporting

* rapports financiers ;
* suivi budgétaire ;
* synthèses ;
* tableaux de bord ;
* états d’exécution ;
* exports PDF / Excel.

---

## 5. Règles de développement

Le développement doit toujours respecter les principes suivants :

* clarté du code ;
* lisibilité ;
* modularité ;
* sécurité ;
* traçabilité ;
* évolutivité ;
* cohérence avec les procédures du PSLSH/IST.

Toujours séparer clairement :

* logique métier ;
* base de données ;
* contrôleurs / services ;
* interface utilisateur.

Ne jamais produire un code confus ou monolithique.

---

## 6. Contraintes métier obligatoires

L’application doit intégrer les contraintes suivantes :

* séparation des rôles et responsabilités ;
* workflow de validation ;
* impossibilité de payer une dépense non conforme ;
* contrôle de cohérence des factures et des dates ;
* rattachement obligatoire aux pièces justificatives ;
* rattachement obligatoire à une ligne budgétaire et à une source de financement ;
* traçabilité de chaque modification ;
* journalisation des actions sensibles ;
* archivage de tous les documents liés au dossier.

---

## 7. Référentiels et normes à respecter

Le projet doit être cohérent avec :

* SYSCOHADA ;
* règles nationales de gestion budgétaire et financière ;
* logique d’engagement, liquidation, ordonnancement et paiement ;
* procédures internes PSLSH/IST ;
* logique de reporting des partenaires techniques et financiers.

---

## 8. Architecture technique attendue

Par défaut, privilégier une architecture web professionnelle de type :

* backend structuré ;
* base de données relationnelle ;
* frontend d’administration clair et sobre ;
* API ou services métiers si nécessaire.

Technologies recommandées :

* backend : Laravel / PHP structuré ;
* base de données : MySQL ou PostgreSQL ;
* frontend : interface web d’administration moderne, sobre et orientée gestion.

Toute proposition technique doit rester compatible avec une utilisation institutionnelle.

---

## 9. Base de données

La base de données doit être pensée autour des blocs suivants :

* administration / sécurité ;
* exercices ;
* planification ;
* lignes budgétaires ;
* sources de financement ;
* fournisseurs / bénéficiaires ;
* dossiers d’opération ;
* achats / passation ;
* réception / service fait ;
* comptabilité ;
* paiements ;
* documents ;
* contrôles ;
* reporting.

Toujours privilégier :

* clés primaires claires ;
* relations explicites ;
* nomenclature cohérente ;
* champs d’audit (`created_at`, `updated_at`, `created_by`, etc.).

---

## 10. Interface utilisateur

L’interface doit être :

* professionnelle ;
* sobre ;
* lisible ;
* adaptée à un environnement administratif et financier ;
* orientée productivité ;
* pensée pour des utilisateurs non techniques.

Éviter :

* effets visuels inutiles ;
* design fantaisiste ;
* surcharge graphique ;
* navigation complexe.

Privilégier :

* tableaux clairs ;
* filtres ;
* recherche ;
* fiches détaillées ;
* formulaires structurés ;
* tableaux de bord synthétiques.

---

## 11. Sécurité

Toujours intégrer :

* authentification ;
* gestion des rôles ;
* contrôle des accès ;
* validation serveur ;
* protection contre les suppressions accidentelles ;
* journal d’audit ;
* sauvegarde logique des données ;
* contrôle des pièces jointes.

Aucune suppression définitive sensible ne doit être faite sans mécanisme de sécurité.

---

## 12. Workflow et validations

Les dossiers doivent pouvoir suivre des statuts du type :

* brouillon ;
* soumis ;
* validé administratif ;
* en cotation ;
* analysé ;
* attribué ;
* commandé ;
* réceptionné ;
* service fait ;
* liquidé ;
* ordonnancé ;
* payé ;
* rejeté ;
* suspendu ;
* archivé.

Codex doit toujours respecter cette logique dans les propositions de code et de structure.

---

## 13. Bonnes pratiques pour Codex

Quand tu proposes du code ou une architecture :

* reste fidèle à la logique du manuel de procédures ;
* structure par modules ;
* explique brièvement les choix ;
* évite les raccourcis qui cassent la logique métier ;
* ne propose pas de fonctionnalités inutiles ;
* ne mélange pas les modules ;
* ne remplace pas la logique métier par une logique purement technique.

Quand tu crées des noms de tables, champs, routes ou classes :

* utiliser des noms cohérents ;
* garder une nomenclature stable ;
* éviter les doublons ;
* rester explicite.

---

## 14. Livrables attendus progressivement

Le projet doit avancer par étapes :

1. cadrage fonctionnel ;
2. architecture des modules ;
3. base de données ;
4. workflow métier ;
5. maquettes d’interface ;
6. développement backend ;
7. développement frontend ;
8. reporting ;
9. sécurité et audit ;
10. tests et stabilisation.

---

## 15. Objectif final

Développer une application métier robuste, traçable, institutionnelle et évolutive, capable de soutenir la gestion administrative, budgétaire, financière et comptable du PSLSH/IST, tout en respectant ses procédures internes et les exigences de reddition des comptes.
