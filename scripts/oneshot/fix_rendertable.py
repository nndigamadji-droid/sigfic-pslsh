import sys
sys.stdout.reconfigure(encoding='utf-8')

with open('frontend/pages/planification/plan-achat.html', 'r', encoding='utf-8') as f:
    content = f.read()

# ═══════════════════════════════════════════════════════════════
# Remplacement complet de renderTable()
# Colonnes: N°(1) DCI(2) Cat(3) Qté(4) PrixU(5) CoutGlob(6)
#           Engagé(7) Payé(8) Écart(9) TauxExéc(10) Statut(11) Proc(12) Actions(13)
# ═══════════════════════════════════════════════════════════════

NEW_RENDER_TABLE = r"""  function renderTable(data) {
    _currentFiltered = data;
    const tbody = document.getElementById('tbodyCompte');
    const tfoot = document.getElementById('tfootCompte');

    const tauxCol = t => t >= 75 ? '#15803d' : t >= 40 ? '#b45309' : t > 0 ? '#b91c1c' : '#94a3b8';

    const cats = [...new Set(data.map(p => p.cat))];
    let html = '';

    cats.forEach(cat => {
      const items = data.filter(p => p.cat === cat);
      const cP   = items.reduce((s, p) => s + p.qte * p.prix_u,  0);
      const cE   = items.reduce((s, p) => s + (p.engage || 0),    0);
      const cPy  = items.reduce((s, p) => s + (p.paye   || 0),    0);
      const cEc  = cP - cPy;
      const tExec = cP > 0 ? ((cPy / cP) * 100).toFixed(1) : '0';
      const tEng  = cP > 0 ? Math.round(cE  / cP * 100)    : 0;
      const col   = tauxCol(parseFloat(tExec));
      const totalQte = items.reduce((s, p) => s + p.qte, 0);

      html += `<tr class="row-cat">
        <td colspan="3" style="padding:5px 12px">
          <span class="cat-badge ${CAT_CLS[cat] || ''}">${cat}</span>
          <span style="font-size:.67rem;color:#64748b;margin-left:6px">${items.length} produit${items.length > 1 ? 's' : ''}</span>
        </td>
        <td class="text-center mono" style="font-weight:600;font-size:.71rem;color:#475569">${totalQte.toLocaleString('fr-FR')}</td>
        <td></td>
        <td class="text-end mono" style="font-weight:700">${fmtPlain(cP)}</td>
        <td class="text-end" style="font-weight:700;color:#1d4ed8">
          <div class="mono">${fmtPlain(cE)}</div>
          <div style="font-size:.60rem;color:#1d4ed8;font-family:monospace">${tEng}% eng.</div>
        </td>
        <td class="text-end mono" style="font-weight:700;color:#15803d">${fmtPlain(cPy)}</td>
        <td class="text-end mono" style="font-weight:700;color:#b91c1c">${fmtPlain(cEc)}</td>
        <td style="padding:5px 9px;vertical-align:middle">
          <div style="font-size:.78rem;font-weight:800;color:${col};font-family:monospace">${tExec} %</div>
          <div style="background:#e2e8f0;border-radius:3px;height:5px;overflow:hidden;margin-top:2px">
            <div style="width:${Math.min(parseFloat(tExec),100)}%;height:100%;background:${col};border-radius:3px"></div>
          </div>
          <div style="font-size:.58rem;color:#94a3b8;margin-top:1px">payé / prévu</div>
        </td>
        <td colspan="3"></td>
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

    /* ── PIED DE TABLEAU — totaux généraux + taux global ── */
    const totP   = data.reduce((s, p) => s + p.qte * p.prix_u,  0);
    const totE   = data.reduce((s, p) => s + (p.engage || 0),    0);
    const totPy  = data.reduce((s, p) => s + (p.paye   || 0),    0);
    const totEc  = totP - totPy;
    const totTx  = totP > 0 ? ((totPy / totP) * 100).toFixed(1) : '0';
    const totTxE = totP > 0 ? Math.round(totE  / totP * 100)    : 0;
    const colTot = tauxCol(parseFloat(totTx));

    tfoot.innerHTML = `<tr class="row-total">
      <td colspan="5"><strong>TOTAL GÉNÉRAL — ${data.length} produit${data.length > 1 ? 's' : ''}</strong></td>
      <td class="text-end mono"><strong>${fmtPlain(totP)}</strong></td>
      <td class="text-end">
        <div class="mono"><strong>${fmtPlain(totE)}</strong></div>
        <div style="font-size:.60rem;color:#93c5fd;font-family:monospace">${totTxE}% eng.</div>
      </td>
      <td class="text-end mono"><strong style="color:#4ade80">${fmtPlain(totPy)}</strong></td>
      <td class="text-end mono"><strong style="color:#fca5a5">${fmtPlain(totEc)}</strong></td>
      <td style="padding:6px 9px;vertical-align:middle">
        <div style="font-size:.90rem;font-weight:900;color:${colTot};font-family:monospace">${totTx} %</div>
        <div style="background:rgba(255,255,255,.15);border-radius:4px;height:6px;overflow:hidden;margin-top:3px">
          <div style="width:${Math.min(parseFloat(totTx),100)}%;height:100%;background:${colTot};border-radius:4px"></div>
        </div>
        <div style="font-size:.59rem;color:#94a3b8;margin-top:2px">taux d'exécution</div>
      </td>
      <td colspan="3"></td>
    </tr>`;
  }"""

old_start = content.find('  function renderTable(data) {')
old_end   = content.find('\n  }', old_start) + len('\n  }')

if old_start < 0:
    print("ERREUR: renderTable() non trouvé")
else:
    content = content[:old_start] + NEW_RENDER_TABLE + content[old_end:]
    print(f"OK renderTable() remplacé ({old_start} -> {old_end})")

# ═══════════════════════════════════════════════════════════════
# Aussi corriger updateKpis() pour afficher taux engagement + taux exec
# séparément dans la barre KPI
# ═══════════════════════════════════════════════════════════════
# Le 5ème KPI "Taux d'exécution" doit montrer : taux exec ET taux engagement
OLD_KPI_TAUX = "    document.getElementById('kpiTaux').textContent   = taux + ' %';"
NEW_KPI_TAUX = """    document.getElementById('kpiTaux').textContent   = taux + ' %';
    const tauxEng = prevu > 0 ? ((engage / prevu) * 100).toFixed(1) : 0;
    const kpiSub = document.querySelector('#kpiTaux')?.closest('.pa-kpi')?.querySelector('.pk-sub');
    if (kpiSub) kpiSub.innerHTML = `<span style="color:#94a3b8">eng. ${tauxEng}%</span> · <span style="color:#64748b">payé/prévu</span>`;"""

if OLD_KPI_TAUX in content:
    content = content.replace(OLD_KPI_TAUX, NEW_KPI_TAUX, 1)
    print("OK kpiTaux enrichi avec taux engagement")
else:
    print("ATTENTION: kpiTaux non trouvé")

# ═══════════════════════════════════════════════════════════════
# CSS: row-cat doit avoir un fond légèrement différent pour
# bien ressortir comme ligne de sous-total
# ═══════════════════════════════════════════════════════════════
OLD_CAT_CSS = "    .row-cat"
# On cherche la règle CSS existante
idx = content.find('.row-cat')
if idx >= 0:
    # Trouver le bloc CSS complet de .row-cat
    block_start = content.rfind('\n', 0, idx)
    block_end   = content.find('\n', idx)
    old_line = content[block_start:block_end]
    print(f"CSS .row-cat trouvé: {repr(old_line[:80])}")

with open('frontend/pages/planification/plan-achat.html', 'w', encoding='utf-8') as f:
    f.write(content)

print("\nFichier sauvegardé avec succès.")
print("Résumé des corrections:")
print("  1. Sous-totaux catégorie : colonnes alignées + taux exéc. + taux eng.")
print("  2. Pied de tableau       : taux global visible + barre de progression")
print("  3. KPI taux              : affiche taux eng. et taux exéc.")
