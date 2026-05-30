/* ════════════════════════════════════════════════════════════════════════════
   SIGFIC-PSLSH — Système de contrôle d'accès par rôle et service
   Basé sur l'organigramme fonctionnel PSLSH/IST
   ════════════════════════════════════════════════════════════════════════════ */
(function (window) {
  'use strict';

  /* ── 0. Loader de page — règle de chargement uniforme (min. 3 secondes) ─── */

  // Durée minimale garantie d'affichage du loader
  const _LOADER_MIN_MS = 500;
  // Horodatage d'injection (pour calculer le temps écoulé)
  const _loaderStart = Date.now();

  // Texte contextuel selon la page active
  function _getLoaderText() {
    const p = window.location.pathname;
    if (p.indexOf('/dashboard') !== -1) return 'Chargement du tableau de bord\u2026';
    if (p.indexOf('/planification') !== -1) return 'Chargement du module planification\u2026';
    if (p.indexOf('/validation') !== -1) return 'Chargement du centre de validation\u2026';
    if (p.indexOf('/dossiers/detail') !== -1) return 'Chargement du dossier\u2026';
    if (p.indexOf('/dossiers') !== -1) return 'Chargement des dossiers\u2026';
    if (p.indexOf('/passation') !== -1) return 'Chargement du module passation\u2026';
    if (p.indexOf('/commandes') !== -1) return 'Chargement des commandes\u2026';
    if (p.indexOf('/reception') !== -1) return 'Chargement des r\u00e9ceptions\u2026';
    if (p.indexOf('/stock') !== -1) return 'Chargement du stock\u2026';
    if (p.indexOf('/budget') !== -1) return 'Chargement du module budget\u2026';
    if (p.indexOf('/paiement') !== -1) return 'Chargement des paiements\u2026';
    if (p.indexOf('/comptabilite') !== -1) return 'Chargement de la comptabilit\u00e9\u2026';
    if (p.indexOf('/controle') !== -1) return 'Chargement du contr\u00f4le et audit\u2026';
    if (p.indexOf('/archivage') !== -1) return 'Chargement de l\u2019archivage\u2026';
    if (p.indexOf('/reporting') !== -1) return 'Chargement du reporting\u2026';
    if (p.indexOf('/admin') !== -1) return 'Chargement du module administration\u2026';
    if (p.indexOf('/manuel') !== -1) return 'Chargement du manuel des proc\u00e9dures\u2026';
    return 'Chargement en cours\u2026';
  }

  // Injection immédiate du loader pour couvrir le rendu initial
  (function injectPageLoader() {
    if (document.getElementById('sigfic-page-loader')) return;
    const loader = document.createElement('div');
    loader.id = 'sigfic-page-loader';
    loader.innerHTML =
      `<div class="spl-logo"><i class="fas fa-shield-virus"></i></div>` +
      `<div class="spl-brand">SIGFIC&#8209;PSLSH</div>` +
      `<div class="spl-subtitle">Syst\u00e8me Int\u00e9gr\u00e9 de Gestion Financi\u00e8re et Comptable du PSLSH/IST</div>` +
      `<div class="spl-spinner"></div>` +
      `<div class="spl-text">${_getLoaderText()}</div>`;
    (document.body || document.documentElement).appendChild(loader);
  })();

  // Retrait du loader : respecte la durée minimale de 3 secondes
  // Formule : délai = max(0, 3000 - temps_écoulé_depuis_injection)
  function _removePageLoader() {
    const loader = document.getElementById('sigfic-page-loader');
    if (!loader) return;
    const elapsed = Date.now() - _loaderStart;
    const remaining = Math.max(0, _LOADER_MIN_MS - elapsed);
    setTimeout(function () {
      loader.classList.add('spl-fade');
      setTimeout(function () {
        if (loader.parentNode) loader.parentNode.removeChild(loader);
      }, 480);
    }, remaining);
  }

  // Loader bfcache — navigation ← → : 2 secondes
  // pageshow.persisted = true quand la page est restaurée depuis le cache navigateur
  window.addEventListener('pageshow', function (evt) {
    if (!evt.persisted) return; // navigation normale, déjà géré par l'injection initiale

    // Supprimer un éventuel loader résiduel
    const old = document.getElementById('sigfic-page-loader');
    if (old && old.parentNode) old.parentNode.removeChild(old);

    // Injecter un nouveau loader
    const loader = document.createElement('div');
    loader.id = 'sigfic-page-loader';
    loader.innerHTML =
      `<div class="spl-logo"><i class="fas fa-shield-virus"></i></div>` +
      `<div class="spl-brand">SIGFIC&#8209;PSLSH</div>` +
      `<div class="spl-subtitle">Syst\u00e8me Int\u00e9gr\u00e9 de Gestion Financi\u00e8re et Comptable du PSLSH/IST</div>` +
      `<div class="spl-spinner"></div>` +
      `<div class="spl-text">${_getLoaderText()}</div>`;
    document.body.appendChild(loader);

    // Retrait après 2 secondes fixes (navigation rapide)
    setTimeout(function () {
      loader.classList.add('spl-fade');
      setTimeout(function () {
        if (loader.parentNode) loader.parentNode.removeChild(loader);
      }, 480);
    }, 2000);
  });

  /* ── 1. Rôles ────────────────────────────────────────────────────────────── */
  const ROLES = {
    ADMIN: 'administrateur',
    COMITE: 'comite_pilotage',
    COORDINATION: 'coordination',
    CHEF_SERVICE: 'chef_service',
    CONTROLEUR: 'controleur',
    AGENT: 'agent',
  };

  /* ── 2. Services (organigramme PSLSH/IST) ───────────────────────────────── */
  const SERVICES = [
    { id: 'COORD', code: 'COORD', label: 'Coordination PSLSH', color: '#1b2a4a' },
    { id: 'SAF', code: 'SAF', label: 'Service Administratif et Financier', color: '#1b4fa8' },
    {
      id: 'SGAS',
      code: 'SGAS',
      label: 'Service de Gestion des Approvisionnements et des Stocks',
      color: '#2d7a2d',
    },
    { id: 'SEB', code: 'SEB', label: 'Service de Suivi Biologique', color: '#8b4513' },
    { id: 'SPCG', code: 'SPCG', label: 'Service Prise en Charge Globale', color: '#8b0000' },
    { id: 'SPCH', code: 'SPCH', label: 'Service Prise en Charge Hépatites', color: '#b8860b' },
    {
      id: 'SPSAC',
      code: 'SPSAC',
      label: 'Service Promotion de la Santé et Approche Communautaire',
      color: '#006400',
    },
    {
      id: 'SESRO',
      code: 'SESRO',
      label: 'Service Suivi-Évaluation et Recherche Opérationnelle',
      color: '#4b0082',
    },
    { id: 'SC', code: 'SC', label: 'Service Communication', color: '#00688b' },
    { id: 'APMS', code: 'APMS', label: "Service d'Appui Psycho-Médico-Social", color: '#8b008b' },
    {
      id: 'SLNR',
      code: 'SLNR',
      label: 'Service Laboratoire National de Référence',
      color: '#2f4f4f',
    },
    { id: 'SR', code: 'SR', label: 'Service Rattaché', color: '#556b2f' },
  ];

  /* ── 3. Unités internes par service ─────────────────────────────────────── */
  const UNITES = {
    SAF: [
      { id: 'UC', label: 'Unité Comptable' },
      { id: 'URF', label: 'Unité des Ressources Financières' },
      { id: 'ACUGP', label: 'Assistant Comptable UGP' },
      { id: 'URH', label: 'Unité des Ressources Humaines' },
      { id: 'URML', label: 'Unité des Ressources Matérielles et Logistiques' },
      { id: 'UI', label: 'Unité Informatique et Maintenance' },
      { id: 'SEC', label: 'Secrétariat SAF' },
    ],
    SGAS: [
      { id: 'UGAS', label: "Unité de Gestion d'Approvisionnement et de Stock" },
      { id: 'ULEB', label: 'Unité des Laboratoires et Équipements Biomédicaux' },
    ],
    SEB: [{ id: 'UCV', label: 'Unité Charge Virale' }],
    SPCG: [
      { id: 'UPCYIH', label: 'Unité de Prise en Charge YIH' },
      { id: 'UPCN', label: 'Unité de Prise en Charge Nutritionnelle' },
      { id: 'UPCIST', label: 'Unité de Prise en Charge IST' },
    ],
    SPCH: [{ id: 'UPCH', label: 'Unité de Prise en Charge Hépatites' }],
    SPSAC: [],
    SESRO: [
      { id: 'UDGD', label: 'Unité DHIS2 et Gestion des Données' },
      { id: 'URO', label: 'Unité Recherche Opérationnelle' },
      { id: 'USP', label: 'Unité de Suivi Programmatique' },
    ],
    SC: [],
    APMS: [
      { id: 'CAPMS', label: 'Coordinatrice APMS' },
      { id: 'UPCB', label: 'UPCB' },
      { id: 'UPCM', label: 'UPC/M' },
      { id: 'UPIH', label: 'UPIH' },
      { id: 'UP', label: 'UP' },
      { id: 'ULABO', label: 'U-Labo' },
      { id: 'UCD', label: 'UCD' },
      { id: 'UAO', label: 'UAO' },
    ],
    SLNR: [],
    SR: [],
  };

  /* ── 4. Menus par rôle ───────────────────────────────────────────────────── */
  /*
   * Architecture à 8 navigateurs :
   *   1. Tableau de bord   2. Planification    3. Centre de validation
   *   4. Opérations        5. Budget           6. Finances
   *   7. Contrôle & audit  8. Administration
   */
  const MENUS = {
    /* ════════════════════════════════════════════════════════════════
       ADMINISTRATEUR — accès complet système + pilotage métier
    ════════════════════════════════════════════════════════════════ */
    administrateur: [
      {
        section: 'TABLEAU DE BORD',
        icon: 'fa-tachometer-alt',
        items: [
          {
            href: '/pages/dashboard/index.html',
            icon: 'fa-chart-line',
            label: 'Vue système globale',
          },
          { href: '/pages/dashboard/alertes.html', icon: 'fa-bell', label: 'Alertes & urgences' },
        ],
      },
      {
        section: 'PLANIFICATION',
        icon: 'fa-project-diagram',
        items: [
          {
            href: '/pages/planification/pao-global.html',
            icon: 'fa-project-diagram',
            label: 'PAO Global',
          },
          {
            href: '/pages/planification/pao-service.html',
            icon: 'fa-layer-group',
            label: 'PAO par service',
          },
          {
            href: '/pages/planification/plan-achat.html',
            icon: 'fa-shopping-cart',
            label: "Plan d'achat des intrants",
          },
          {
            href: '/pages/planification/fonds-alloues.html',
            icon: 'fa-hand-holding-usd',
            label: 'Fonds alloués',
          },
          {
            href: '/pages/planification/fonds-disponibles.html',
            icon: 'fa-piggy-bank',
            label: 'Fonds disponibles',
          },
        ],
      },
      {
        section: 'CENTRE DE VALIDATION',
        icon: 'fa-check-double',
        items: [
          {
            href: '/pages/validation/index.html',
            icon: 'fa-tasks',
            label: "File d'attente globale",
            badge: 'warning',
          },
          {
            href: '/pages/validation/pao.html',
            icon: 'fa-project-diagram',
            label: 'Validations PAO',
          },
          {
            href: '/pages/validation/besoins.html',
            icon: 'fa-list-check',
            label: 'Expressions de besoins',
          },
          {
            href: '/pages/validation/commandes.html',
            icon: 'fa-file-contract',
            label: 'Bons de commande',
          },
          {
            href: '/pages/validation/paiements.html',
            icon: 'fa-money-check-alt',
            label: 'Ordres de paiement',
          },
          { href: '/pages/validation/rapports.html', icon: 'fa-file-alt', label: 'Rapports' },
          {
            href: '/pages/validation/historique.html',
            icon: 'fa-history',
            label: 'Historique des décisions',
          },
        ],
      },
      {
        section: 'OPÉRATIONS',
        icon: 'fa-cogs',
        items: [
          { href: '/pages/dossiers/besoins.html', icon: 'fa-list-check',  label: 'Expression de besoins' },
          { href: '/pages/dossiers/besoins.html?action=new',     icon: 'fa-plus-circle',   label: 'Saisir un nouveau besoin',         sub: true },
          { href: '/pages/dossiers/besoins.html?filter=mine',    icon: 'fa-user-clock',    label: 'Mes besoins en cours',             sub: true },
          { href: '/pages/dossiers/besoins.html?filter=pending', icon: 'fa-hourglass-half',label: 'Besoins en attente de validation', sub: true },
          { href: '/pages/dossiers/index.html',   icon: 'fa-folder-open', label: "Dossiers d'opération" },
        ],
      },
      {
        section: 'RESSOURCES & MOYENS',
        icon: 'fa-toolbox',
        items: [
          { href: '/pages/stock/index.html',     icon: 'fa-boxes',     label: 'Stock & immobilisations' },
          { href: '/pages/carburant/index.html', icon: 'fa-gas-pump',  label: 'Gestion des carburants' },
          { href: '/pages/rh/index.html',        icon: 'fa-users',     label: 'Ressources humaines' },
        ],
      },
      {
        section: 'BUDGET',
        icon: 'fa-coins',
        items: [
          { href: '/pages/budget/synthese.html', icon: 'fa-chart-pie', label: 'Synthèse globale' },
          { href: '/pages/budget/recettes.html', icon: 'fa-arrow-trend-up', label: 'Recettes' },
          {
            href: '/pages/budget/depenses.html',
            icon: 'fa-file-invoice-dollar',
            label: 'Dépenses',
          },
        ],
      },
      {
        section: 'FINANCES',
        icon: 'fa-university',
        items: [
          {
            href: '/pages/paiement/index.html',
            icon: 'fa-money-check-alt',
            label: 'Paiements & liquidations',
          },
          { href: '/pages/paiement/virements.html', icon: 'fa-exchange-alt', label: 'Virements' },
          {
            href: '/pages/comptabilite/index.html',
            icon: 'fa-book',
            label: 'Comptabilité SYSCOHADA',
          },
          {
            href: '/pages/comptabilite/journaux.html',
            icon: 'fa-journal-whills',
            label: 'Journaux comptables',
          },
          {
            href: '/pages/comptabilite/grand-livre.html',
            icon: 'fa-book-open',
            label: 'Grand livre',
          },
          { href: '/pages/comptabilite/balance.html', icon: 'fa-balance-scale', label: 'Balance' },
          {
            href: '/pages/comptabilite/tresorerie.html',
            icon: 'fa-piggy-bank',
            label: 'Trésorerie',
          },
          {
            href: '/pages/comptabilite/rapprochement.html',
            icon: 'fa-sync-alt',
            label: 'Rapprochement bancaire',
          },
        ],
      },
      {
        section: 'CONTRÔLE & AUDIT',
        icon: 'fa-search',
        items: [
          {
            href: '/pages/controle/index.html',
            icon: 'fa-shield-check',
            label: 'Contrôle interne',
          },
          {
            href: '/pages/controle/conformite.html',
            icon: 'fa-clipboard-check',
            label: 'Contrôle de conformité',
          },
          {
            href: '/pages/controle/anomalies.html',
            icon: 'fa-exclamation-triangle',
            label: 'Anomalies & rejets',
          },
          { href: '/pages/controle/audit-log.html', icon: 'fa-history', label: "Journal d'audit" },
          { href: '/pages/controle/piste.html', icon: 'fa-route', label: "Piste d'audit" },
          {
            href: '/pages/archivage/index.html',
            icon: 'fa-archive',
            label: 'Archivage documentaire',
          },
          { href: '/pages/reporting/index.html', icon: 'fa-chart-pie', label: 'Reporting & états' },
        ],
      },
      {
        section: 'ADMINISTRATION',
        icon: 'fa-cog',
        items: [
          { href: '/pages/admin/index.html', icon: 'fa-shield-alt', label: 'Vue administration' },
          { href: '/pages/admin/users.html', icon: 'fa-users-cog', label: 'Comptes utilisateurs' },
          { href: '/pages/admin/roles.html', icon: 'fa-key', label: 'Rôles & autorisations' },
          { href: '/pages/admin/services.html', icon: 'fa-sitemap', label: 'Services & unités' },
          { href: '/pages/admin/parametrage.html', icon: 'fa-cog', label: 'Paramètres système' },
          {
            href: '/pages/admin/campagnes.html',
            icon: 'fa-calendar-check',
            label: 'Exercices budgétaires',
          },
          { href: '/pages/admin/referentiels.html', icon: 'fa-database', label: 'Référentiels' },
          { href: '/pages/admin/securite.html', icon: 'fa-lock', label: 'Sécurité & sessions' },
          { href: '/pages/admin/notifications.html', icon: 'fa-bell', label: 'Notifications' },
        ],
      },
      {
        section: 'MANUEL DES PROC\u00c9DURES',
        icon: 'fa-book-open',
        items: [
          { href: '/pages/manuel/index.html', icon: 'fa-book-open', label: 'Vue d\u2019ensemble' },
          {
            href: '/pages/manuel/index.html#part1',
            icon: 'fa-users-cog',
            label: 'Partie I : Proc\u00e9dures administratives',
          },
          {
            href: '/pages/manuel/index.html#part2',
            icon: 'fa-coins',
            label: 'Partie II : Proc\u00e9dures financi\u00e8res',
          },
          {
            href: '/pages/manuel/index.html#part3',
            icon: 'fa-calculator',
            label: 'Partie III : Comptabilit\u00e9 & March\u00e9s',
          },
        ],
      },
    ],

    /* ════════════════════════════════════════════════════════════════
       COORDINATION — accès complet métier, pilotage et validation
    ════════════════════════════════════════════════════════════════ */
    coordination: [
      {
        section: 'TABLEAU DE BORD',
        icon: 'fa-tachometer-alt',
        items: [
          { href: '/pages/dashboard/index.html', icon: 'fa-chart-line', label: 'Tableau de bord' },
          { href: '/pages/dashboard/alertes.html', icon: 'fa-bell', label: 'Alertes & urgences' },
          {
            href: '/pages/dashboard/indicateurs.html',
            icon: 'fa-chart-bar',
            label: "Indicateurs d'exécution",
          },
        ],
      },
      {
        section: 'PLANIFICATION',
        icon: 'fa-project-diagram',
        items: [
          {
            href: '/pages/planification/pao-global.html',
            icon: 'fa-project-diagram',
            label: 'PAO Global',
          },
          {
            href: '/pages/planification/pao-service.html',
            icon: 'fa-layer-group',
            label: 'PAO par service',
          },
          {
            href: '/pages/planification/plan-achat.html',
            icon: 'fa-shopping-cart',
            label: "Plan d'achat des intrants",
          },
          {
            href: '/pages/planification/fonds-alloues.html',
            icon: 'fa-hand-holding-usd',
            label: 'Fonds alloués',
          },
          {
            href: '/pages/planification/fonds-disponibles.html',
            icon: 'fa-piggy-bank',
            label: 'Fonds disponibles',
          },
        ],
      },
      {
        section: 'CENTRE DE VALIDATION',
        icon: 'fa-check-double',
        items: [
          {
            href: '/pages/validation/index.html',
            icon: 'fa-tasks',
            label: "File d'attente",
            badge: 'warning',
          },
          {
            href: '/pages/validation/pao.html',
            icon: 'fa-project-diagram',
            label: 'Validations PAO',
          },
          {
            href: '/pages/validation/besoins.html',
            icon: 'fa-list-check',
            label: 'Expressions de besoins',
          },
          {
            href: '/pages/validation/commandes.html',
            icon: 'fa-file-contract',
            label: 'Bons de commande',
          },
          {
            href: '/pages/validation/paiements.html',
            icon: 'fa-money-check-alt',
            label: 'Ordres de paiement',
          },
          {
            href: '/pages/validation/historique.html',
            icon: 'fa-history',
            label: 'Historique des décisions',
          },
        ],
      },
      {
        section: 'OPÉRATIONS',
        icon: 'fa-cogs',
        items: [
          { href: '/pages/dossiers/besoins.html', icon: 'fa-list-check',  label: 'Expression de besoins' },
          { href: '/pages/dossiers/besoins.html?action=new',     icon: 'fa-plus-circle',   label: 'Saisir un nouveau besoin',         sub: true },
          { href: '/pages/dossiers/besoins.html?filter=mine',    icon: 'fa-user-clock',    label: 'Mes besoins en cours',             sub: true },
          { href: '/pages/dossiers/besoins.html?filter=pending', icon: 'fa-hourglass-half',label: 'Besoins en attente de validation', sub: true },
          { href: '/pages/dossiers/index.html',   icon: 'fa-folder-open', label: "Dossiers d'opération" },
        ],
      },
      {
        section: 'RESSOURCES & MOYENS',
        icon: 'fa-toolbox',
        items: [
          { href: '/pages/stock/index.html',     icon: 'fa-boxes',     label: 'Stock & immobilisations' },
          { href: '/pages/carburant/index.html', icon: 'fa-gas-pump',  label: 'Gestion des carburants' },
          { href: '/pages/rh/index.html',        icon: 'fa-users',     label: 'Ressources humaines' },
        ],
      },
      {
        section: 'BUDGET',
        icon: 'fa-coins',
        items: [
          { href: '/pages/budget/synthese.html', icon: 'fa-chart-pie', label: 'Synthèse globale' },
          { href: '/pages/budget/recettes.html', icon: 'fa-arrow-trend-up', label: 'Recettes' },
          {
            href: '/pages/budget/depenses.html',
            icon: 'fa-file-invoice-dollar',
            label: 'Dépenses',
          },
        ],
      },
      {
        section: 'FINANCES',
        icon: 'fa-university',
        items: [
          {
            href: '/pages/paiement/index.html',
            icon: 'fa-money-check-alt',
            label: 'Paiements & liquidations',
          },
          { href: '/pages/paiement/virements.html', icon: 'fa-exchange-alt', label: 'Virements' },
          {
            href: '/pages/comptabilite/index.html',
            icon: 'fa-book',
            label: 'Comptabilité SYSCOHADA',
          },
          {
            href: '/pages/comptabilite/journaux.html',
            icon: 'fa-journal-whills',
            label: 'Journaux comptables',
          },
          {
            href: '/pages/comptabilite/grand-livre.html',
            icon: 'fa-book-open',
            label: 'Grand livre',
          },
          { href: '/pages/comptabilite/balance.html', icon: 'fa-balance-scale', label: 'Balance' },
          {
            href: '/pages/comptabilite/tresorerie.html',
            icon: 'fa-piggy-bank',
            label: 'Trésorerie',
          },
          {
            href: '/pages/comptabilite/rapprochement.html',
            icon: 'fa-sync-alt',
            label: 'Rapprochement bancaire',
          },
        ],
      },
      {
        section: 'CONTRÔLE & AUDIT',
        icon: 'fa-search',
        items: [
          {
            href: '/pages/controle/index.html',
            icon: 'fa-shield-check',
            label: 'Contrôle interne',
          },
          {
            href: '/pages/controle/anomalies.html',
            icon: 'fa-exclamation-triangle',
            label: 'Anomalies & rejets',
          },
          { href: '/pages/controle/audit-log.html', icon: 'fa-history', label: "Journal d'audit" },
          {
            href: '/pages/archivage/index.html',
            icon: 'fa-archive',
            label: 'Archivage documentaire',
          },
          { href: '/pages/reporting/index.html', icon: 'fa-chart-pie', label: 'Reporting & états' },
        ],
      },
      {
        section: 'ADMINISTRATION',
        icon: 'fa-cog',
        items: [
          { href: '/pages/admin/users.html', icon: 'fa-users-cog', label: 'Utilisateurs & rôles' },
          {
            href: '/pages/admin/campagnes.html',
            icon: 'fa-calendar-check',
            label: 'Exercices budgétaires',
          },
          {
            href: '/pages/admin/audit-log.html',
            icon: 'fa-history',
            label: "Journal d'audit système",
          },
        ],
      },
      {
        section: 'MANUEL DES PROC\u00c9DURES',
        icon: 'fa-book-open',
        items: [
          { href: '/pages/manuel/index.html', icon: 'fa-book-open', label: 'Vue d\u2019ensemble' },
          {
            href: '/pages/manuel/index.html#part1',
            icon: 'fa-users-cog',
            label: 'Partie I : Proc\u00e9dures administratives',
          },
          {
            href: '/pages/manuel/index.html#part2',
            icon: 'fa-coins',
            label: 'Partie II : Proc\u00e9dures financi\u00e8res',
          },
          {
            href: '/pages/manuel/index.html#part3',
            icon: 'fa-calculator',
            label: 'Partie III : Comptabilit\u00e9 & March\u00e9s',
          },
        ],
      },
    ],

    /* ════════════════════════════════════════════════════════════════
       CHEF DE SERVICE — périmètre de son service
    ════════════════════════════════════════════════════════════════ */
    chef_service: [
      {
        section: 'TABLEAU DE BORD',
        icon: 'fa-tachometer-alt',
        items: [
          { href: '/pages/dashboard/index.html', icon: 'fa-home', label: 'Mon tableau de bord' },
          { href: '/pages/dashboard/alertes.html', icon: 'fa-bell', label: 'Mes alertes' },
        ],
      },
      {
        section: 'PLANIFICATION',
        icon: 'fa-project-diagram',
        items: [
          {
            href: '/pages/planification/pao-global.html',
            icon: 'fa-project-diagram',
            label: 'PAO Global',
          },
          {
            href: '/pages/planification/pao-service.html',
            icon: 'fa-layer-group',
            label: 'PAO par service',
          },
          {
            href: '/pages/planification/plan-achat.html',
            icon: 'fa-shopping-cart',
            label: "Plan d'achat des intrants",
          },
          {
            href: '/pages/planification/fonds-alloues.html',
            icon: 'fa-hand-holding-usd',
            label: 'Fonds alloués',
          },
          {
            href: '/pages/planification/fonds-disponibles.html',
            icon: 'fa-piggy-bank',
            label: 'Fonds disponibles',
          },
        ],
      },
      {
        section: 'CENTRE DE VALIDATION',
        icon: 'fa-check-double',
        items: [
          {
            href: '/pages/validation/index.html',
            icon: 'fa-tasks',
            label: 'Mes soumissions',
            badge: 'warning',
          },
          { href: '/pages/validation/historique.html', icon: 'fa-history', label: 'Historique' },
        ],
      },
      {
        section: 'OPÉRATIONS',
        icon: 'fa-cogs',
        items: [
          { href: '/pages/dossiers/besoins.html', icon: 'fa-list-check',  label: 'Expression de besoins' },
          { href: '/pages/dossiers/besoins.html?action=new',     icon: 'fa-plus-circle',   label: 'Saisir un nouveau besoin',         sub: true },
          { href: '/pages/dossiers/besoins.html?filter=mine',    icon: 'fa-user-clock',    label: 'Mes besoins en cours',             sub: true },
          { href: '/pages/dossiers/besoins.html?filter=pending', icon: 'fa-hourglass-half',label: 'Besoins en attente de validation', sub: true },
          { href: '/pages/dossiers/index.html',   icon: 'fa-folder-open', label: "Dossiers d'opération" },
        ],
      },
      {
        section: 'RESSOURCES & MOYENS',
        icon: 'fa-toolbox',
        items: [
          { href: '/pages/stock/index.html',     icon: 'fa-boxes',     label: 'Stock & immobilisations' },
          { href: '/pages/carburant/index.html', icon: 'fa-gas-pump',  label: 'Gestion des carburants' },
          { href: '/pages/rh/index.html',        icon: 'fa-users',     label: 'Ressources humaines' },
        ],
      },
      {
        section: 'BUDGET',
        icon: 'fa-coins',
        items: [
          {
            href: '/pages/budget/depenses.html',
            icon: 'fa-file-invoice-dollar',
            label: 'Mes dépenses',
          },
        ],
      },
      {
        section: 'FINANCES',
        icon: 'fa-university',
        items: [
          {
            href: '/pages/paiement/index.html',
            icon: 'fa-money-check-alt',
            label: 'Mes paiements',
          },
        ],
      },
      {
        section: 'CONTRÔLE & AUDIT',
        icon: 'fa-search',
        items: [
          { href: '/pages/archivage/index.html', icon: 'fa-archive', label: 'Mes justificatifs' },
          { href: '/pages/reporting/index.html', icon: 'fa-file-alt', label: 'Mes rapports' },
        ],
      },
      {
        section: 'MANUEL DES PROC\u00c9DURES',
        icon: 'fa-book-open',
        items: [
          { href: '/pages/manuel/index.html', icon: 'fa-book-open', label: 'Vue d\u2019ensemble' },
          {
            href: '/pages/manuel/index.html#part1',
            icon: 'fa-users-cog',
            label: 'Partie I : Proc\u00e9dures administratives',
          },
          {
            href: '/pages/manuel/index.html#part2',
            icon: 'fa-coins',
            label: 'Partie II : Proc\u00e9dures financi\u00e8res',
          },
          {
            href: '/pages/manuel/index.html#part3',
            icon: 'fa-calculator',
            label: 'Partie III : Comptabilit\u00e9 & March\u00e9s',
          },
        ],
      },
    ],

    /* ════════════════════════════════════════════════════════════════
       COMITÉ DE PILOTAGE — lecture, synthèse, revue stratégique
    ════════════════════════════════════════════════════════════════ */
    comite_pilotage: [
      {
        section: 'TABLEAU DE BORD',
        icon: 'fa-tachometer-alt',
        items: [
          { href: '/pages/dashboard/index.html', icon: 'fa-chart-line', label: 'Vue globale' },
          {
            href: '/pages/dashboard/indicateurs.html',
            icon: 'fa-chart-bar',
            label: "Indicateurs d'exécution",
          },
          { href: '/pages/dashboard/alertes.html', icon: 'fa-bell', label: 'Alertes' },
        ],
      },
      {
        section: 'PLANIFICATION',
        icon: 'fa-project-diagram',
        items: [
          {
            href: '/pages/planification/pao-global.html',
            icon: 'fa-project-diagram',
            label: 'PAO Global',
          },
          {
            href: '/pages/planification/pao-service.html',
            icon: 'fa-layer-group',
            label: 'PAO par service',
          },
          {
            href: '/pages/planification/plan-achat.html',
            icon: 'fa-shopping-cart',
            label: "Plan d'achat des intrants",
          },
          {
            href: '/pages/planification/fonds-alloues.html',
            icon: 'fa-hand-holding-usd',
            label: 'Fonds alloués',
          },
          {
            href: '/pages/planification/fonds-disponibles.html',
            icon: 'fa-piggy-bank',
            label: 'Fonds disponibles',
          },
        ],
      },
      {
        section: 'BUDGET',
        icon: 'fa-coins',
        items: [
          { href: '/pages/budget/synthese.html', icon: 'fa-chart-pie', label: 'Synthèse globale' },
          { href: '/pages/budget/recettes.html', icon: 'fa-arrow-trend-up', label: 'Recettes' },
        ],
      },
      {
        section: 'FINANCES',
        icon: 'fa-university',
        items: [
          {
            href: '/pages/comptabilite/tresorerie.html',
            icon: 'fa-piggy-bank',
            label: 'État de trésorerie',
          },
        ],
      },
      {
        section: 'CONTRÔLE & AUDIT',
        icon: 'fa-search',
        items: [
          {
            href: '/pages/reporting/index.html',
            icon: 'fa-file-alt',
            label: 'Rapports stratégiques',
          },
          {
            href: '/pages/controle/index.html',
            icon: 'fa-shield-check',
            label: 'Tableau des contrôles',
          },
        ],
      },
      {
        section: 'MANUEL DES PROC\u00c9DURES',
        icon: 'fa-book-open',
        items: [
          { href: '/pages/manuel/index.html', icon: 'fa-book-open', label: 'Vue d\u2019ensemble' },
          {
            href: '/pages/manuel/index.html#part1',
            icon: 'fa-users-cog',
            label: 'Partie I : Proc\u00e9dures administratives',
          },
          {
            href: '/pages/manuel/index.html#part2',
            icon: 'fa-coins',
            label: 'Partie II : Proc\u00e9dures financi\u00e8res',
          },
          {
            href: '/pages/manuel/index.html#part3',
            icon: 'fa-calculator',
            label: 'Partie III : Comptabilit\u00e9 & March\u00e9s',
          },
        ],
      },
    ],

    /* ════════════════════════════════════════════════════════════════
       CONTRÔLEUR / AUDITEUR — lecture renforcée, traçabilité
    ════════════════════════════════════════════════════════════════ */
    controleur: [
      {
        section: 'TABLEAU DE BORD',
        icon: 'fa-tachometer-alt',
        items: [
          { href: '/pages/dashboard/index.html', icon: 'fa-chart-line', label: 'Vue de contrôle' },
          { href: '/pages/dashboard/alertes.html', icon: 'fa-bell', label: 'Alertes & anomalies' },
        ],
      },
      {
        section: 'OPÉRATIONS',
        icon: 'fa-cogs',
        items: [
          { href: '/pages/dossiers/besoins.html', icon: 'fa-list-check',  label: 'Expression de besoins' },
          { href: '/pages/dossiers/besoins.html?action=new',     icon: 'fa-plus-circle',   label: 'Saisir un nouveau besoin',         sub: true },
          { href: '/pages/dossiers/besoins.html?filter=mine',    icon: 'fa-user-clock',    label: 'Mes besoins en cours',             sub: true },
          { href: '/pages/dossiers/besoins.html?filter=pending', icon: 'fa-hourglass-half',label: 'Besoins en attente de validation', sub: true },
          { href: '/pages/dossiers/index.html',   icon: 'fa-folder-open', label: "Dossiers d'opération" },
        ],
      },
      {
        section: 'RESSOURCES & MOYENS',
        icon: 'fa-toolbox',
        items: [
          { href: '/pages/stock/index.html',     icon: 'fa-boxes',     label: 'Stock & immobilisations' },
          { href: '/pages/carburant/index.html', icon: 'fa-gas-pump',  label: 'Gestion des carburants' },
          { href: '/pages/rh/index.html',        icon: 'fa-users',     label: 'Ressources humaines' },
        ],
      },
      {
        section: 'FINANCES',
        icon: 'fa-university',
        items: [
          {
            href: '/pages/paiement/index.html',
            icon: 'fa-money-check-alt',
            label: 'Paiements (lecture)',
          },
          {
            href: '/pages/comptabilite/journaux.html',
            icon: 'fa-journal-whills',
            label: 'Journaux comptables',
          },
          {
            href: '/pages/comptabilite/grand-livre.html',
            icon: 'fa-book-open',
            label: 'Grand livre',
          },
        ],
      },
      {
        section: 'CONTRÔLE & AUDIT',
        icon: 'fa-search',
        items: [
          {
            href: '/pages/controle/index.html',
            icon: 'fa-shield-check',
            label: 'Contrôle interne',
          },
          {
            href: '/pages/controle/conformite.html',
            icon: 'fa-clipboard-check',
            label: 'Contrôle de conformité',
          },
          {
            href: '/pages/controle/anomalies.html',
            icon: 'fa-exclamation-triangle',
            label: 'Anomalies & rejets',
          },
          { href: '/pages/controle/audit-log.html', icon: 'fa-history', label: "Journal d'audit" },
          { href: '/pages/controle/piste.html', icon: 'fa-route', label: "Piste d'audit" },
          {
            href: '/pages/archivage/index.html',
            icon: 'fa-archive',
            label: 'Archivage documentaire',
          },
          { href: '/pages/reporting/index.html', icon: 'fa-chart-pie', label: 'Reporting & états' },
        ],
      },
      {
        section: 'MANUEL DES PROC\u00c9DURES',
        icon: 'fa-book-open',
        items: [
          { href: '/pages/manuel/index.html', icon: 'fa-book-open', label: 'Vue d\u2019ensemble' },
          {
            href: '/pages/manuel/index.html#part1',
            icon: 'fa-users-cog',
            label: 'Partie I : Proc\u00e9dures administratives',
          },
          {
            href: '/pages/manuel/index.html#part2',
            icon: 'fa-coins',
            label: 'Partie II : Proc\u00e9dures financi\u00e8res',
          },
          {
            href: '/pages/manuel/index.html#part3',
            icon: 'fa-calculator',
            label: 'Partie III : Comptabilit\u00e9 & March\u00e9s',
          },
        ],
      },
    ],

    /* ════════════════════════════════════════════════════════════════
       AGENT — accès de base, tâches ciblées
    ════════════════════════════════════════════════════════════════ */
    agent: [
      {
        section: 'TABLEAU DE BORD',
        icon: 'fa-tachometer-alt',
        items: [{ href: '/pages/dashboard/index.html', icon: 'fa-home', label: 'Accueil' }],
      },
      {
        section: 'OPÉRATIONS',
        icon: 'fa-cogs',
        items: [
          { href: '/pages/dossiers/besoins.html', icon: 'fa-list-check',  label: 'Expression de besoins' },
          { href: '/pages/dossiers/besoins.html?action=new',     icon: 'fa-plus-circle',   label: 'Saisir un nouveau besoin',         sub: true },
          { href: '/pages/dossiers/besoins.html?filter=mine',    icon: 'fa-user-clock',    label: 'Mes besoins en cours',             sub: true },
          { href: '/pages/dossiers/besoins.html?filter=pending', icon: 'fa-hourglass-half',label: 'Besoins en attente de validation', sub: true },
          { href: '/pages/dossiers/index.html',   icon: 'fa-folder-open', label: "Dossiers d'opération" },
        ],
      },
      {
        section: 'RESSOURCES & MOYENS',
        icon: 'fa-toolbox',
        items: [
          { href: '/pages/stock/index.html',     icon: 'fa-boxes',     label: 'Stock & immobilisations' },
          { href: '/pages/carburant/index.html', icon: 'fa-gas-pump',  label: 'Gestion des carburants' },
          { href: '/pages/rh/index.html',        icon: 'fa-users',     label: 'Ressources humaines' },
        ],
      },
      {
        section: 'CONTRÔLE & AUDIT',
        icon: 'fa-search',
        items: [
          { href: '/pages/archivage/index.html', icon: 'fa-archive', label: 'Mes documents' },
        ],
      },
      {
        section: 'MANUEL DES PROC\u00c9DURES',
        icon: 'fa-book-open',
        items: [
          { href: '/pages/manuel/index.html', icon: 'fa-book-open', label: 'Vue d\u2019ensemble' },
          {
            href: '/pages/manuel/index.html#part1',
            icon: 'fa-users-cog',
            label: 'Partie I : Proc\u00e9dures administratives',
          },
          {
            href: '/pages/manuel/index.html#part2',
            icon: 'fa-coins',
            label: 'Partie II : Proc\u00e9dures financi\u00e8res',
          },
          {
            href: '/pages/manuel/index.html#part3',
            icon: 'fa-calculator',
            label: 'Partie III : Comptabilit\u00e9 & March\u00e9s',
          },
        ],
      },
    ],
  };

  /* ── 5. Helpers utilisateur ──────────────────────────────────────────────── */
  function getUser() {
    try {
      const u = localStorage.getItem('pslsh_user');
      return u ? JSON.parse(u) : null;
    } catch (e) {
      return null;
    }
  }

  function getRole() {
    const u = getUser();
    if (!u) return null;
    // Supporte u.role (string), u.roles (array du backend), ou u.profil
    let raw = u.role || u.profil || '';
    if (!raw && Array.isArray(u.roles) && u.roles.length) raw = u.roles[0];
    const r = `${raw}`.toLowerCase();
    if (r === 'administrateur' || r === 'admin' || r === 'super_admin') return 'administrateur';
    if (r.includes('coordin') || r === 'coordinateur') return 'coordination';
    // SAF (gestionnaire) et Comptable (AC) ont les mêmes accès que la coordination
    if (r === 'gestionnaire' || r === 'comptable') return 'coordination';
    if (r.includes('comite') || r.includes('pilotage') || r.includes('direction'))
      return 'comite_pilotage';
    if (r.includes('chef') || r.includes('responsable') || r.includes('directeur'))
      return 'chef_service';
    if (r === 'auditeur' || r === 'archiviste' || r === 'controleur' || r === 'inspecteur')
      return 'controleur';
    return 'agent'; // défaut
  }

  function getServiceId() {
    const u = getUser();
    return u ? u.service_id || u.service || null : null;
  }

  function getServiceObj() {
    const sid = getServiceId();
    return SERVICES.find((s) => s.id === sid || s.code === sid) || null;
  }

  function getServiceLabel() {
    const s = getServiceObj();
    return s ? s.label : '';
  }

  function getServiceColor() {
    const s = getServiceObj();
    return s ? s.color : '#1b2a4a';
  }

  /* ── 6. Rendu dynamique de la sidebar ───────────────────────────────────── */

  /* Détecte le navigateur actif d'après l'URL courante.
   * Retourne le nom de section exact (tel que défini dans MENUS),
   * ou null si la page n'appartient à aucun navigateur (ex. accueil). */
  function _detectActiveNavigator(pathname) {
    if (
      pathname.indexOf('/dashboard') !== -1 ||
      pathname.indexOf('/alertes') !== -1 ||
      pathname.indexOf('/indicateurs') !== -1
    ) {
      return 'TABLEAU DE BORD';
    }
    if (pathname.indexOf('/planification') !== -1) {
      return 'PLANIFICATION';
    }
    if (pathname.indexOf('/validation') !== -1) {
      return 'CENTRE DE VALIDATION';
    }
    if (
      pathname.indexOf('/dossiers') !== -1 ||
      pathname.indexOf('/passation') !== -1 ||
      pathname.indexOf('/commandes') !== -1 ||
      pathname.indexOf('/reception') !== -1
    ) {
      return 'OP\u00c9RATIONS';
    }
    if (
      pathname.indexOf('/stock') !== -1 ||
      pathname.indexOf('/carburant') !== -1 ||
      pathname.indexOf('/rh') !== -1
    ) {
      return 'RESSOURCES & MOYENS';
    }
    if (pathname.indexOf('/budget') !== -1) {
      return 'BUDGET';
    }
    if (pathname.indexOf('/paiement') !== -1 || pathname.indexOf('/comptabilite') !== -1) {
      return 'FINANCES';
    }
    if (
      pathname.indexOf('/controle') !== -1 ||
      pathname.indexOf('/archivage') !== -1 ||
      pathname.indexOf('/reporting') !== -1
    ) {
      return 'CONTR\u00d4LE \u0026 AUDIT';
    }
    if (pathname.indexOf('/admin') !== -1) {
      return 'ADMINISTRATION';
    }
    if (pathname.indexOf('/manuel') !== -1) {
      return 'MANUEL DES PROC\u00c9DURES';
    }
    return null; // accueil ou page inconnue → pas de filtrage
  }

  function renderSidebarNav(targetId) {
    const nav = document.getElementById(targetId || 'sidebarNav');
    if (!nav) return;

    const role = getRole();
    const menu = MENUS[role] || MENUS.chef_service;
    const path = window.location.pathname;

    /* Filtrer sur le navigateur actif uniquement */
    const activeSection = _detectActiveNavigator(path);
    let filteredMenu = activeSection
      ? menu.filter(function (g) {
          return g.section === activeSection;
        })
      : menu;
    /* Sécurité : si aucune section ne correspond, afficher tout */
    if (!filteredMenu.length) filteredMenu = menu;

    /* Lire l'état des sections pliées depuis localStorage */
    let collapsed = {};
    try {
      collapsed = JSON.parse(localStorage.getItem('pslsh_nav_collapsed') || '{}');
    } catch (e) {}

    /* Lien de retour au portail (toujours visible en haut de la sidebar) */
    let html =
      '<a href="/pages/accueil/index.html" class="nav-link nav-back-home" title="Retour au portail — changer de navigateur">' +
      '<i class="fas fa-th-large"></i><span>Changer de navigateur</span></a>';

    for (const group of filteredMenu) {
      const sectionKey = group.section.replace(/\s+/g, '_');
      const isCollapsed = collapsed[sectionKey] === true;
      /* Vérifier si la section contient le lien actif → forcer l'ouverture */
      const hasActive = group.items.some((item) =>
        path.includes(item.href.replace('/pages', '').replace(/\/$/, ''))
      );
      const open = hasActive ? true : !isCollapsed;

      html += `
        <div class="nav-section-header${open ? '' : ' nav-sec-closed'}"
             onclick="_toggleNavSection('${sectionKey}', this)"
             title="${open ? 'R\u00e9duire' : 'D\u00e9velopper'}">
          <span>${group.section}</span>
          <i class="fas fa-chevron-${open ? 'down' : 'right'} nav-sec-chevron"></i>
        </div>
        <div class="nav-section-items" style="display:${open ? 'block' : 'none'}">`;

      for (const item of group.items) {
        const hrefBase = item.href.split('?')[0];
        const queryMatch = item.href.includes('?')
          ? (window.location.search === item.href.substring(item.href.indexOf('?')))
          : (!window.location.search || hrefBase !== path.split('?')[0]);
        const active = path.includes(hrefBase.replace('/pages', '').replace(/\/$/, '')) && queryMatch
          ? ' active'
          : '';
        const badge = item.badge ? `<span class="nav-badge"></span>` : '';
        const subClass = item.sub ? ' nav-sub' : '';
        html += `
          <a href="${item.href}" class="nav-link${active}${subClass}" title="${item.label}">
            <i class="fas ${item.icon}"></i>
            <span>${item.label}</span>${badge}
          </a>`;
      }
      html += `</div>`;
    }
    nav.innerHTML = html;
  }

  /* Basculer une section nav */
  window._toggleNavSection = function (key, headerEl) {
    const items = headerEl.nextElementSibling;
    if (!items) return;
    const isOpen = items.style.display !== 'none';
    items.style.display = isOpen ? 'none' : 'block';
    const chevron = headerEl.querySelector('.nav-sec-chevron');
    if (chevron) chevron.className = `fas fa-chevron-${isOpen ? 'right' : 'down'} nav-sec-chevron`;
    headerEl.classList.toggle('nav-sec-closed', isOpen);

    let collapsed = {};
    try {
      collapsed = JSON.parse(localStorage.getItem('pslsh_nav_collapsed') || '{}');
    } catch (e) {}
    collapsed[key] = isOpen;
    localStorage.setItem('pslsh_nav_collapsed', JSON.stringify(collapsed));
  };

  /* ── 7. Badge service dans la sidebar ───────────────────────────────────── */
  function renderServiceBadge() {
    const el = document.getElementById('sidebarServiceBadge');
    if (!el) return;
    const role = getRole();
    const label = getServiceLabel();
    const color = getServiceColor();

    if (role === 'administrateur') {
      el.innerHTML = `<div class="svc-badge svc-badge--coord"><i class="fas fa-shield-alt"></i> Administrateur</div>`;
    } else if (role === 'coordination') {
      el.innerHTML = `<div class="svc-badge svc-badge--coord"><i class="fas fa-network-wired"></i> Coordination</div>`;
    } else if (role === 'comite_pilotage') {
      el.innerHTML = `<div class="svc-badge svc-badge--comite"><i class="fas fa-star"></i> Comité de Pilotage</div>`;
    } else if (role === 'controleur') {
      el.innerHTML = `<div class="svc-badge" style="border-color:#7c3aed40;color:#7c3aed;background:#7c3aed12"><i class="fas fa-search"></i> Contrôle &amp; Audit</div>`;
    } else if (label) {
      el.innerHTML = `<div class="svc-badge" style="border-color:${color}40;color:${color};background:${color}12">
        <i class="fas fa-building"></i> ${label}</div>`;
    }
  }

  /* ── 8. Garde de page ────────────────────────────────────────────────────── */
  function guardPage(allowedRoles) {
    const role = getRole();
    if (!role) {
      window.location.href = '/pages/auth/login.html';
      return false;
    }
    if (allowedRoles && !allowedRoles.includes(role)) {
      window.location.href = '/pages/dashboard/index.html';
      return false;
    }
    return true;
  }

  /* ── 9. Dashboard tri-modal ─────────────────────────────────────────────── */
  function applyDashboardRole() {
    const role = getRole();
    const label = getServiceLabel();
    const color = getServiceColor();

    // Masquer toutes les sections rôle
    ['dashCoordination', 'dashChefService', 'dashComite'].forEach((id) => {
      const el = document.getElementById(id);
      if (el) el.style.display = 'none';
    });

    // Titre welcome bar
    const wbTitle = document.querySelector('.wb-title');
    const wbSub = document.querySelector('.wb-sub');
    if (wbTitle) {
      if (role === 'chef_service' && label) {
        wbTitle.textContent = label;
        if (wbSub) wbSub.textContent = 'Données filtrées à votre service';
      } else if (role === 'comite_pilotage') {
        wbTitle.textContent = 'Comité de Pilotage';
        if (wbSub) wbSub.textContent = 'Accès en lecture, synthèse SIGFIC-PSLSH';
      } else {
        wbTitle.textContent = 'Coordination SIGFIC-PSLSH';
        if (wbSub)
          wbSub.textContent =
            'Programme Sectoriel de Lutte contre le Sida, les Hépatites Virales et les IST';
      }
    }

    // Badge couleur service dans welcome bar
    const wbBar = document.querySelector('.welcome-bar');
    if (wbBar && role === 'chef_service' && color) {
      wbBar.style.borderLeft = `5px solid ${color}`;
    }

    // Afficher la section correspondante
    const sections = {
      administrateur: 'dashCoordination',
      coordination: 'dashCoordination',
      comite_pilotage: 'dashComite',
      chef_service: 'dashChefService',
      controleur: 'dashChefService',
      agent: 'dashChefService',
    };
    const sectionId = sections[role];
    const el = document.getElementById(sectionId);
    if (el) el.style.display = '';

    // Mettre à jour le label service dans le dashboard chef_service
    const svcLabelEl = document.getElementById('myServiceLabel');
    if (svcLabelEl && label) svcLabelEl.textContent = label;
  }

  /* ── 10. Bouton portail + menu navigateurs dans la topbar ──────────────── */
  /* Navigateurs disponibles par section — synchronisé avec la page accueil */
  const _NAV_ITEMS = [
    {
      section: 'TABLEAU DE BORD',
      label: 'Tableau de bord',
      icon: 'fa-chart-line',
      href: '/pages/dashboard/index.html',
      roles: [
        'administrateur',
        'coordination',
        'chef_service',
        'comite_pilotage',
        'controleur',
        'agent',
      ],
    },
    {
      section: 'PLANIFICATION',
      label: 'Planification',
      icon: 'fa-calendar-check',
      href: '/pages/planification/pao-global.html',
      roles: ['administrateur', 'coordination', 'chef_service', 'comite_pilotage'],
    },
    {
      section: 'CENTRE DE VALIDATION',
      label: 'Centre de validation',
      icon: 'fa-check-double',
      href: '/pages/validation/index.html',
      roles: ['administrateur', 'coordination', 'chef_service'],
    },
    {
      section: 'OP\u00c9RATIONS',
      label: 'Op\u00e9rations',
      icon: 'fa-folder-open',
      href: '/pages/dossiers/index.html',
      roles: ['administrateur', 'coordination', 'chef_service', 'controleur', 'agent'],
    },
    {
      section: 'RESSOURCES & MOYENS',
      label: 'Ressources & Moyens',
      icon: 'fa-toolbox',
      href: '/pages/stock/index.html',
      roles: ['administrateur', 'coordination', 'chef_service', 'controleur', 'agent'],
    },
    {
      section: 'BUDGET',
      label: 'Budget',
      icon: 'fa-coins',
      href: '/pages/budget/synthese.html',
      roles: ['administrateur', 'coordination', 'chef_service', 'comite_pilotage'],
    },
    {
      section: 'FINANCES',
      label: 'Finances',
      icon: 'fa-university',
      href: '/pages/comptabilite/index.html',
      roles: ['administrateur', 'coordination', 'chef_service', 'comite_pilotage', 'controleur'],
    },
    {
      section: 'CONTR\u00d4LE \u0026 AUDIT',
      label: 'Contr\u00f4le \u0026 Audit',
      icon: 'fa-shield-alt',
      href: '/pages/controle/index.html',
      roles: [
        'administrateur',
        'coordination',
        'chef_service',
        'comite_pilotage',
        'controleur',
        'agent',
      ],
    },
    {
      section: 'ADMINISTRATION',
      label: 'Administration',
      icon: 'fa-cog',
      href: '/pages/admin/index.html',
      roles: ['administrateur'],
    },
    {
      section: 'MANUEL DES PROC\u00c9DURES',
      label: 'Manuel des Proc\u00e9dures',
      icon: 'fa-book-open',
      href: '/pages/manuel/index.html',
      roles: [
        'administrateur',
        'coordination',
        'chef_service',
        'comite_pilotage',
        'controleur',
        'agent',
      ],
    },
  ];

  function _injectPortalButton() {
    const pathname = window.location.pathname;
    if (pathname.indexOf('/accueil') !== -1 || pathname.indexOf('/auth') !== -1) return;
    const right = document.querySelector('.topbar-right');
    if (!right) return;
    if (document.getElementById('portal-dropdown-wrap')) return;

    const role = getRole();
    const active = _detectActiveNavigator(pathname);
    const allowed = _NAV_ITEMS.filter(function (n) {
      return n.roles.indexOf(role) !== -1;
    });

    /* Construire les items du menu */
    let itemsHtml =
      '<a href="/pages/accueil/index.html" class="portal-drop-accueil">' +
      '<i class="fas fa-home"></i> Retour \u00e0 l\u2019accueil</a>' +
      '<div class="portal-drop-sep"></div>';

    for (let i = 0; i < allowed.length; i++) {
      const n = allowed[i];
      const cur = active === n.section ? ' portal-drop-current' : '';
      itemsHtml +=
        `<a href="${n.href}" class="portal-drop-item${cur}">` +
        `<i class="fas ${n.icon}"></i>` +
        `<span>${n.label}</span>${cur ? '<i class="fas fa-check portal-drop-check"></i>' : ''}</a>`;
    }

    /* Conteneur wrapper */
    const wrap = document.createElement('div');
    wrap.id = 'portal-dropdown-wrap';
    wrap.className = 'portal-dropdown-wrap me-2';
    wrap.innerHTML =
      `<button id="btn-portal-accueil" class="portal-btn" title="Navigateurs disponibles">` +
      `<i class="fas fa-th-large"></i>` +
      `<span>Navigateurs</span>` +
      `<i class="fas fa-chevron-down portal-btn-chevron"></i>` +
      `</button>` +
      `<div class="portal-drop" id="portalDrop">${itemsHtml}</div>`;

    right.insertBefore(wrap, right.firstChild);

    /* Toggle du menu */
    const btn = wrap.querySelector('#btn-portal-accueil');
    const drop = wrap.querySelector('#portalDrop');
    btn.addEventListener('click', function (e) {
      e.stopPropagation();
      const open = drop.classList.toggle('portal-drop-open');
      btn.classList.toggle('portal-btn-open', open);
    });
    document.addEventListener('click', function () {
      drop.classList.remove('portal-drop-open');
      btn.classList.remove('portal-btn-open');
    });
  }

  /* ── 11. Bouton déconnexion visible ────────────────────────────────────── */
  function _upgradeLogoutButton() {
    const path = window.location.pathname;
    if (path.indexOf('/accueil') !== -1 || path.indexOf('/auth') !== -1) return;
    /* Cibler le bouton logout existant par son onclick */
    const existing = document.querySelector('[onclick="logout()"], [onclick*="logout()"]');
    if (!existing) return;
    existing.id = 'btn-logout-main';
    existing.className = 'btn-logout-main';
    existing.innerHTML = '<i class="fas fa-sign-out-alt"></i><span>D\u00e9connexion</span>';
    /* Rebind au cas où l'élément perd son onclick après remplacement innerHTML */
    existing.onclick = function () {
      logout();
    };
  }

  /* ── 12. Initialisation automatique ────────────────────────────────────── */
  function init() {
    renderSidebarNav('sidebarNav');
    renderServiceBadge();
    _injectPortalButton();
    _upgradeLogoutButton();
    // Auto-appliquer le dashboard si on est sur la page dashboard
    if (window.location.pathname.includes('dashboard')) {
      applyDashboardRole();
    }
    // Retirer le loader une fois l'interface prête
    _removePageLoader();
  }

  /* ── API publique ────────────────────────────────────────────────────────── */
  window.SIGFIC = {
    ROLES,
    SERVICES,
    UNITES,
    MENUS,
    getUser,
    getRole,
    getServiceId,
    getServiceObj,
    getServiceLabel,
    getServiceColor,
    renderSidebarNav,
    renderServiceBadge,
    guardPage,
    applyDashboardRole,
    init,
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})(window);
