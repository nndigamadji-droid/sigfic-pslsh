import sys
sys.stdout.reconfigure(encoding='utf-8')

with open('frontend/pages/planification/plan-achat.html', 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Restaurer execBar — base = prevu
content = content.replace(
    'function execBar(paye, prevu, engage)',
    'function execBar(paye, prevu)', 1)
content = content.replace(
    '    // Taux de paiement = paye / engage (ce qui a été commandé a-t-il été payé ?)\n    // Si engage=0 ou absent, on replie sur prevu (budget prévu)\n    const base = (engage && engage > 0) ? engage : prevu;\n    if (!base) return \'<span style="color:#94a3b8;font-size:.68rem">0%</span>\';\n    const t = Math.min(Math.round((paye / base) * 100), 100);',
    '    if (!prevu) return \'<span style="color:#94a3b8;font-size:.68rem">0%</span>\';\n    const t = Math.min(Math.round((paye / prevu) * 100), 100);', 1)
print("OK execBar restauré → paye/prevu")

# 2. Restaurer l'appel execBar sans le 3e argument
content = content.replace(
    '          <td>${execBar(p.paye || 0, prevu, p.engage || 0)}</td>',
    '          <td>${execBar(p.paye || 0, prevu)}</td>', 1)
print("OK appel execBar restauré")

# 3. Restaurer le header de colonne
content = content.replace(
    '                  <th style="width:110px" title="Taux de paiement = Payé ÷ Engagé. 100% = entièrement payé.">Taux paiement</th>',
    '                  <th style="width:110px">Taux exéc.</th>', 1)
print("OK entête colonne restauré → 'Taux exéc.'")

# 4. Restaurer le span des lignes catégorie (version originale simple)
OLD_NEW_SPAN = """          <span style="font-size:.69rem;color:#64748b;font-weight:400;margin-left:8px">
            ${items.length} produit${items.length > 1 ? 's' : ''} ·
            Prévu : <strong>${fmtPlain(cP)}</strong> ·
            Engagé : <strong style="color:#1d4ed8">${fmtPlain(cE)}</strong>
              <span style="font-family:monospace;font-size:.62rem;color:#1d4ed8">(${cP>0?Math.round(cE/cP*100):0}% du budget)</span> ·
            Payé : <strong style="color:#15803d">${fmtPlain(cPy)}</strong>
              <span style="font-family:monospace;font-size:.62rem;color:#15803d">(${cE>0?Math.round(cPy/cE*100):0}% des engagements)</span> ·
            Écart budgétaire : <strong style="color:#b91c1c">${fmtPlain(cEc)}</strong>
          </span>"""
OLD_ORIG_SPAN = """          <span style="font-size:.69rem;color:#64748b;font-weight:400;margin-left:8px">
            ${items.length} produit${items.length > 1 ? 's' : ''} ·
            Prévu : <strong>${fmtPlain(cP)}</strong> ·
            Engagé : <strong style="color:#1d4ed8">${fmtPlain(cE)}</strong> ·
            Payé : <strong style="color:#15803d">${fmtPlain(cPy)}</strong> ·
            Écart : <strong style="color:#b91c1c">${fmtPlain(cEc)}</strong>
          </span>"""
if OLD_NEW_SPAN in content:
    content = content.replace(OLD_NEW_SPAN, OLD_ORIG_SPAN, 1)
    print("OK lignes catégorie restaurées")

# 5. Restaurer renderTauxCat — version originale
OLD_NEW_TAUX = r"""      const prevu  = items.reduce((s, p) => s + p.qte * p.prix_u,  0);
      const engage = items.reduce((s, p) => s + (p.engage || 0),   0);
      const paye   = items.reduce((s, p) => s + (p.paye   || 0),   0);
      // Taux d'engagement = engage/prevu (% du budget planifié commandé)
      const tauxEng = prevu  > 0 ? Math.round((engage / prevu)  * 100) : 0;
      // Taux de paiement  = paye/engage  (% des commandes payées)
      const tauxPay = engage > 0 ? Math.round((paye   / engage) * 100) : 0;
      const colEng  = tauxEng >= 75 ? '#1d4ed8' : tauxEng >= 40 ? '#3b82f6' : tauxEng > 0 ? '#93c5fd' : '#94a3b8';
      const colPay  = tauxPay >= 75 ? '#15803d' : tauxPay >= 40 ? '#b45309' : tauxPay > 0 ? '#b91c1c' : '#94a3b8';
      return `<div class="taux-cat-row" style="margin-bottom:8px">
        <div class="tl" style="margin-bottom:1px">
          <span style="color:#2d3748;font-size:.71rem;font-weight:600">${cat}</span>
        </div>
        <div style="display:flex;align-items:center;gap:4px;margin-bottom:2px">
          <span style="font-size:.60rem;color:#64748b;width:68px">Engag./prévu</span>
          <div class="src-bar-track" style="flex:1"><div class="src-bar-fill" style="width:${tauxEng}%;background:${colEng}"></div></div>
          <span style="font-weight:700;color:${colEng};font-family:monospace;font-size:.68rem;width:30px;text-align:right">${tauxEng}%</span>
        </div>
        <div style="display:flex;align-items:center;gap:4px">
          <span style="font-size:.60rem;color:#64748b;width:68px">Payé/engagé</span>
          <div class="src-bar-track" style="flex:1"><div class="src-bar-fill" style="width:${tauxPay}%;background:${colPay}"></div></div>
          <span style="font-weight:700;color:${colPay};font-family:monospace;font-size:.68rem;width:30px;text-align:right">${tauxPay}%</span>
        </div>
      </div>`;"""
OLD_ORIG_TAUX = r"""      const prevu = items.reduce((s, p) => s + p.qte * p.prix_u, 0);
      const paye  = items.reduce((s, p) => s + (p.paye || 0), 0);
      const taux  = prevu > 0 ? Math.round((paye / prevu) * 100) : 0;
      const col   = taux >= 75 ? '#15803d' : taux >= 40 ? '#b45309' : taux > 0 ? '#b91c1c' : '#94a3b8';
      return `<div class="taux-cat-row">
        <div class="tl">
          <span style="color:#2d3748;font-size:.71rem">${cat}</span>
          <span style="font-weight:700;color:${col};font-family:monospace;font-size:.71rem">${taux}%</span>
        </div>
        <div class="src-bar-track"><div class="src-bar-fill" style="width:${taux}%;background:${col}"></div></div>
      </div>`;"""
if OLD_NEW_TAUX in content:
    content = content.replace(OLD_NEW_TAUX, OLD_ORIG_TAUX, 1)
    print("OK renderTauxCat restauré")

# 6. Restaurer le KPI taux (supprimer l'enrichissement)
OLD_NEW_KPI = """    document.getElementById('alerteTaux').textContent = taux + '%';
    // Enrichir le KPI Taux : montrer aussi taux d'engagement
    const tauxEngGlobal = prevu > 0 ? ((engage / prevu) * 100).toFixed(1) : 0;
    const kpiTauxEl = document.getElementById('kpiTaux');
    if (kpiTauxEl) {
      kpiTauxEl.innerHTML = `${taux} %<div style="font-size:.60rem;color:#94a3b8;margin-top:2px;font-family:sans-serif">
        <span title="Engagé / Prévu">eng. ${tauxEngGlobal}%</span>
      </div>`;
    }"""
OLD_ORIG_KPI = "    document.getElementById('alerteTaux').textContent = taux + '%';"
if OLD_NEW_KPI in content:
    content = content.replace(OLD_NEW_KPI, OLD_ORIG_KPI, 1)
    print("OK KPI taux restauré")

with open('frontend/pages/planification/plan-achat.html', 'w', encoding='utf-8') as f:
    f.write(content)

print("\nFichier restauré. Taux = paye/prévu partout.")
