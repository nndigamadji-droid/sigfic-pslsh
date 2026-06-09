/* ════════════════════════════════════════════════════════════════════════════
   Bandeau de conformité OHADA + principes budgétaires Tchad — auto-injection
   Dépendances : budget-engine.js (window.BUDGET), optionnel syscohada.js
   Usage : déposer simplement <div id="bandeauConformite"></div> sur la page.
   ════════════════════════════════════════════════════════════════════════════ */
(function () {
  'use strict';

  const STORAGE_KEYS = ['pslsh_lignes_v1', 'pslsh_lignes_saved'];

  function injectStyles() {
    if (document.getElementById('bandeauConformiteStyles')) return;
    const s = document.createElement('style');
    s.id = 'bandeauConformiteStyles';
    s.textContent = `
      .bandeau-conformite{background:linear-gradient(135deg,#f0f9ff 0%,#eef2ff 100%);
        border:1px solid #bfdbfe;border-left:4px solid #1b3a6b;border-radius:10px;
        padding:14px 18px;margin-bottom:14px;}
      .bandeau-conformite .bc-row{display:grid;grid-template-columns:repeat(6,1fr);gap:14px;}
      .bandeau-conformite .bc-item{display:flex;align-items:flex-start;gap:9px;padding:6px 8px;border-radius:7px;}
      .bandeau-conformite .bc-item.bc-warn{background:#fef2f2;border:1px solid #fca5a5;}
      .bandeau-conformite .bc-item i{font-size:1.05rem;margin-top:2px;}
      .bandeau-conformite .bc-lbl{font-size:.62rem;font-weight:700;color:#64748b;
        text-transform:uppercase;letter-spacing:.04em;}
      .bandeau-conformite .bc-val{font-size:.78rem;font-weight:700;color:#1b2f52;margin-top:1px;line-height:1.2;}
      .bandeau-conformite .bc-note{margin-top:10px;padding-top:10px;border-top:1px dashed #bfdbfe;
        font-size:.7rem;color:#475569;line-height:1.5;}
      @media (max-width:1200px){.bandeau-conformite .bc-row{grid-template-columns:repeat(3,1fr);}}
    `;
    document.head.appendChild(s);
  }

  function readLignes() {
    for (const k of STORAGE_KEYS) {
      try {
        const raw = localStorage.getItem(k);
        if (!raw) continue;
        const p = JSON.parse(raw);
        if (Array.isArray(p)) return p;
        if (p && Array.isArray(p.data)) return p.data;
      } catch (_) {}
    }
    return [];
  }

  function render() {
    const el = document.getElementById('bandeauConformite');
    if (!el || !window.BUDGET) return;
    injectStyles();
    const lignes = readLignes();
    const k = BUDGET.conformiteKpis(lignes);
    const ex = k.exercice;
    const periodeColor = ex.ouvert
      ? (ex.periode === 'complementaire' ? '#b45309' : '#15803d')
      : '#b91c1c';
    el.innerHTML = `<div class="bc-row">
      <div class="bc-item">
        <i class="fas fa-calendar-alt" style="color:${periodeColor}"></i>
        <div><div class="bc-lbl">Exercice ${ex.exercice}</div>
          <div class="bc-val" style="color:${periodeColor}">${
            ex.periode === 'complementaire' ? 'Période complémentaire'
            : ex.periode === 'principale' ? 'Période principale ouverte'
            : 'Fermé'
          }</div></div>
      </div>
      <div class="bc-item">
        <i class="fas fa-book" style="color:#1b3a6b"></i>
        <div><div class="bc-lbl">Mapping OHADA</div>
          <div class="bc-val">${k.mappes}/${k.total} lignes</div></div>
      </div>
      <div class="bc-item">
        <i class="fas fa-shield-alt" style="color:#15803d"></i>
        <div><div class="bc-lbl">Hard-check engagement</div>
          <div class="bc-val">Actif — Eng. ≤ Disponible</div></div>
      </div>
      <div class="bc-item">
        <i class="fas fa-ban" style="color:#15803d"></i>
        <div><div class="bc-lbl">Non-compensation</div>
          <div class="bc-val">Journaux JA / JV séparés</div></div>
      </div>
      <div class="bc-item ${k.depassement ? 'bc-warn' : ''}">
        <i class="fas fa-exclamation-triangle" style="color:${k.depassement ? '#b91c1c' : '#94a3b8'}"></i>
        <div><div class="bc-lbl">Dépassements</div>
          <div class="bc-val" style="color:${k.depassement ? '#b91c1c' : '#15803d'}">${k.depassement} ligne(s)</div></div>
      </div>
      <div class="bc-item">
        <i class="fas fa-history" style="color:#475569"></i>
        <div><div class="bc-lbl">Journal d'audit</div>
          <div class="bc-val">${BUDGET.readAudit().length} entrée(s)</div></div>
      </div>
    </div>
    <div class="bc-note">${ex.message}</div>`;
  }

  // Auto-inject on DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', render);
  } else {
    render();
  }

  // Re-render on demand (par ex. après modification de lignes)
  window.refreshBandeauConformite = render;
})();
