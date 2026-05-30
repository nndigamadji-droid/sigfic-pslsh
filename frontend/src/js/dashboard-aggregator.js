(function (window) {
  'use strict';

  const KEYS = {
    planAchat: 'pslsh_plan_achat_v1',
    rh:        'pslsh_rh_v1',
    dossiers:  'pslsh_dossiers_v1',
  };

  const ACHAT_CATEGORIES = {
    arv:   ['Médicaments ARV', 'ARV'],
    reac:  ['Réactifs dépistage VIH', 'Réactifs charge virale VIH', 'Réactifs hépatites & syphilis',
            'Charge virale hépatites', 'Sérologie hépatites'],
    ist:   ['Réactifs IST'],
    equip: ['Équipements médicaux'],
    meds:  ['Médicaments Ios', 'Intrants nutritionnels'],
  };

  const DEMO_ACHAT = [
    { cat:'Réactifs dépistage VIH',      qte: 50000, prix_u: 1850,   engage: 76000000,  paye: 60000000 },
    { cat:'Réactifs charge virale VIH',  qte: 12000, prix_u: 18500,  engage: 180000000, paye: 145000000 },
    { cat:'Réactifs hépatites & syphilis',qte: 25000, prix_u: 2400,  engage: 52000000,  paye: 40000000 },
    { cat:'Réactifs IST',                qte: 18000, prix_u: 1950,   engage: 28000000,  paye: 21000000 },
    { cat:'Médicaments ARV',             qte: 8500,  prix_u: 12500,  engage: 95000000,  paye: 78000000 },
    { cat:'Médicaments Ios',             qte: 5200,  prix_u: 8200,   engage: 36000000,  paye: 24000000 },
    { cat:'Intrants nutritionnels',      qte: 3500,  prix_u: 15800,  engage: 48000000,  paye: 38000000 },
  ];

  const DEMO_RH = {
    agents: Array.from({ length: 24 }, (_, i) => ({
      statut: i < 18 ? 'Actif' : i < 21 ? 'En congé' : 'En mission',
      salaire: [1450000, 1200000, 850000, 425000, 980000, 520000, 1100000, 485000][i % 8],
    })),
    demandes: [
      { statut: 'En attente' }, { statut: 'En attente' },
      { statut: 'En attente' }, { statut: 'En attente' },
    ],
  };

  function read(key) {
    try { return JSON.parse(localStorage.getItem(key) || 'null'); }
    catch (e) { return null; }
  }

  function fmt(v) {
    if (v == null || isNaN(v)) return '—';
    if (v >= 1e9) return (v / 1e9).toFixed(2).replace('.', ',') + ' Md';
    if (v >= 1e6) return (v / 1e6).toFixed(1).replace('.', ',') + ' M';
    return Math.round(v).toLocaleString('fr-FR');
  }

  function set(id, value) {
    const el = document.getElementById(id);
    if (el) el.textContent = value;
  }

  function setBar(id, pct, color) {
    const el = document.getElementById(id);
    if (!el) return;
    el.style.width = Math.min(100, Math.max(0, pct)) + '%';
    if (color) el.style.background = color;
  }

  function aggregatePlanAchat() {
    let data = read(KEYS.planAchat);
    if (!Array.isArray(data) || !data.length) data = DEMO_ACHAT;

    const total = data.reduce(
      (a, p) => {
        const prevu = (p.qte || 0) * (p.prix_u || 0);
        a.prevu  += prevu;
        a.engage += +(p.engage || 0);
        a.paye   += +(p.paye   || 0);
        return a;
      },
      { prevu: 0, engage: 0, paye: 0, n: data.length }
    );

    total.byCat = {};
    Object.entries(ACHAT_CATEGORIES).forEach(([key, cats]) => {
      const items = data.filter((p) => cats.includes(p.cat));
      const prevu = items.reduce((s, p) => s + (p.qte || 0) * (p.prix_u || 0), 0);
      const paye  = items.reduce((s, p) => s + (+p.paye || 0), 0);
      total.byCat[key] = { prevu, paye, pct: prevu > 0 ? Math.round(paye / prevu * 100) : 0 };
    });

    return total;
  }

  function aggregateRh() {
    const raw = read(KEYS.rh);
    const src = raw && Array.isArray(raw.agents) && raw.agents.length ? raw : DEMO_RH;
    const agents = src.agents;
    return {
      effectif:  agents.length,
      actifs:    agents.filter((a) => a.statut === 'Actif').length,
      enConge:   agents.filter((a) => /congé|mission/i.test(a.statut || '')).length,
      masse:     agents.reduce((s, a) => s + (+a.salaire || 0), 0),
      demandes:  Array.isArray(src.demandes) ? src.demandes.filter((d) => d.statut === 'En attente').length : 0,
    };
  }

  function renderTopBubbles(achat, rh) {
    const budget   = achat.prevu + (rh.masse * 12);
    const dossiers = (read(KEYS.dossiers) || []).length || achat.n;

    set('bubble-budget',    fmt(budget));
    set('bubble-engage',    fmt(achat.engage));
    set('bubble-liquide',   fmt(achat.paye));
    set('bubble-paye',      fmt(achat.paye));
    set('bubble-dossiers',  dossiers);
    set('bubble-anomalies', rh.demandes);

    set('kpi-budget',    fmt(budget));
    set('kpi-engage',    fmt(achat.engage));
    set('kpi-liquide',   fmt(achat.paye));
    set('kpi-paye',      fmt(achat.paye));
    set('kpi-dossiers',  dossiers);
    set('kpi-anomalies', rh.demandes);
  }

  function renderExecutionBars(achat) {
    if (!achat.prevu) return;
    const txEng = Math.round(achat.engage / achat.prevu * 100);
    const txPay = Math.round(achat.paye   / achat.prevu * 100);

    set('fr-initial', fmt(achat.prevu));
    set('fr-engage',  fmt(achat.engage));
    set('fr-paye',    fmt(achat.paye));
    set('fr-liquide', fmt(achat.paye));
    set('fr-tx-eng',  txEng + '%');
    set('fr-tx-pay',  txPay + '%');
    set('fr-tx-liq',  txPay + '%');

    setBar('bar-eng', txEng, '#f59e0b');
    setBar('bar-liq', txPay, '#a855f7');
    setBar('bar-pay', txPay, '#22c55e');
    set('pct-eng', txEng + '%');
    set('pct-liq', txPay + '%');
    set('pct-pay', txPay + '%');
  }

  function renderAchatsPanel(achat) {
    const txGlobal = achat.prevu > 0 ? Math.round(achat.paye / achat.prevu * 100) : 0;
    set('ach-taux',  txGlobal + '%');
    set('ach-paye',  fmt(achat.paye));
    set('ach-prevu', fmt(achat.prevu));

    const palette = {
      arv:   '#ef4444', reac: '#3b82f6', ist:  '#22c55e',
      equip: '#0d9488', meds: '#f59e0b',
    };
    Object.entries(achat.byCat).forEach(([key, v]) => {
      setBar('af-' + key, v.pct, palette[key]);
      set('ap-'   + key, v.pct + '%');
    });
  }

  function renderTresorerie(achat, rh) {
    const credit = achat.paye + rh.masse;
    const debit  = achat.paye + rh.masse;
    set('bnk-comptes-v', '4');
    set('bnk-credit-v',  fmt(credit));
    set('bnk-debit-v',   fmt(debit));
    set('bnk-solde-v',   fmt(credit - debit));
  }

  function renderPaoCounts(achat) {
    const total = achat.n;
    const done  = achat.paye >= achat.prevu * 0.95 ? total : Math.round(total * 0.35);
    const wip   = achat.engage > 0 ? Math.round(total * 0.45) : 0;
    const todo  = Math.max(0, total - done - wip);
    set('pao-cnt-plan',  total);
    set('pao-cnt-real',  done);
    set('pao-cnt-cours', wip);
    set('pao-cnt-non',   todo);
  }

  function run() {
    const achat = aggregatePlanAchat();
    const rh    = aggregateRh();
    renderTopBubbles(achat, rh);
    renderExecutionBars(achat);
    renderAchatsPanel(achat);
    renderTresorerie(achat, rh);
    renderPaoCounts(achat);
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
