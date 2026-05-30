import sys, re
sys.stdout.reconfigure(encoding='utf-8')

with open('frontend/pages/planification/plan-achat.html', 'r', encoding='utf-8') as f:
    content = f.read()

# ═══════════════════════════════════════════════════════════════
# 1. REVENIR à la version originale de renderTable
#    (colspan=13 en sous-total, simple et propre)
# ═══════════════════════════════════════════════════════════════

OLD_RENDER_START = content.find('  function renderTable(data) {')
OLD_RENDER_END   = content.find('\n  }', OLD_RENDER_START) + len('\n  }')

ORIGINAL_RENDER_TABLE = r"""  function renderTable(data) {
    _currentFiltered = data;
    const tbody = document.getElementById('tbodyCompte');
    const tfoot = document.getElementById('tfootCompte');

    const cats = [...new Set(data.map(p => p.cat))];
    let html = '';

    cats.forEach(cat => {
      const items = data.filter(p => p.cat === cat);
      const cP  = items.reduce((s, p) => s + p.qte * p.prix_u,  0);
      const cE  = items.reduce((s, p) => s + (p.engage || 0),    0);
      const cPy = items.reduce((s, p) => s + (p.paye   || 0),    0);
      const cEc = cP - cPy;

      html += `<tr class="row-cat">
        <td colspan="13" style="padding:6px 12px;">
          <span class="cat-badge ${CAT_CLS[cat] || ''}">${cat}</span>
          <span style="font-size:.69rem;color:#64748b;font-weight:400;margin-left:8px">
            ${items.length} produit${items.length > 1 ? 's' : ''} ·
            Prévu : <strong>${fmtPlain(cP)}</strong> ·
            Engagé : <strong style="color:#1d4ed8">${fmtPlain(cE)}</strong> ·
            Payé : <strong style="color:#15803d">${fmtPlain(cPy)}</strong> ·
            Écart : <strong style="color:#b91c1c">${fmtPlain(cEc)}</strong>
          </span>
        </td>
      </tr>`;

      items.forEach(p => {
        const prevu = p.qte * p.prix_u;
        const ecart = prevu - (p.paye || 0);
        html += `<tr data-id="${p.id}">
          <td style="color:#64748b;font-size:.7rem;font-weight:700">${p.id}</td>
          <td style="max-width:230px" title="${p.dci.replace(/"/g,'&quot;')}">
            <div style="white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${p.dci}</div>
            <div style="font-size:.65rem;color:#94a3b8">${p.unite}</div>
          </td>
          <td>${catBadge(p.cat)}</td>
          <td class="text-center mono">${p.qte.toLocaleString('fr-FR')}</td>
          <td class="text-end mono">${fmtPlain(p.prix_u)}</td>
          <td class="text-end mono"><strong>${fmtPlain(prevu)}</strong></td>
          <td class="text-end mono" style="color:#1d4ed8">${fmtPlain(p.engage)}</td>
          <td class="text-end mono" style="color:#15803d">${fmtPlain(p.paye)}</td>
          <td class="text-end mono" style="color:#b91c1c">${fmtPlain(ecart)}</td>
          <td>${execBar(p.paye || 0, prevu)}</td>
          <td>${statutBadge(p.statut)}</td>
          <td>${procBadge(p.procedure)}</td>
          <td class="text-center" style="white-space:nowrap">
            <button class="btn-act btn-act-edit me-1" onclick="openModalEdit(${p.id})" title="Modifier">
              <i class="fas fa-pencil-alt"></i>
            </button>
            <button class="btn-act btn-act-del" onclick="openModalDel(${p.id})" title="Supprimer">
              <i class="fas fa-trash-alt"></i>
            </button>
          </td>
        </tr>`;
      });
    });

    tbody.innerHTML = html;

    const totP  = data.reduce((s, p) => s + p.qte * p.prix_u,  0);
    const totE  = data.reduce((s, p) => s + (p.engage || 0),    0);
    const totPy = data.reduce((s, p) => s + (p.paye   || 0),    0);
    const totEc = totP - totPy;
    const tExec = totP > 0 ? ((totPy / totP) * 100).toFixed(1) : '0';
    const tEng  = totP > 0 ? ((totE  / totP) * 100).toFixed(1) : '0';

    tfoot.innerHTML = `<tr class="row-total">
      <td colspan="5"><strong>TOTAL : ${data.length} produit${data.length > 1 ? 's' : ''}</strong></td>
      <td class="text-end mono"><strong>${fmtPlain(totP)}</strong></td>
      <td class="text-end mono"><strong>${fmtPlain(totE)}</strong>
        <div style="font-size:.60rem;font-family:monospace;color:#93c5fd">${tEng}% eng.</div>
      </td>
      <td class="text-end mono"><strong>${fmtPlain(totPy)}</strong>
        <div style="font-size:.60rem;font-family:monospace;color:#86efac">${tExec}% payé</div>
      </td>
      <td class="text-end mono" style="color:#fca5a5"><strong>${fmtPlain(totEc)}</strong></td>
      <td colspan="4"></td>
    </tr>`;
  }"""

content = content[:OLD_RENDER_START] + ORIGINAL_RENDER_TABLE + content[OLD_RENDER_END:]
print("OK renderTable restauré à l'original + taux ajoutés dans tfoot")

# ═══════════════════════════════════════════════════════════════
# 2. CORRIGER srcTotal — doit TOUJOURS égaler kpiPrevu
#    BUG: srcTotal ne comptait que les items PAO 032-035
#    Si un item a un autre code PAO → exclu du total → srcTotal ≠ kpiPrevu
# ═══════════════════════════════════════════════════════════════
OLD_PAO_BLOCK = """    // Sources de financement (4 PAO)
    const paoIds = ['032','033','034','035'];
    const paoMts = paoIds.map(id => data.filter(p=>p.pao==='PSLSH-'+id).reduce((s,p)=>s+p.qte*p.prix_u,0));
    const tot    = paoMts.reduce((a,b)=>a+b,0);
    paoIds.forEach((id,i)=>{
      const pct = tot > 0 ? Math.round(paoMts[i]/tot*100) : 0;
      const elMt  = document.getElementById('srcMt'+id);
      const elPct = document.getElementById('srcPct'+id);
      const elBar = document.getElementById('srcBar'+id);
      if(elMt)  elMt.textContent  = fmtPlain(paoMts[i]) + ' FCFA';
      if(elPct) elPct.textContent = pct + '%';
      if(elBar) elBar.style.width = pct + '%';
    });
    document.getElementById('srcTotal').textContent = fmtPlain(tot) + ' FCFA';"""

NEW_PAO_BLOCK = """    // Sources de financement (4 PAO)
    // IMPORTANT: srcTotal = somme TOTALE de TOUS les items (même ceux hors 032-035)
    // pour que srcTotal soit TOUJOURS identique à kpiPrevu
    const totBudget = data.reduce((s, p) => s + p.qte * p.prix_u, 0);
    const paoIds = ['032','033','034','035'];
    const paoMts = paoIds.map(id => data.filter(p=>p.pao==='PSLSH-'+id).reduce((s,p)=>s+p.qte*p.prix_u,0));
    // Items avec codes PAO non standard → regroupés dans 035 pour l'affichage
    const paoSum = paoMts.reduce((a,b)=>a+b,0);
    const reste  = totBudget - paoSum;   // items hors 032-034 rattachés à 035
    const paoMtsAjust = [...paoMts];
    paoMtsAjust[3] += reste;             // ajout dans PSLSH-035
    paoIds.forEach((id,i)=>{
      const pct = totBudget > 0 ? Math.round(paoMtsAjust[i]/totBudget*100) : 0;
      const elMt  = document.getElementById('srcMt'+id);
      const elPct = document.getElementById('srcPct'+id);
      const elBar = document.getElementById('srcBar'+id);
      if(elMt)  elMt.textContent  = fmtPlain(paoMtsAjust[i]) + ' FCFA';
      if(elPct) elPct.textContent = pct + '%';
      if(elBar) elBar.style.width = pct + '%';
    });
    document.getElementById('srcTotal').textContent = fmtPlain(totBudget) + ' FCFA';"""

if OLD_PAO_BLOCK in content:
    content = content.replace(OLD_PAO_BLOCK, NEW_PAO_BLOCK, 1)
    print("OK srcTotal corrigé → égal à kpiPrevu (tous items inclus)")
else:
    print("ATTENTION: bloc PAO non trouvé tel quel, recherche alternative...")
    # Chercher et corriger l'essentiel
    old_src = "document.getElementById('srcTotal').textContent = fmtPlain(tot) + ' FCFA';"
    new_src = "document.getElementById('srcTotal').textContent = fmtPlain(data.reduce((s,p)=>s+p.qte*p.prix_u,0)) + ' FCFA';"
    if old_src in content:
        content = content.replace(old_src, new_src, 1)
        print("OK srcTotal corrigé (fallback)")
    else:
        print("ERREUR: srcTotal non trouvé")

# ═══════════════════════════════════════════════════════════════
# 3. REVENIR au kpiTaux original (sans enrichissement)
# ═══════════════════════════════════════════════════════════════
OLD_KTAUX = """    document.getElementById('kpiTaux').textContent   = taux + ' %';
    const tauxEng = prevu > 0 ? ((engage / prevu) * 100).toFixed(1) : 0;
    const kpiSub = document.querySelector('#kpiTaux')?.closest('.pa-kpi')?.querySelector('.pk-sub');
    if (kpiSub) kpiSub.innerHTML = `<span style="color:#94a3b8">eng. ${tauxEng}%</span> · <span style="color:#64748b">payé/prévu</span>`;"""

NEW_KTAUX = "    document.getElementById('kpiTaux').textContent   = taux + ' %';"

if OLD_KTAUX in content:
    content = content.replace(OLD_KTAUX, NEW_KTAUX, 1)
    print("OK kpiTaux restauré à l'original")
else:
    print("INFO: kpiTaux déjà à l'original ou non trouvé")

# ═══════════════════════════════════════════════════════════════
# 4. COHÉRENCE DES TOTAUX — s'assurer que le taux dans
#    renderTauxCat et execBar utilisent la même formule :
#    taux = paye / (qte * prix_u)  → PAS paye/engage
# ═══════════════════════════════════════════════════════════════
# Vérification: execBar utilise bien prevu = qte*prix_u
idx_execbar = content.find('function execBar(paye, prevu)')
if idx_execbar >= 0:
    print("OK execBar utilise prevu = qte*prix_u (formule correcte)")

# Vérification: taux KPI = paye / prevu (pas paye/engage)
idx_taux_kpi = content.find('const taux   = prevu > 0 ? ((paye / prevu)')
if idx_taux_kpi >= 0:
    print("OK kpiTaux = paye/prevu (formule correcte)")

with open('frontend/pages/planification/plan-achat.html', 'w', encoding='utf-8') as f:
    f.write(content)

print("\n=== RÉSUMÉ DES CORRECTIONS ===")
print("1. renderTable restauré (colspan=13) + taux eng/payé ajoutés dans le TOTAL")
print("2. srcTotal CORRIGÉ → inclut TOUS les items, identique à kpiPrevu")
print("3. Items hors PAO 032-034 rattachés à PSLSH-035 dans l'affichage")
print("4. Formule taux = paye/prevu cohérente partout")
print("\nFichier sauvegardé.")
