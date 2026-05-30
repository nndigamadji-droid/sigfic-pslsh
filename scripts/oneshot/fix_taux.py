import sys, re
sys.stdout.reconfigure(encoding='utf-8')

with open('frontend/pages/planification/plan-achat.html', 'r', encoding='utf-8') as f:
    content = f.read()

# ═══════════════════════════════════════════════════════════════
# 1. CORRIGER execBar : utiliser paye/engage (pas paye/prevu)
#    paye=engage => 100% pour les items "Reçu"
#    paye<engage => % partiel pour "Partiellement reçu"
#    paye=0      => 0%  pour "En attente"
# ═══════════════════════════════════════════════════════════════
OLD_EXEC_BAR = r"""  function execBar(paye, prevu) {
    if (!prevu) return '<span style="color:#94a3b8;font-size:.68rem">0%</span>';
    const t = Math.min(Math.round((paye / prevu) * 100), 100);
    const col = t >= 75 ? '#15803d' : t >= 40 ? '#b45309' : t > 0 ? '#b91c1c' : '#94a3b8';
    const cls = t >= 75 ? 't-high' : t >= 40 ? 't-med' : t > 0 ? 't-low' : 't-zero';
    return `<div class="exec-wrap">
      <div class="exec-track"><div class="exec-fill" style="width:${t}%;ba"""

NEW_EXEC_BAR = r"""  function execBar(paye, prevu, engage) {
    // Taux de paiement = paye / engage (ce qui a été commandé a-t-il été payé ?)
    // Si engage=0 ou absent, on replie sur prevu (budget prévu)
    const base = (engage && engage > 0) ? engage : prevu;
    if (!base) return '<span style="color:#94a3b8;font-size:.68rem">0%</span>';
    const t = Math.min(Math.round((paye / base) * 100), 100);
    const col = t >= 75 ? '#15803d' : t >= 40 ? '#b45309' : t > 0 ? '#b91c1c' : '#94a3b8';
    const cls = t >= 75 ? 't-high' : t >= 40 ? 't-med' : t > 0 ? 't-low' : 't-zero';
    return `<div class="exec-wrap">
      <div class="exec-track"><div class="exec-fill" style="width:${t}%;ba"""

if OLD_EXEC_BAR in content:
    content = content.replace(OLD_EXEC_BAR, NEW_EXEC_BAR, 1)
    print("OK execBar mis à jour (base = engage si disponible)")
else:
    print("ATTENTION: execBar non trouvé textuellement, recherche partielle...")
    idx = content.find('function execBar(paye, prevu)')
    if idx >= 0:
        content = content[:idx] + content[idx:].replace(
            'function execBar(paye, prevu)',
            'function execBar(paye, prevu, engage)', 1)
        print("OK signature execBar mise à jour")
    else:
        print("ERREUR: execBar introuvable")

# ═══════════════════════════════════════════════════════════════
# 2. PASSER engage à execBar dans le renderTable
#    Ligne: <td>${execBar(p.paye || 0, prevu)}</td>
#    Devient: <td>${execBar(p.paye || 0, prevu, p.engage || 0)}</td>
# ═══════════════════════════════════════════════════════════════
OLD_EXECBAR_CALL = '          <td>${execBar(p.paye || 0, prevu)}</td>'
NEW_EXECBAR_CALL = '          <td>${execBar(p.paye || 0, prevu, p.engage || 0)}</td>'

if OLD_EXECBAR_CALL in content:
    content = content.replace(OLD_EXECBAR_CALL, NEW_EXECBAR_CALL, 1)
    print("OK appel execBar mis à jour dans renderTable")
else:
    print("ERREUR: appel execBar non trouvé")

# ═══════════════════════════════════════════════════════════════
# 3. RENOMMER le header de colonne "Taux exéc." → "Taux paiement"
#    + tooltip explicatif
# ═══════════════════════════════════════════════════════════════
OLD_COL_HEADER = '                  <th style="width:110px">Taux exéc.</th>'
NEW_COL_HEADER = '                  <th style="width:110px" title="Taux de paiement = Payé ÷ Engagé. 100% = entièrement payé.">Taux paiement</th>'

if OLD_COL_HEADER in content:
    content = content.replace(OLD_COL_HEADER, NEW_COL_HEADER, 1)
    print("OK entête colonne mis à jour → 'Taux paiement'")
else:
    print("ATTENTION: entête non trouvé tel quel")

# ═══════════════════════════════════════════════════════════════
# 4. AJOUTER les deux taux dans les lignes catégorie (sous-total)
#    taux_eng  = engage / prevu  (% du budget commandé)
#    taux_pay  = paye  / engage  (% des commandes payées)
# ═══════════════════════════════════════════════════════════════
OLD_CAT_SPAN = """          <span style="font-size:.69rem;color:#64748b;font-weight:400;margin-left:8px">
            ${items.length} produit${items.length > 1 ? 's' : ''} ·
            Prévu : <strong>${fmtPlain(cP)}</strong> ·
            Engagé : <strong style="color:#1d4ed8">${fmtPlain(cE)}</strong> ·
            Payé : <strong style="color:#15803d">${fmtPlain(cPy)}</strong> ·
            Écart : <strong style="color:#b91c1c">${fmtPlain(cEc)}</strong>
          </span>"""

NEW_CAT_SPAN = """          <span style="font-size:.69rem;color:#64748b;font-weight:400;margin-left:8px">
            ${items.length} produit${items.length > 1 ? 's' : ''} ·
            Prévu : <strong>${fmtPlain(cP)}</strong> ·
            Engagé : <strong style="color:#1d4ed8">${fmtPlain(cE)}</strong>
              <span style="font-family:monospace;font-size:.62rem;color:#1d4ed8">(${cP>0?Math.round(cE/cP*100):0}% du budget)</span> ·
            Payé : <strong style="color:#15803d">${fmtPlain(cPy)}</strong>
              <span style="font-family:monospace;font-size:.62rem;color:#15803d">(${cE>0?Math.round(cPy/cE*100):0}% des engagements)</span> ·
            Écart budgétaire : <strong style="color:#b91c1c">${fmtPlain(cEc)}</strong>
          </span>"""

if OLD_CAT_SPAN in content:
    content = content.replace(OLD_CAT_SPAN, NEW_CAT_SPAN, 1)
    print("OK lignes catégorie enrichies avec taux_eng et taux_pay")
else:
    print("ATTENTION: span catégorie non trouvé")

# ═══════════════════════════════════════════════════════════════
# 5. CORRIGER le taux dans renderTauxCat (panneau de droite)
#    Actuellement: taux = paye/prevu
#    Correction:   afficher DEUX barres : eng/prevu et pay/engage
# ═══════════════════════════════════════════════════════════════
OLD_TAUX_CAT = r"""      const prevu = items.reduce((s, p) => s + p.qte * p.prix_u, 0);
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

NEW_TAUX_CAT = r"""      const prevu  = items.reduce((s, p) => s + p.qte * p.prix_u,  0);
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

if OLD_TAUX_CAT in content:
    content = content.replace(OLD_TAUX_CAT, NEW_TAUX_CAT, 1)
    print("OK renderTauxCat enrichi avec 2 barres (eng/prévu et payé/engagé)")
else:
    print("ATTENTION: renderTauxCat non trouvé textuellement")

# ═══════════════════════════════════════════════════════════════
# 6. CORRIGER le taux global KPI
#    Ajouter taux d'engagement = engage/prevu en sous-titre
# ═══════════════════════════════════════════════════════════════
OLD_KPI_SUB = """    document.getElementById('alerteTaux').textContent = taux + '%';"""
NEW_KPI_SUB = """    document.getElementById('alerteTaux').textContent = taux + '%';
    // Enrichir le KPI Taux : montrer aussi taux d'engagement
    const tauxEngGlobal = prevu > 0 ? ((engage / prevu) * 100).toFixed(1) : 0;
    const kpiTauxEl = document.getElementById('kpiTaux');
    if (kpiTauxEl) {
      kpiTauxEl.innerHTML = `${taux} %<div style="font-size:.60rem;color:#94a3b8;margin-top:2px;font-family:sans-serif">
        <span title="Engagé / Prévu">eng. ${tauxEngGlobal}%</span>
      </div>`;
    }"""

if OLD_KPI_SUB in content:
    content = content.replace(OLD_KPI_SUB, NEW_KPI_SUB, 1)
    print("OK KPI Taux enrichi avec taux d'engagement")
else:
    print("ATTENTION: alerteTaux non trouvé")

with open('frontend/pages/planification/plan-achat.html', 'w', encoding='utf-8') as f:
    f.write(content)

print()
print("=== CORRECTIONS APPLIQUÉES ===")
print("1. execBar()       : base = engage (si > 0) sinon prevu")
print("   → 'Reçu' avec paye=engage → 100% ✓")
print("   → 'Partiellement reçu'   → % réel ✓")
print("   → 'En attente'           → 0%    ✓")
print("2. Colonne         : 'Taux exéc.' → 'Taux paiement'")
print("3. Sous-totaux cat.: affichent taux_eng (eng/prévu) ET taux_pay (paye/eng)")
print("4. Panel taux cat. : 2 barres séparées (engagement + paiement)")
print("5. KPI Taux        : affiche taux payé + taux engagement")
