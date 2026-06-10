/**
 * fonds-data.js — Source unique de vérité pour les fonds alloués PSLSH/IST
 * Exercice 2026 · Utilisé par : dashboard/index.html + planification/fonds-alloues.html
 */

const FONDS = {
  exercice: 2026,

  /* ── FINANCEMENT ÉTAT ── */
  etat: [
    {
      id: 'fonct',
      label: 'Fonctionnement PSLSH',
      couleur: '#1e40af',
      bg: '#dbeafe',
      allocation: 1_035_000_000,
      decaisse: 517_500_000,
      tranches: {
        T1: { montant: 258_750_000, statut: 'ok' },
        T2: { montant: 258_750_000, statut: 'ok' },
        T3: { montant: 258_750_000, statut: 'att' },
        T4: { montant: 258_750_000, statut: 'non' },
      },
    },
    {
      id: 'salaire',
      label: 'Salaires Personnel PSLSH',
      couleur: '#92400e',
      bg: '#fef3c7',
      allocation: 342_000_000, // 12 × 28 500 000
      decaisse: 114_000_000, // Janvier → Avril payés
      mois: [
        { label: 'Janvier 2026', trim: 'T1', montant: 28_500_000, statut: 'ok' },
        { label: 'Février 2026', trim: 'T1', montant: 28_500_000, statut: 'ok' },
        { label: 'Mars 2026', trim: 'T1', montant: 28_500_000, statut: 'ok' },
        { label: 'Avril 2026', trim: 'T2', montant: 28_500_000, statut: 'ok' },
        { label: 'Mai 2026', trim: 'T2', montant: 28_500_000, statut: 'att' },
        { label: 'Juin 2026', trim: 'T2', montant: 28_500_000, statut: 'non' },
        { label: 'Juillet 2026', trim: 'T3', montant: 28_500_000, statut: 'non' },
        { label: 'Août 2026', trim: 'T3', montant: 28_500_000, statut: 'non' },
        { label: 'Septembre 2026', trim: 'T3', montant: 28_500_000, statut: 'non' },
        { label: 'Octobre 2026', trim: 'T4', montant: 28_500_000, statut: 'non' },
        { label: 'Novembre 2026', trim: 'T4', montant: 28_500_000, statut: 'non' },
        { label: 'Décembre 2026', trim: 'T4', montant: 28_500_000, statut: 'non' },
      ],
    },
    {
      id: 'contrep_fm',
      label: 'Contrepartie FM/GC7',
      couleur: '#0d9488',
      bg: '#ccfbf1',
      allocation: 580_000_000,
      decaisse: 145_000_000,
      tranches: {
        T1: { montant: 145_000_000, statut: 'ok' },
        T2: { montant: 145_000_000, statut: 'att' },
        T3: { montant: 145_000_000, statut: 'non' },
        T4: { montant: 145_000_000, statut: 'non' },
      },
    },
    {
      id: 'contrep_oms',
      label: 'Contrepartie OMS/ONUSIDA',
      couleur: '#0d9488',
      bg: '#ccfbf1',
      allocation: 95_000_000,
      decaisse: 47_500_000,
      tranches: {
        T1: { montant: 23_750_000, statut: 'ok' },
        T2: { montant: 23_750_000, statut: 'ok' },
        T3: { montant: 23_750_000, statut: 'att' },
        T4: { montant: 23_750_000, statut: 'non' },
      },
    },
  ],

  /* ── FINANCEMENT PARTENAIRES ── */
  ptf: [
    {
      id: 'fm_gc7',
      label: 'Subvention FM/GC7',
      detail: 'GC7-T-CHD-H-MOH',
      couleur: '#3730a3',
      bg: '#e0e7ff',
      allocation: 3_582_922_858,
      decaisse: 972_540_000,
      tranches: {
        T1: { montant: 895_730_714, statut: 'ok' },
        T2: { montant: 76_809_286, statut: 'att' },
        T3: { montant: 895_730_715, statut: 'non' },
        T4: { montant: 895_730_715, statut: 'non' },
      },
    },
    {
      id: 'oms_tech',
      label: 'OMS — Appui technique valorisé',
      couleur: '#15803d',
      bg: '#dcfce7',
      allocation: 60_000_000,
      decaisse: 30_000_000,
      tranches: {
        T1: { montant: 15_000_000, statut: 'ok' },
        T2: { montant: 15_000_000, statut: 'ok' },
        T3: { montant: 15_000_000, statut: 'att' },
        T4: { montant: 15_000_000, statut: 'non' },
      },
    },
    {
      id: 'oms_intrants',
      label: 'OMS — Intrants & consommables médicaux',
      couleur: '#15803d',
      bg: '#dcfce7',
      allocation: 35_000_000,
      decaisse: 17_500_000,
      tranches: {
        T1: { montant: 8_750_000, statut: 'ok' },
        T2: { montant: 8_750_000, statut: 'ok' },
        T3: { montant: 8_750_000, statut: 'att' },
        T4: { montant: 8_750_000, statut: 'non' },
      },
    },
  ],
};

/* ═══════════════════════════════════════════════════════════════════════════
   HELPERS
═══════════════════════════════════════════════════════════════════════════ */

function fondsN(n) {
  return Math.round(n).toLocaleString('fr-FR');
}

function fondsTaux(dec, alloc) {
  return alloc > 0 ? Math.round((dec / alloc) * 1000) / 10 : 0;
}

/** Agrégats totaux */
function fondsTotaux() {
  let eA = 0,
    eD = 0,
    pA = 0,
    pD = 0;
  FONDS.etat.forEach((s) => {
    eA += s.allocation;
    eD += s.decaisse;
  });
  FONDS.ptf.forEach((s) => {
    pA += s.allocation;
    pD += s.decaisse;
  });
  return {
    etat: { allocation: eA, decaisse: eD, ecart: eA - eD },
    ptf: { allocation: pA, decaisse: pD, ecart: pA - pD },
    grand: { allocation: eA + pA, decaisse: eD + pD, ecart: eA + pA - (eD + pD) },
  };
}

/** Lignes consolidées pour le dashboard (5 lignes) */
function fondsDashboardRows() {
  const e = FONDS.etat,
    p = FONDS.ptf;
  const contrep_A = e[2].allocation + e[3].allocation;
  const contrep_D = e[2].decaisse + e[3].decaisse;
  const oms_A = p[1].allocation + p[2].allocation;
  const oms_D = p[1].decaisse + p[2].decaisse;
  return [
    {
      label: 'État — Fonctionnement PSLSH',
      couleur: e[0].couleur,
      bg: e[0].bg,
      allocation: e[0].allocation,
      decaisse: e[0].decaisse,
      anchor: 'fonct',
    },
    {
      label: 'État — Salaires Personnel PSLSH',
      couleur: e[1].couleur,
      bg: e[1].bg,
      allocation: e[1].allocation,
      decaisse: e[1].decaisse,
      anchor: 'salaire',
    },
    {
      label: 'État — Contrepartie (FM/GC7 + OMS)',
      couleur: e[2].couleur,
      bg: e[2].bg,
      allocation: contrep_A,
      decaisse: contrep_D,
      anchor: 'contrepartie',
    },
    {
      label: 'Partenaire — FM/GC7',
      couleur: p[0].couleur,
      bg: p[0].bg,
      allocation: p[0].allocation,
      decaisse: p[0].decaisse,
      anchor: 'fm_gc7',
    },
    {
      label: 'Partenaire — OMS',
      couleur: p[1].couleur,
      bg: p[1].bg,
      allocation: oms_A,
      decaisse: oms_D,
      anchor: 'oms',
    },
  ];
}

/* ═══════════════════════════════════════════════════════════════════════════
   RENDU DASHBOARD — Bloc "Situation des recettes"
═══════════════════════════════════════════════════════════════════════════ */
function fondsRenderDashboard() {
  const tots = fondsTotaux();
  const grand = tots.grand;

  /* KPIs */
  _setTxt('rec-prevision', fondsN(grand.allocation));
  _setTxt('rec-recouvre', fondsN(grand.decaisse));
  _setTxt('rec-ecart', fondsN(grand.ecart));
  _setTxt('rec-taux', `${fondsTaux(grand.decaisse, grand.allocation)} %`);

  /* Tableau */
  const tbody = document.getElementById('rec-table-body');
  const tfoot = document.getElementById('rec-table-foot');
  if (!tbody) return;

  const rows = fondsDashboardRows();
  tbody.innerHTML = rows
    .map((r) => {
      const taux = fondsTaux(r.decaisse, r.allocation);
      const ecart = r.allocation - r.decaisse;
      const pill = `<span class="src-pill" style="background:${r.bg};color:${r.couleur}">${r.label}</span>`;
      const lien = `/pages/budget/fonds-alloues.html#${r.anchor}`;
      return `<tr style="cursor:pointer" onclick="window.location='${lien}'" title="Voir le détail dans Fonds alloués">
      <td>${pill} <a href="${lien}" onclick="event.stopPropagation()" style="font-size:.68rem;color:#94a3b8;margin-left:4px" title="Détail"><i class="fas fa-arrow-right"></i></a></td>
      <td class="text-end fw-semibold">${fondsN(r.allocation)}</td>
      <td class="text-end" style="color:#15803d;font-weight:700">${fondsN(r.decaisse)}</td>
      <td class="text-end" style="color:#b91c1c">${fondsN(ecart)}</td>
      <td class="text-center"><span class="taux-pill ${_tpClass(taux)}">${taux}%</span></td>
      <td><div class="prog-track"><div class="prog-fill ${_pfClass(taux)}" style="width:${Math.min(taux, 100)}%"></div></div></td>
    </tr>`;
    })
    .join('');

  if (tfoot) {
    const t = fondsTaux(grand.decaisse, grand.allocation);
    tfoot.innerHTML = `<tr>
      <td>TOTAL</td>
      <td class="text-end">${fondsN(grand.allocation)}</td>
      <td class="text-end" style="color:#15803d">${fondsN(grand.decaisse)}</td>
      <td class="text-end" style="color:#b91c1c">${fondsN(grand.ecart)}</td>
      <td class="text-center"><span class="taux-pill tp-dark">${t}%</span></td>
      <td><div class="prog-track"><div class="prog-fill pf-dark" style="width:${Math.min(t, 100)}%"></div></div></td>
    </tr>`;
  }
}

/* ═══════════════════════════════════════════════════════════════════════════
   RENDU FONDS-ALLOUÉS — KPIs + en-têtes de groupes
═══════════════════════════════════════════════════════════════════════════ */
function fondsRenderFondsAlloues() {
  const tots = fondsTotaux();
  const grand = tots.grand;

  /* KPI bar supérieure */
  _setTxt('fa-kpi-alloue', fondsN(grand.allocation));
  _setTxt('fa-kpi-decaisse', fondsN(grand.decaisse));
  _setTxt('fa-kpi-attente', fondsN(grand.ecart));
  _setTxt('fa-kpi-reste', fondsN(grand.ecart));
  _setTxt('fa-kpi-taux', `${fondsTaux(grand.decaisse, grand.allocation)} %`);

  /* En-tête Groupe État */
  _setTxt('fa-etat-alloc', `${fondsN(tots.etat.allocation)} FCFA`);
  _setTxt('fa-etat-dec', `${fondsN(tots.etat.decaisse)} FCFA`);
  _setTxt('fa-etat-taux', `${fondsTaux(tots.etat.decaisse, tots.etat.allocation)} %`);

  /* En-tête Groupe PTF */
  _setTxt('fa-ptf-alloc', `${fondsN(tots.ptf.allocation)} FCFA`);
  _setTxt('fa-ptf-dec', `${fondsN(tots.ptf.decaisse)} FCFA`);
  _setTxt('fa-ptf-taux', `${fondsTaux(tots.ptf.decaisse, tots.ptf.allocation)} %`);

  /* Total rows */
  _setTxt('fa-etat-total-alloc', fondsN(tots.etat.allocation));
  _setTxt('fa-etat-total-dec', fondsN(tots.etat.decaisse));
  _setTxt('fa-etat-total-reste', fondsN(tots.etat.ecart));
  _setTxt('fa-etat-total-taux', `${fondsTaux(tots.etat.decaisse, tots.etat.allocation)} %`);

  _setTxt('fa-ptf-total-alloc', fondsN(tots.ptf.allocation));
  _setTxt('fa-ptf-total-dec', fondsN(tots.ptf.decaisse));
  _setTxt('fa-ptf-total-reste', fondsN(tots.ptf.ecart));
  _setTxt('fa-ptf-total-taux', `${fondsTaux(tots.ptf.decaisse, tots.ptf.allocation)} %`);
}

/* helpers internes */
function _setTxt(id, val) {
  const el = document.getElementById(id);
  if (el) el.textContent = val;
}
function _tpClass(t) {
  return t >= 75 ? 'tp-green' : t >= 50 ? 'tp-blue' : t >= 25 ? 'tp-orange' : 'tp-red';
}
function _pfClass(t) {
  return t >= 75 ? 'pf-green' : t >= 50 ? 'pf-blue' : t >= 25 ? 'pf-orange' : 'pf-red';
}

/* ═══════════════════════════════════════════════════════════════════════════
   AUTO-INITIALISATION — Détection de la page courante
   Appelé dès que le script est chargé (scripts en bas de body = DOM prêt)
═══════════════════════════════════════════════════════════════════════════ */
(function _autoInit() {
  function run() {
    if (document.getElementById('fa-kpi-alloue')) fondsRenderFondsAlloues();
    if (document.getElementById('rec-table-body')) fondsRenderDashboard();
  }
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', run);
  } else {
    run();
  }
})();
