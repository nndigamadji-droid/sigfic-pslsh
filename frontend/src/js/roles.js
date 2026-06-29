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
    COMPTABLE_PRINCIPAL: 'comptable_principal',
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
          },        ],
      },
      {
        section: 'BUDGET',
        icon: 'fa-coins',
        items: [
          { href: '/pages/budget/synthese.html', icon: 'fa-chart-pie', label: 'Synthèse globale' },
          { href: '/pages/budget/mapping.html',  icon: 'fa-random',    label: 'Mapping Budget ↔ OHADA' },
          { href: '/pages/budget/recettes.html', icon: 'fa-arrow-trend-up', label: 'Recettes' },
          {
            href: '/pages/budget/depenses.html',
            icon: 'fa-file-invoice-dollar',
            label: 'Dépenses',
          },
          { href: '/pages/budget/fonds-alloues.html',     icon: 'fa-hand-holding-usd', label: 'Fonds alloués' },
          { href: '/pages/budget/fonds-disponibles.html', icon: 'fa-piggy-bank',       label: 'Fonds disponibles' },
        ],
      },
      {
        section: 'OPÉRATIONS',
        icon: 'fa-cogs',
        items: [          { href: '/pages/dossiers/index.html',   icon: 'fa-folder-open', label: "Dossiers d'opération" },
          { href: '/pages/dossiers/archives.html', icon: 'fa-archive', label: 'Archives' },
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
          { href: '/pages/finances/index.html', icon: 'fa-tachometer-alt', label: 'Tableau de bord Finances' },
          { href: '/pages/comptabilite/journaux.html', icon: 'fa-journal-whills', label: 'Journaux comptables' },
          { href: '/pages/comptabilite/tresorerie.html', icon: 'fa-wallet', label: 'Carnet de trésorerie' },
          { href: '/pages/comptabilite/rapprochement.html', icon: 'fa-sync-alt', label: 'Rapprochement bancaire' },
          { href: '/pages/comptabilite/grand-livre.html', icon: 'fa-book-open', label: 'Grand livre' },
          { href: '/pages/comptabilite/balance.html', icon: 'fa-balance-scale', label: 'Balance des comptes' },
          { href: '/pages/finances/balance-budgetaire.html', icon: 'fa-clipboard-list', label: 'Balance budgétaire (Cpt gestion)' },
          { href: '/pages/finances/etats-financiers.html', icon: 'fa-file-invoice-dollar', label: 'États financiers SYSCOHADA' },
          { href: '/pages/paiement/index.html', icon: 'fa-money-check-alt', label: 'Paiements & liquidations' },
          { href: '/pages/paiement/virements.html', icon: 'fa-exchange-alt', label: 'Virements' },
        ],
      },
      {
        section: 'AUDIT & CONTRÔLE',
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
        section: 'MES OUTILS',
        icon: 'fa-user-circle',
        items: [
          { href: '/pages/notifications/index.html', icon: 'fa-bell', label: 'Centre des notifications' },
          { href: '/pages/aide/index.html', icon: 'fa-question-circle', label: 'Aide' },
        ],
      },
    ],

    /* ════════════════════════════════════════════════════════════════
       COORDINATION — accès complet métier, pilotage et validation
    ════════════════════════════════════════════════════════════════ */
    coordination: [
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
          },        ],
      },
      {
        section: 'BUDGET',
        icon: 'fa-coins',
        items: [
          { href: '/pages/budget/synthese.html', icon: 'fa-chart-pie', label: 'Synthèse globale' },
          { href: '/pages/budget/mapping.html',  icon: 'fa-random',    label: 'Mapping Budget ↔ OHADA' },
          { href: '/pages/budget/recettes.html', icon: 'fa-arrow-trend-up', label: 'Recettes' },
          {
            href: '/pages/budget/depenses.html',
            icon: 'fa-file-invoice-dollar',
            label: 'Dépenses',
          },
          { href: '/pages/budget/fonds-alloues.html',     icon: 'fa-hand-holding-usd', label: 'Fonds alloués' },
          { href: '/pages/budget/fonds-disponibles.html', icon: 'fa-piggy-bank',       label: 'Fonds disponibles' },
        ],
      },
      {
        section: 'OPÉRATIONS',
        icon: 'fa-cogs',
        items: [          { href: '/pages/dossiers/index.html',   icon: 'fa-folder-open', label: "Dossiers d'opération" },
          { href: '/pages/dossiers/archives.html', icon: 'fa-archive', label: 'Archives' },
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
          { href: '/pages/finances/index.html', icon: 'fa-tachometer-alt', label: 'Tableau de bord Finances' },
          { href: '/pages/comptabilite/journaux.html', icon: 'fa-journal-whills', label: 'Journaux comptables' },
          { href: '/pages/comptabilite/tresorerie.html', icon: 'fa-wallet', label: 'Carnet de trésorerie' },
          { href: '/pages/comptabilite/rapprochement.html', icon: 'fa-sync-alt', label: 'Rapprochement bancaire' },
          { href: '/pages/comptabilite/grand-livre.html', icon: 'fa-book-open', label: 'Grand livre' },
          { href: '/pages/comptabilite/balance.html', icon: 'fa-balance-scale', label: 'Balance des comptes' },
          { href: '/pages/finances/balance-budgetaire.html', icon: 'fa-clipboard-list', label: 'Balance budgétaire (Cpt gestion)' },
          { href: '/pages/finances/etats-financiers.html', icon: 'fa-file-invoice-dollar', label: 'États financiers SYSCOHADA' },
          { href: '/pages/paiement/index.html', icon: 'fa-money-check-alt', label: 'Paiements & liquidations' },
          { href: '/pages/paiement/virements.html', icon: 'fa-exchange-alt', label: 'Virements' },
        ],
      },
      {
        section: 'AUDIT & CONTRÔLE',
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
        section: 'MES OUTILS',
        icon: 'fa-user-circle',
        items: [
          { href: '/pages/notifications/index.html', icon: 'fa-bell', label: 'Centre des notifications' },
          { href: '/pages/aide/index.html', icon: 'fa-question-circle', label: 'Aide' },
        ],
      },
    ],

    comptable_principal: [
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
          },        ],
      },
      {
        section: 'BUDGET',
        icon: 'fa-coins',
        items: [
          { href: '/pages/budget/synthese.html', icon: 'fa-chart-pie', label: 'Synthèse globale' },
          { href: '/pages/budget/mapping.html',  icon: 'fa-random',    label: 'Mapping Budget ↔ OHADA' },
          { href: '/pages/budget/recettes.html', icon: 'fa-arrow-trend-up', label: 'Recettes' },
          {
            href: '/pages/budget/depenses.html',
            icon: 'fa-file-invoice-dollar',
            label: 'Dépenses',
          },
          { href: '/pages/budget/fonds-alloues.html',     icon: 'fa-hand-holding-usd', label: 'Fonds alloués' },
          { href: '/pages/budget/fonds-disponibles.html', icon: 'fa-piggy-bank',       label: 'Fonds disponibles' },
        ],
      },
      {
        section: 'OPÉRATIONS',
        icon: 'fa-cogs',
        items: [          { href: '/pages/dossiers/index.html',   icon: 'fa-folder-open', label: "Dossiers d'opération" },
          { href: '/pages/dossiers/archives.html', icon: 'fa-archive', label: 'Archives' },
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
          { href: '/pages/finances/index.html', icon: 'fa-tachometer-alt', label: 'Tableau de bord Finances' },
          { href: '/pages/comptabilite/journaux.html', icon: 'fa-journal-whills', label: 'Journaux comptables' },
          { href: '/pages/comptabilite/tresorerie.html', icon: 'fa-wallet', label: 'Carnet de trésorerie' },
          { href: '/pages/comptabilite/rapprochement.html', icon: 'fa-sync-alt', label: 'Rapprochement bancaire' },
          { href: '/pages/comptabilite/grand-livre.html', icon: 'fa-book-open', label: 'Grand livre' },
          { href: '/pages/comptabilite/balance.html', icon: 'fa-balance-scale', label: 'Balance des comptes' },
          { href: '/pages/finances/balance-budgetaire.html', icon: 'fa-clipboard-list', label: 'Balance budgétaire (Cpt gestion)' },
          { href: '/pages/finances/etats-financiers.html', icon: 'fa-file-invoice-dollar', label: 'États financiers SYSCOHADA' },
          { href: '/pages/paiement/index.html', icon: 'fa-money-check-alt', label: 'Paiements & liquidations' },
          { href: '/pages/paiement/virements.html', icon: 'fa-exchange-alt', label: 'Virements' },
        ],
      },
      {
        section: 'AUDIT & CONTRÔLE',
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
        section: 'MES OUTILS',
        icon: 'fa-user-circle',
        items: [
          { href: '/pages/notifications/index.html', icon: 'fa-bell', label: 'Centre des notifications' },
          { href: '/pages/aide/index.html', icon: 'fa-question-circle', label: 'Aide' },
        ],
      },
      {
        section: 'ÉMISSIONS COMPTABLES',
        icon: 'fa-file-signature',
        items: [
          { href: '/pages/finances/emit-ov.html',       icon: 'fa-money-check-alt',    label: 'Émettre un Ordre de Virement' },
          { href: '/pages/finances/emit-paie.html',     icon: 'fa-users',              label: 'Émettre un État de Salaires' },
          { href: '/pages/finances/emit-decharge.html', icon: 'fa-receipt',            label: 'Émettre une Décharge' },
          { href: '/pages/finances/emit-avis.html',     icon: 'fa-stamp',              label: 'Émettre un Avis Comptable' },
          { href: '/pages/finances/ov-list.html',       icon: 'fa-list-alt',           label: 'Suivi des OV émis' },
        ],
      },
    ],

    /* ════════════════════════════════════════════════════════════════
       CHEF DE SERVICE — périmètre de son service
    ════════════════════════════════════════════════════════════════ */
    chef_service: [
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
          },        ],
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
          { href: '/pages/budget/fonds-alloues.html',     icon: 'fa-hand-holding-usd', label: 'Fonds alloués' },
          { href: '/pages/budget/fonds-disponibles.html', icon: 'fa-piggy-bank',       label: 'Fonds disponibles' },
        ],
      },
      {
        section: 'OPÉRATIONS',
        icon: 'fa-cogs',
        items: [          { href: '/pages/dossiers/index.html',   icon: 'fa-folder-open', label: "Dossiers d'opération" },
          { href: '/pages/dossiers/archives.html', icon: 'fa-archive', label: 'Archives' },
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
          { href: '/pages/finances/index.html', icon: 'fa-tachometer-alt', label: 'Tableau de bord Finances' },
          { href: '/pages/comptabilite/journaux.html', icon: 'fa-journal-whills', label: 'Journaux comptables' },
          { href: '/pages/comptabilite/tresorerie.html', icon: 'fa-wallet', label: 'Carnet de trésorerie' },
          { href: '/pages/comptabilite/rapprochement.html', icon: 'fa-sync-alt', label: 'Rapprochement bancaire' },
          { href: '/pages/comptabilite/grand-livre.html', icon: 'fa-book-open', label: 'Grand livre' },
          { href: '/pages/comptabilite/balance.html', icon: 'fa-balance-scale', label: 'Balance des comptes' },
          { href: '/pages/finances/balance-budgetaire.html', icon: 'fa-clipboard-list', label: 'Balance budgétaire (Cpt gestion)' },
          { href: '/pages/finances/etats-financiers.html', icon: 'fa-file-invoice-dollar', label: 'États financiers SYSCOHADA' },
          { href: '/pages/paiement/index.html', icon: 'fa-money-check-alt', label: 'Paiements & liquidations' },
          { href: '/pages/paiement/virements.html', icon: 'fa-exchange-alt', label: 'Virements' },
        ],
      },
      {
        section: 'AUDIT & CONTRÔLE',
        icon: 'fa-search',
        items: [
          { href: '/pages/archivage/index.html', icon: 'fa-archive', label: 'Mes justificatifs' },
          { href: '/pages/reporting/index.html', icon: 'fa-file-alt', label: 'Mes rapports' },
        ],
      },
          {
        section: 'MES OUTILS',
        icon: 'fa-user-circle',
        items: [
          { href: '/pages/notifications/index.html', icon: 'fa-bell', label: 'Centre des notifications' },
          { href: '/pages/aide/index.html', icon: 'fa-question-circle', label: 'Aide' },
        ],
      },
    ],

    /* ════════════════════════════════════════════════════════════════
       COMITÉ DE PILOTAGE — lecture, synthèse, revue stratégique
    ════════════════════════════════════════════════════════════════ */
    comite_pilotage: [
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
          },        ],
      },
      {
        section: 'BUDGET',
        icon: 'fa-coins',
        items: [
          { href: '/pages/budget/synthese.html', icon: 'fa-chart-pie', label: 'Synthèse globale' },
          { href: '/pages/budget/mapping.html',  icon: 'fa-random',    label: 'Mapping Budget ↔ OHADA' },
          { href: '/pages/budget/recettes.html', icon: 'fa-arrow-trend-up', label: 'Recettes' },
          { href: '/pages/budget/fonds-alloues.html',     icon: 'fa-hand-holding-usd', label: 'Fonds alloués' },
          { href: '/pages/budget/fonds-disponibles.html', icon: 'fa-piggy-bank',       label: 'Fonds disponibles' },
        ],
      },
      {
        section: 'FINANCES',
        icon: 'fa-university',
        items: [
          { href: '/pages/finances/index.html', icon: 'fa-tachometer-alt', label: 'Tableau de bord Finances' },
          { href: '/pages/comptabilite/journaux.html', icon: 'fa-journal-whills', label: 'Journaux comptables' },
          { href: '/pages/comptabilite/tresorerie.html', icon: 'fa-wallet', label: 'Carnet de trésorerie' },
          { href: '/pages/comptabilite/rapprochement.html', icon: 'fa-sync-alt', label: 'Rapprochement bancaire' },
          { href: '/pages/comptabilite/grand-livre.html', icon: 'fa-book-open', label: 'Grand livre' },
          { href: '/pages/comptabilite/balance.html', icon: 'fa-balance-scale', label: 'Balance des comptes' },
          { href: '/pages/finances/balance-budgetaire.html', icon: 'fa-clipboard-list', label: 'Balance budgétaire (Cpt gestion)' },
          { href: '/pages/finances/etats-financiers.html', icon: 'fa-file-invoice-dollar', label: 'États financiers SYSCOHADA' },
          { href: '/pages/paiement/index.html', icon: 'fa-money-check-alt', label: 'Paiements & liquidations' },
          { href: '/pages/paiement/virements.html', icon: 'fa-exchange-alt', label: 'Virements' },
        ],
      },
      {
        section: 'AUDIT & CONTRÔLE',
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
        section: 'MES OUTILS',
        icon: 'fa-user-circle',
        items: [
          { href: '/pages/notifications/index.html', icon: 'fa-bell', label: 'Centre des notifications' },
          { href: '/pages/aide/index.html', icon: 'fa-question-circle', label: 'Aide' },
        ],
      },
],

    /* ════════════════════════════════════════════════════════════════
       CONTRÔLEUR / AUDITEUR — lecture renforcée, traçabilité
    ════════════════════════════════════════════════════════════════ */
    controleur: [
      {
        section: 'OPÉRATIONS',
        icon: 'fa-cogs',
        items: [          { href: '/pages/dossiers/index.html',   icon: 'fa-folder-open', label: "Dossiers d'opération" },
          { href: '/pages/dossiers/archives.html', icon: 'fa-archive', label: 'Archives' },
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
          { href: '/pages/finances/index.html', icon: 'fa-tachometer-alt', label: 'Tableau de bord Finances' },
          { href: '/pages/comptabilite/journaux.html', icon: 'fa-journal-whills', label: 'Journaux comptables' },
          { href: '/pages/comptabilite/tresorerie.html', icon: 'fa-wallet', label: 'Carnet de trésorerie' },
          { href: '/pages/comptabilite/rapprochement.html', icon: 'fa-sync-alt', label: 'Rapprochement bancaire' },
          { href: '/pages/comptabilite/grand-livre.html', icon: 'fa-book-open', label: 'Grand livre' },
          { href: '/pages/comptabilite/balance.html', icon: 'fa-balance-scale', label: 'Balance des comptes' },
          { href: '/pages/finances/balance-budgetaire.html', icon: 'fa-clipboard-list', label: 'Balance budgétaire (Cpt gestion)' },
          { href: '/pages/finances/etats-financiers.html', icon: 'fa-file-invoice-dollar', label: 'États financiers SYSCOHADA' },
          { href: '/pages/paiement/index.html', icon: 'fa-money-check-alt', label: 'Paiements & liquidations' },
          { href: '/pages/paiement/virements.html', icon: 'fa-exchange-alt', label: 'Virements' },
        ],
      },
      {
        section: 'AUDIT & CONTRÔLE',
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
        section: 'MES OUTILS',
        icon: 'fa-user-circle',
        items: [
          { href: '/pages/notifications/index.html', icon: 'fa-bell', label: 'Centre des notifications' },
          { href: '/pages/aide/index.html', icon: 'fa-question-circle', label: 'Aide' },
        ],
      },
],

    /* ════════════════════════════════════════════════════════════════
       AGENT — accès de base, tâches ciblées
    ════════════════════════════════════════════════════════════════ */
    agent: [
      {
        section: 'OPÉRATIONS',
        icon: 'fa-cogs',
        items: [          { href: '/pages/dossiers/index.html',   icon: 'fa-folder-open', label: "Dossiers d'opération" },
          { href: '/pages/dossiers/archives.html', icon: 'fa-archive', label: 'Archives' },
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
        section: 'AUDIT & CONTRÔLE',
        icon: 'fa-search',
        items: [
          { href: '/pages/archivage/index.html', icon: 'fa-archive', label: 'Mes documents' },
        ],
      },
          {
        section: 'MES OUTILS',
        icon: 'fa-user-circle',
        items: [
          { href: '/pages/notifications/index.html', icon: 'fa-bell', label: 'Centre des notifications' },
          { href: '/pages/aide/index.html', icon: 'fa-question-circle', label: 'Aide' },
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
    // Itère sur TOUS les rôles du user (u.role string, u.profil, u.roles array)
    // et applique une PRIORITÉ : le rôle le plus spécifique l'emporte sur le générique.
    const all = [];
    if (u.role)   all.push(u.role);
    if (u.profil) all.push(u.profil);
    if (Array.isArray(u.roles)) all.push(...u.roles);
    const codes = all.map((r) => `${r}`.toLowerCase()).filter(Boolean);
    const has = (...xs) => xs.some((x) => codes.includes(x));
    const some = (re) => codes.some((c) => re.test(c));

    // ── Ordre de priorité : du plus spécifique au plus générique ──────────
    if (has('administrateur', 'admin', 'super_admin'))         return 'administrateur';
    if (has('comptable_principal'))                            return 'comptable_principal'; // ⭐ avant 'coordination'
    if (has('coordination', 'coordinateur') || some(/coordin/)) return 'coordination';
    if (has('comite_pilotage') || some(/comite|pilotage|direction/)) return 'comite_pilotage';
    if (has('controleur', 'auditeur', 'inspecteur'))   return 'controleur';
    if (has('chef_service') || some(/chef|responsable|directeur/))   return 'chef_service';
    if (has('gestionnaire'))                                      return 'chef_service';
    if (has('comptable'))                                         return 'comptable_principal';
    if (has('lecture', 'archiviste'))                             return 'agent';
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
  /* ────────────────────────────────────────────────────────────────────────
     _detectActiveNavigator — solution DÉFINITIVE
     ────────────────────────────────────────────────────────────────────────
     La détection du navigateur actif est désormais DÉRIVÉE AUTOMATIQUEMENT
     de la structure MENUS (source de vérité unique). Lorsqu'on ajoute une
     nouvelle page :
       1. Ajouter un item { href: '/pages/<dir>/...', label, icon } dans la
          section concernée d'un ou plusieurs menus.
       2. C'est tout. La sidebar reconnaît automatiquement le navigateur.

     Plus besoin de modifier cette fonction à chaque création de page.
     ──────────────────────────────────────────────────────────────────────── */
  let _navCache = null;
  function _buildNavCache() {
    const cache = new Map();
    for (const roleKey in MENUS) {
      const roleMenu = MENUS[roleKey];
      if (!Array.isArray(roleMenu)) continue;
      for (const group of roleMenu) {
        if (!group || !group.section || !Array.isArray(group.items)) continue;
        for (const item of group.items) {
          if (!item || !item.href) continue;
          // /pages/budget/lignes.html → /pages/budget/
          const cleanHref = item.href.split('?')[0].split('#')[0];
          const dir = cleanHref.replace(/\/[^/]*$/, '/');
          if (dir && dir !== '/' && !cache.has(dir)) {
            cache.set(dir, group.section);
          }
        }
      }
    }
    // Chemins les plus spécifiques d'abord (longueur décroissante)
    return [...cache.entries()].sort((a, b) => b[0].length - a[0].length);
  }

  function _detectActiveNavigator(pathname) {
    if (!_navCache) _navCache = _buildNavCache();
    for (const [dir, section] of _navCache) {
      if (pathname.indexOf(dir) === 0) return section;
    }
    if (typeof console !== 'undefined' && pathname
        && pathname.indexOf('/pages/') === 0
        && pathname.indexOf('/accueil') === -1
        && pathname.indexOf('/auth') === -1) {
      console.warn('[SIGFIC] Page non rattachée à un navigateur :', pathname,
        "— ajoutez l'item correspondant dans MENUS (roles.js) pour la rattacher.");
    }
    return null;
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
      section: 'PLANIFICATION',
      label: 'Planification',
      icon: 'fa-calendar-check',
      href: '/pages/planification/pao-global.html',
      roles: ['administrateur', 'coordination', 'chef_service', 'comite_pilotage'],
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
  ];

  function initResponsiveShell() {
    const pathname = window.location.pathname;
    if (pathname.indexOf('/auth') !== -1) return;

    const sidebar = document.querySelector('.sidebar, #sidebar');
    const topbar = document.querySelector('.topbar, #topbar');
    if (!sidebar || !topbar) return;

    if (!sidebar.id) sidebar.id = 'sigfic-sidebar';
    if (document.querySelector('.sigfic-mobile-menu-btn')) return;

    const topbarLeft = document.querySelector('.topbar-left') || topbar;
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'topbar-btn sigfic-mobile-menu-btn';
    button.setAttribute('aria-label', 'Ouvrir le menu');
    button.setAttribute('aria-controls', sidebar.id);
    button.setAttribute('aria-expanded', 'false');
    button.innerHTML = '<i class="fas fa-bars"></i>';

    const backdrop = document.createElement('div');
    backdrop.className = 'sigfic-sidebar-backdrop';
    backdrop.setAttribute('aria-hidden', 'true');

    topbarLeft.insertBefore(button, topbarLeft.firstChild);
    document.body.appendChild(backdrop);

    function isMobileShell() {
      return window.matchMedia('(max-width: 991.98px)').matches;
    }

    function setSidebarOpen(open) {
      if (open && !isMobileShell()) open = false;
      document.body.classList.toggle('sigfic-sidebar-open', open);
      button.setAttribute('aria-expanded', open ? 'true' : 'false');
      button.setAttribute('aria-label', open ? 'Fermer le menu' : 'Ouvrir le menu');
    }

    button.addEventListener('click', function () {
      if (!isMobileShell()) return;
      setSidebarOpen(!document.body.classList.contains('sigfic-sidebar-open'));
    });

    backdrop.addEventListener('click', function () {
      setSidebarOpen(false);
    });

    sidebar.addEventListener('click', function (event) {
      const link = event.target.closest('a');
      if (link && isMobileShell()) setSidebarOpen(false);
    });

    document.addEventListener('keydown', function (event) {
      if (event.key === 'Escape') setSidebarOpen(false);
    });

    window.addEventListener('resize', function () {
      if (!isMobileShell()) setSidebarOpen(false);
    });
  }

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
    initResponsiveShell();
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
    initResponsiveShell,
    init,
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})(window);
