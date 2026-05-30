(function (window) {
  'use strict';

  const KEYS = {
    planAchat: 'pslsh_plan_achat_v1',
    rh:        'pslsh_rh_v1',
    dossiers:  'pslsh_dossiers_v1',
    depenses:  'pslsh_depenses_v1',
  };

  const ACHAT_CATEGORIES = {
    arv:   ['Médicaments ARV', 'Médicaments Ios'],
    reac:  ['Réactifs dépistage VIH', 'Réactifs charge virale VIH'],
    ist:   ['Réactifs IST', 'Réactifs hépatites & syphilis', 'Charge virale hépatites', 'Sérologie hépatites'],
    equip: ['Équipements médicaux'],
    meds:  ['Intrants nutritionnels'],
  };

  const STATUT_LIQ = new Set(['Reçu', 'Partiellement reçu']);

  const DEMO_ACHAT = [
    { cat:'Réactifs dépistage VIH',       qte:2000, prix_u:55000,  engage: 97350000, paye: 88000000, statut:'Partiellement reçu' },
    { cat:'Réactifs dépistage VIH',       qte:3000, prix_u:32000,  engage: 86400000, paye: 86400000, statut:'Reçu' },
    { cat:'Réactifs charge virale VIH',   qte: 800, prix_u:185000, engage:120000000, paye: 95000000, statut:'Partiellement reçu' },
    { cat:'Réactifs hépatites & syphilis',qte:1500, prix_u: 45000, engage: 58500000, paye: 58500000, statut:'Reçu' },
    { cat:'Réactifs IST',                 qte:2400, prix_u: 21000, engage: 42000000, paye: 32000000, statut:'Partiellement reçu' },
    { cat:'Médicaments ARV',              qte: 850, prix_u:125000, engage: 95625000, paye: 78000000, statut:'Partiellement reçu' },
    { cat:'Médicaments Ios',              qte: 520, prix_u: 82000, engage: 36400000, paye: 24000000, statut:'En attente' },
    { cat:'Intrants nutritionnels',       qte: 350, prix_u:158000, engage: 47800000, paye: 38000000, statut:'Partiellement reçu' },
    { cat:'Équipements médicaux',         qte:  12, prix_u:2500000,engage: 18000000, paye:        0, statut:'En attente' },
  ];

  const DEMO_RH_AGENTS = [
    1450000,1200000,850000,425000,980000,520000,1100000,485000,1350000,520000,
    1050000,485000,925000,680000,825000,620000,485000,425000,870000,870000,
    285000,215000,150000,1250000,
  ].map((s, i) => ({
    salaire: s,
    statut:  i < 20 ? 'Actif' : i < 22 ? 'En congé' : 'En mission',
  }));

  function read(key) {
    try { return JSON.parse(localStorage.getItem(key) || 'null'); }
    catch (_) { return null; }
  }

  function fmt(v) {
    if (v == null || isNaN(v)) return '—';
    if (v >= 1e9) return (v / 1e9).toFixed(2).replace('.', ',') + ' Md';
    if (v >= 1e6) return (v / 1e6).toFixed(1).replace('.', ',') + ' M';
    return Math.round(v).toLocaleString('fr-FR');
  }

  function pct(n, d) {
    return d > 0 ? Math.round((n / d) * 100) : 0;
  }

  function set(id, value) {
    const el = document.getElementById(id);
    if (el) el.textContent = value;
  }

  function setBar(id, width, color) {
    const el = document.getElementById(id);
    if (!el) return;
    el.style.width = Math.min(100, Math.max(0, width)) + '%';
    if (color) el.style.background = color;
  }

  function getFonds() {
    if (typeof fondsTotaux === 'function') {
      try { return fondsTotaux(); } catch (_) {}
    }
    return {
      etat:  { allocation: 2_052_000_000, decaisse: 824_000_000,  ecart: 1_228_000_000 },
      ptf:   { allocation: 3_677_922_858, decaisse: 1_020_040_000, ecart: 2_657_882_858 },
      grand: { allocation: 5_729_922_858, decaisse: 1_844_040_000, ecart: 3_885_882_858 },
    };
  }

  function aggregateAchats() {
    const raw = read(KEYS.planAchat);
    const data = (Array.isArray(raw) && raw.length) ? raw : DEMO_ACHAT;

    const counts = { recu: 0, partiel: 0, attente: 0, anomalie: 0 };
    let prevu = 0, engage = 0, liquide = 0, paye = 0;

    data.forEach((p) => {
      const ligne = (p.qte || 0) * (p.prix_u || 0);
      const eng   = +p.engage || 0;
      const pay   = +p.paye   || 0;
      prevu  += ligne;
      engage += eng;
      paye   += pay;
      if (STATUT_LIQ.has(p.statut)) liquide += eng;
      if (p.statut === 'Reçu')                counts.recu++;
      else if (p.statut === 'Partiellement reçu') counts.partiel++;
      else                                         counts.attente++;
      if (pay > eng || (eng === 0 && pay > 0)) counts.anomalie++;
    });

    const liquideFinal = Math.max(liquide, paye);
    const engageFinal  = Math.max(engage, liquideFinal);

    const byCat = {};
    Object.entries(ACHAT_CATEGORIES).forEach(([key, cats]) => {
      const items  = data.filter((p) => cats.includes(p.cat));
      const cPrevu = items.reduce((s, p) => s + (p.qte || 0) * (p.prix_u || 0), 0);
      const cPaye  = items.reduce((s, p) => s + (+p.paye || 0), 0);
      byCat[key] = { prevu: cPrevu, paye: cPaye, pct: pct(cPaye, cPrevu) };
    });

    return {
      n: data.length, prevu,
      engage: engageFinal, liquide: liquideFinal, paye,
      counts, byCat,
    };
  }

  function aggregateRh() {
    const raw = read(KEYS.rh);
    const agents = (raw && Array.isArray(raw.agents) && raw.agents.length) ? raw.agents : DEMO_RH_AGENTS;
    const demandes = (raw && Array.isArray(raw.demandes))
      ? raw.demandes.filter((d) => d.statut === 'En attente').length
      : 4;
    const masseMois = agents.reduce((s, a) => s + (+a.salaire || 0), 0);
    return {
      effectif: agents.length,
      actifs:   agents.filter((a) => a.statut === 'Actif').length,
      enConge:  agents.filter((a) => /congé|mission/i.test(a.statut || '')).length,
      masseMois,
      masseAnnuelle: masseMois * 12,
      demandes,
    };
  }

  function renderTopBubbles(fonds, achats, rh) {
    const budget   = fonds.grand.allocation;
    const dossiers = achats.counts.recu + achats.counts.partiel + achats.counts.attente;
    set('bubble-budget',    fmt(budget));
    set('bubble-engage',    fmt(achats.engage));
    set('bubble-liquide',   fmt(achats.liquide));
    set('bubble-paye',      fmt(achats.paye + fonds.etat.decaisse));
    set('bubble-dossiers',  dossiers);
    set('bubble-anomalies', achats.counts.anomalie + rh.demandes);

    set('kpi-budget',    fmt(budget));
    set('kpi-engage',    fmt(achats.engage));
    set('kpi-liquide',   fmt(achats.liquide));
    set('kpi-paye',      fmt(achats.paye));
    set('kpi-dossiers',  dossiers);
    set('kpi-anomalies', achats.counts.anomalie + rh.demandes);
  }

  function renderExecutionBars(fonds, achats) {
    const base = fonds.grand.allocation || achats.prevu;
    const txEng = pct(achats.engage,  base);
    const txLiq = pct(achats.liquide, base);
    const txPay = pct(achats.paye,    base);

    set('fr-initial', fmt(base));
    set('fr-engage',  fmt(achats.engage));
    set('fr-liquide', fmt(achats.liquide));
    set('fr-paye',    fmt(achats.paye));
    set('fr-tx-eng',  txEng + '%');
    set('fr-tx-liq',  txLiq + '%');
    set('fr-tx-pay',  txPay + '%');

    setBar('bar-eng', txEng, '#f59e0b');
    setBar('bar-liq', txLiq, '#a855f7');
    setBar('bar-pay', txPay, '#22c55e');
    set('pct-eng', txEng + '%');
    set('pct-liq', txLiq + '%');
    set('pct-pay', txPay + '%');
  }

  function renderAchats(achats) {
    set('ach-taux',  pct(achats.paye, achats.prevu) + '%');
    set('ach-paye',  fmt(achats.paye));
    set('ach-prevu', fmt(achats.prevu));

    const palette = { arv:'#ef4444', reac:'#3b82f6', ist:'#22c55e', equip:'#0d9488', meds:'#f59e0b' };
    Object.entries(achats.byCat).forEach(([key, v]) => {
      setBar('af-' + key, v.pct, palette[key]);
      set('ap-'   + key, v.pct + '%');
    });
  }

  function renderTresorerie(fonds, achats, rh) {
    const moisEcoules = new Date().getMonth() + 1;
    const decaissementRh = rh.masseMois * moisEcoules;
    const credit = fonds.grand.decaisse;
    const debit  = achats.paye + decaissementRh;
    set('bnk-comptes-v', '4');
    set('bnk-credit-v',  fmt(credit));
    set('bnk-debit-v',   fmt(debit));
    set('bnk-solde-v',   fmt(credit - debit));
  }

  function renderPao(achats) {
    set('pao-cnt-plan',  achats.n);
    set('pao-cnt-real',  achats.counts.recu);
    set('pao-cnt-cours', achats.counts.partiel);
    set('pao-cnt-non',   achats.counts.attente);
  }

  function run() {
    const fonds  = getFonds();
    const achats = aggregateAchats();
    const rh     = aggregateRh();
    renderTopBubbles(fonds, achats, rh);
    renderExecutionBars(fonds, achats);
    renderAchats(achats);
    renderTresorerie(fonds, achats, rh);
    renderPao(achats);
  }

  window.dashboardAggregate = run;

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', run);
  } else {
    run();
  }

  window.addEventListener('storage', (e) => {
    if (e.key && Object.values(KEYS).includes(e.key)) run();
  });
})(window);
