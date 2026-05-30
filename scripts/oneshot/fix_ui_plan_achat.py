import sys
sys.stdout.reconfigure(encoding='utf-8')

with open('frontend/pages/planification/plan-achat.html', 'r', encoding='utf-8') as f:
    content = f.read()

# ═══════════════════════════════════════════════════════════════
# 1. REMPLACER le bloc CSS complet (de .pa-page jusqu'à .taux-cat-row)
#    avec la version améliorée ui-ux-pro-max
# ═══════════════════════════════════════════════════════════════

OLD_CSS_CORE = """    .pa-page { padding:24px 28px 40px; }

    /* ── KPI ── */
    .pa-kpi-bar { display:grid; grid-template-columns:repeat(5,1fr); gap:12px; margin-bottom:18px; }
    .pa-kpi { background:#fff; border:1px solid #e2e8f0; border-radius:10px; padding:12px 16px; position:relative; overflow:hidden; }
    .pa-kpi::before { content:''; position:absolute; top:0;left:0;right:0;height:3px; }
    .pk-blue::before   { background:#1b3a6b; }
    .pk-green::before  { background:#15803d; }
    .pk-orange::before { background:#b45309; }
    .pk-red::before    { background:#b91c1c; }
    .pk-purple::before { background:#6d28d9; }
    .pa-kpi .pk-lbl { font-size:.67rem; font-weight:700; color:#64748b; text-transform:uppercase; letter-spacing:.04em; }
    .pa-kpi .pk-val { font-size:.95rem; font-weight:800; color:#1b2f52; font-family:monospace; margin:3px 0; }
    .pa-kpi .pk-sub { font-size:.67rem; color:#94a3b8; }"""

NEW_CSS_CORE = """    .pa-page { padding:24px 28px 40px; }

    /* ── Focus global (Accessibilité §1) ── */
    *:focus-visible {
      outline: 2px solid #1b3a6b;
      outline-offset: 2px;
      border-radius: 4px;
    }

    /* ── KPI ── */
    .pa-kpi-bar { display:grid; grid-template-columns:repeat(5,1fr); gap:12px; margin-bottom:18px; }
    .pa-kpi {
      background:#fff; border:1px solid #e2e8f0; border-radius:12px;
      padding:14px 16px; position:relative; overflow:hidden;
      transition: box-shadow .2s ease, transform .2s ease;
    }
    .pa-kpi:hover {
      box-shadow: 0 4px 16px rgba(27,58,107,.10);
      transform: translateY(-2px);
    }
    .pa-kpi::before { content:''; position:absolute; top:0;left:0;right:0;height:4px; border-radius:12px 12px 0 0; }
    .pk-blue::before   { background: linear-gradient(90deg,#1b3a6b,#2563eb); }
    .pk-green::before  { background: linear-gradient(90deg,#15803d,#22c55e); }
    .pk-orange::before { background: linear-gradient(90deg,#b45309,#f59e0b); }
    .pk-red::before    { background: linear-gradient(90deg,#b91c1c,#ef4444); }
    .pk-purple::before { background: linear-gradient(90deg,#6d28d9,#a855f7); }
    /* Icône de fond (décoration visuelle) */
    .pa-kpi .pk-icon {
      position:absolute; top:12px; right:14px;
      font-size:1.5rem; opacity:.07;
    }
    .pk-blue .pk-icon   { color:#1b3a6b; }
    .pk-green .pk-icon  { color:#15803d; }
    .pk-orange .pk-icon { color:#b45309; }
    .pk-red .pk-icon    { color:#b91c1c; }
    .pk-purple .pk-icon { color:#6d28d9; }
    /* Typographie KPI améliorée (§6 weight-hierarchy) */
    .pa-kpi .pk-lbl { font-size:.72rem; font-weight:700; color:#64748b; text-transform:uppercase; letter-spacing:.05em; }
    .pa-kpi .pk-val { font-size:1.05rem; font-weight:800; color:#1b2f52; font-family:monospace; margin:5px 0 3px; line-height:1.2; }
    .pa-kpi .pk-sub { font-size:.70rem; color:#94a3b8; }"""

if OLD_CSS_CORE in content:
    content = content.replace(OLD_CSS_CORE, NEW_CSS_CORE, 1)
    print("OK KPI cards CSS améliorés")
else:
    print("WARN: bloc KPI CSS non trouvé")

# ─── 2. Tabs : animation fadeIn + hover amélioré ───
OLD_TABS_CSS = """    /* ── Tabs ── */
    .pa-tabs { display:flex; gap:0; border-bottom:2px solid #e2e8f0; margin-bottom:16px; }
    .pa-tab { padding:8px 18px; font-size:.8rem; font-weight:600; color:#64748b; cursor:pointer; border-bottom:2px solid transparent; margin-bottom:-2px; transition:all .15s; }
    .pa-tab:hover { color:#1b2f52; }
    .pa-tab.active { color:#1b2f52; border-bottom-color:#1b2f52; }
    .pa-panel { display:none; }
    .pa-panel.active { display:block; }"""

NEW_TABS_CSS = """    /* ── Tabs (§7 state-transition, duration-timing) ── */
    .pa-tabs { display:flex; gap:4px; border-bottom:2px solid #e2e8f0; margin-bottom:16px; padding-bottom:0; }
    .pa-tab {
      padding:9px 18px; font-size:.8rem; font-weight:600; color:#64748b;
      cursor:pointer; border-bottom:2px solid transparent; margin-bottom:-2px;
      transition:color .18s ease, border-color .18s ease, background .18s ease;
      border-radius:8px 8px 0 0; display:flex; align-items:center; gap:6px;
      white-space:nowrap; user-select:none;
    }
    .pa-tab:hover { color:#1b2f52; background:#f1f5f9; }
    .pa-tab.active { color:#1b3a6b; border-bottom-color:#1b3a6b; font-weight:700; }
    .pa-tab:focus-visible { outline:2px solid #1b3a6b; outline-offset:2px; }
    /* Animation panel (§7 fadeIn) */
    .pa-panel { display:none; }
    .pa-panel.active { display:block; animation:paFadeIn .2s ease; }
    @keyframes paFadeIn {
      from { opacity:0; transform:translateY(5px); }
      to   { opacity:1; transform:translateY(0); }
    }"""

if OLD_TABS_CSS in content:
    content = content.replace(OLD_TABS_CSS, NEW_TABS_CSS, 1)
    print("OK Tabs CSS améliorés (animation + hover)")
else:
    print("WARN: Tabs CSS non trouvé")

# ─── 3. Entête bloc : gradient ───
OLD_BLOC_HEAD = "    .pa-bloc-head { display:flex; align-items:center; gap:12px; padding:10px 18px; background:#1b2f52; }"
NEW_BLOC_HEAD = "    .pa-bloc-head { display:flex; align-items:center; gap:12px; padding:12px 18px; background:linear-gradient(135deg,#1b2f52 0%,#1b3a6b 100%); }"

if OLD_BLOC_HEAD in content:
    content = content.replace(OLD_BLOC_HEAD, NEW_BLOC_HEAD, 1)
    print("OK En-tête bloc : gradient ajouté")
else:
    print("WARN: .pa-bloc-head non trouvé")

# ─── 4. Table : taille texte + padding + hover couleur ───
OLD_TABLE_CSS = """    /* ── Table ── */
    .pa-table { width:100%; border-collapse:collapse; font-size:.76rem; }
    .pa-table thead th { background:#f1f5f9; color:#1b2f52; font-size:.66rem; font-weight:700; text-transform:uppercase; letter-spacing:.03em; padding:8px 9px; border-bottom:2px solid #e2e8f0; white-space:nowrap; position:sticky; top:0; z-index:2; }
    .pa-table tbody td { padding:7px 9px; border-bottom:1px solid #f1f5f9; color:#2d3748; vertical-align:middle; }
    .pa-table tbody tr:hover td { background:#f8fafc; }"""

NEW_TABLE_CSS = """    /* ── Table (§6 contrast-readability, §1 accessible) ── */
    .pa-table { width:100%; border-collapse:collapse; font-size:.79rem; }
    .pa-table thead th {
      background:#f1f5f9; color:#1b2f52;
      font-size:.69rem; font-weight:700; text-transform:uppercase;
      letter-spacing:.03em; padding:9px 10px;
      border-bottom:2px solid #e2e8f0; white-space:nowrap;
      position:sticky; top:0; z-index:2;
    }
    .pa-table tbody td { padding:8px 10px; border-bottom:1px solid #f1f5f9; color:#2d3748; vertical-align:middle; }
    .pa-table tbody tr:hover td { background:#eff6ff; transition:background .12s ease; }"""

if OLD_TABLE_CSS in content:
    content = content.replace(OLD_TABLE_CSS, NEW_TABLE_CSS, 1)
    print("OK Table CSS améliorée (taille + hover + header)")
else:
    print("WARN: Table CSS non trouvé")

# ─── 5. Badges catégorie : taille augmentée ───
OLD_CATBADGE = "    .cat-badge { display:inline-block; font-size:.64rem; font-weight:700; border-radius:5px; padding:2px 8px; white-space:nowrap; }"
NEW_CATBADGE = "    .cat-badge { display:inline-block; font-size:.70rem; font-weight:700; border-radius:5px; padding:3px 9px; white-space:nowrap; }"

if OLD_CATBADGE in content:
    content = content.replace(OLD_CATBADGE, NEW_CATBADGE, 1)
    print("OK Badges catégorie : taille augmentée (.64→.70rem)")
else:
    print("WARN: .cat-badge non trouvé")

# ─── 6. Boutons action : padding + min-height ───
OLD_BTN_ACT = "    .btn-act { font-size:.64rem; padding:3px 8px; border-radius:5px; cursor:pointer; display:inline-flex; align-items:center; gap:3px; font-weight:600; transition:all .15s; border:1px solid; }"
NEW_BTN_ACT = """    /* Boutons action (§2 touch-target-size minimum 30px) */
    .btn-act { font-size:.70rem; padding:5px 10px; border-radius:6px; cursor:pointer; display:inline-flex; align-items:center; gap:4px; font-weight:600; transition:all .15s; border:1px solid; min-height:30px; }"""

if OLD_BTN_ACT in content:
    content = content.replace(OLD_BTN_ACT, NEW_BTN_ACT, 1)
    print("OK Boutons action : taille améliorée")
else:
    print("WARN: .btn-act non trouvé")

# ─── 7. Badges statut réception : taille augmentée + icône ───
OLD_RX = """    /* ── Statut réception ── */
    .rx-ok   { background:#dcfce7; color:#15803d; font-size:.66rem; font-weight:700; border-radius:5px; padding:2px 7px; white-space:nowrap; }
    .rx-part { background:#fef3c7; color:#b45309; font-size:.66rem; font-weight:700; border-radius:5px; padding:2px 7px; white-space:nowrap; }
    .rx-att  { background:#f1f5f9; color:#64748b; font-size:.66rem; font-weight:700; border-radius:5px; padding:2px 7px; white-space:nowrap; }
    .rx-cmd  { background:#ede9fe; color:#6d28d9; font-size:.66rem; font-weight:700; border-radius:5px; padding:2px 7px; white-space:nowrap; }"""

NEW_RX = """    /* ── Statut réception (§6 contrast-readability) ── */
    .rx-ok   { background:#dcfce7; color:#15803d; font-size:.70rem; font-weight:700; border-radius:6px; padding:3px 8px; white-space:nowrap; }
    .rx-part { background:#fef3c7; color:#b45309; font-size:.70rem; font-weight:700; border-radius:6px; padding:3px 8px; white-space:nowrap; }
    .rx-att  { background:#f1f5f9; color:#475569; font-size:.70rem; font-weight:700; border-radius:6px; padding:3px 8px; white-space:nowrap; }
    .rx-cmd  { background:#ede9fe; color:#6d28d9; font-size:.70rem; font-weight:700; border-radius:6px; padding:3px 8px; white-space:nowrap; }"""

if OLD_RX in content:
    content = content.replace(OLD_RX, NEW_RX, 1)
    print("OK Badges statut : taille améliorée + contraste rx-att (#64748b→#475569)")
else:
    print("WARN: Badges statut non trouvés")

# ─── 8. Filtres inline styles → classes + hauteur 32px ───
OLD_FILTER_BAR = """          <div class="no-print" style="display:flex;gap:8px;align-items:center;padding:9px 14px;background:#f8fafc;border-bottom:1px solid #e2e8f0;flex-wrap:wrap;">
            <label style="font-size:.7rem;font-weight:700;color:#4a5568;margin:0"><i class="fas fa-filter me-1"></i>Filtres :</label>
            <select id="fCat" onchange="applyFilters()" style="font-size:.76rem;padding:3px 8px;border:1px solid #d1d5db;border-radius:6px;height:28px">"""

NEW_FILTER_BAR = """          <!-- Barre filtres (§8 touch-target-size 32px minimum) -->
          <div class="no-print" style="display:flex;gap:8px;align-items:center;padding:10px 16px;background:#f8fafc;border-bottom:1px solid #e2e8f0;flex-wrap:wrap;">
            <label style="font-size:.72rem;font-weight:700;color:#374151;margin:0;display:flex;align-items:center;gap:5px;"><i class="fas fa-filter" style="color:#1b3a6b"></i>Filtres :</label>
            <select id="fCat" onchange="applyFilters()" style="font-size:.76rem;padding:4px 10px;border:1px solid #cbd5e1;border-radius:7px;height:32px;background:#fff;color:#374151;cursor:pointer;transition:border-color .15s;">"""

if OLD_FILTER_BAR in content:
    content = content.replace(OLD_FILTER_BAR, NEW_FILTER_BAR, 1)
    print("OK Barre filtres : hauteur 32px, meilleur style")
else:
    print("WARN: Barre filtres non trouvée")

# Améliorer les autres selects et le bouton reset dans la barre filtres
OLD_FSTATUT = """            <select id="fStatut" onchange="applyFilters()" style="font-size:.76rem;padding:3px 8px;border:1px solid #d1d5db;border-radius:6px;height:28px">"""
NEW_FSTATUT = """            <select id="fStatut" onchange="applyFilters()" style="font-size:.76rem;padding:4px 10px;border:1px solid #cbd5e1;border-radius:7px;height:32px;background:#fff;color:#374151;cursor:pointer;">"""
if OLD_FSTATUT in content:
    content = content.replace(OLD_FSTATUT, NEW_FSTATUT, 1)
    print("OK fStatut : hauteur 32px")

OLD_FPAO = """            <select id="fPao" onchange="applyFilters()" style="font-size:.76rem;padding:3px 8px;border:1px solid #d1d5db;border-radius:6px;height:28px">"""
NEW_FPAO = """            <select id="fPao" onchange="applyFilters()" style="font-size:.76rem;padding:4px 10px;border:1px solid #cbd5e1;border-radius:7px;height:32px;background:#fff;color:#374151;cursor:pointer;">"""
if OLD_FPAO in content:
    content = content.replace(OLD_FPAO, NEW_FPAO, 1)
    print("OK fPao : hauteur 32px")

# Remplacer emoji 🔍 par texte + icône Font Awesome (§4 no-emoji-icons)
OLD_SEARCH_INPUT = """            <input type="text" id="fSearch" oninput="applyFilters()" placeholder="🔍 Rechercher…" style="font-size:.76rem;padding:3px 8px;border:1px solid #d1d5db;border-radius:6px;height:28px;min-width:160px;">"""
NEW_SEARCH_INPUT = """            <input type="text" id="fSearch" oninput="applyFilters()" placeholder="Rechercher…" aria-label="Rechercher un produit" style="font-size:.76rem;padding:4px 10px;border:1px solid #cbd5e1;border-radius:7px;height:32px;min-width:160px;background:#fff;color:#374151;">"""
if OLD_SEARCH_INPUT in content:
    content = content.replace(OLD_SEARCH_INPUT, NEW_SEARCH_INPUT, 1)
    print("OK Emoji 🔍 supprimé → aria-label ajouté (§4 no-emoji-icons)")

OLD_RESET_BTN = """            <button onclick="resetFilters()" style="font-size:.72rem;padding:3px 10px;height:28px;border:1px solid #d1d5db;border-radius:6px;background:#fff;color:#64748b;cursor:pointer;">
              <i class="fas fa-times me-1"></i>Réinitialiser
            </button>"""
NEW_RESET_BTN = """            <button onclick="resetFilters()" aria-label="Réinitialiser les filtres" style="font-size:.72rem;padding:4px 12px;height:32px;border:1px solid #cbd5e1;border-radius:7px;background:#fff;color:#475569;cursor:pointer;font-weight:600;transition:all .15s;display:flex;align-items:center;gap:5px;">
              <i class="fas fa-times"></i>Réinitialiser
            </button>"""
if OLD_RESET_BTN in content:
    content = content.replace(OLD_RESET_BTN, NEW_RESET_BTN, 1)
    print("OK Bouton reset : taille + aria-label")

# ─── 9. KPI cards : ajouter icônes de fond ───
OLD_KPI_PREVU = """        <div class="pa-kpi pk-blue">
          <div class="pk-lbl">Budget prévu total</div>
          <div class="pk-val" id="kpiPrevu">0</div>
          <div class="pk-sub">FCFA · PSLSH-032 + 033</div>
        </div>
        <div class="pa-kpi pk-green">
          <div class="pk-lbl">Montant engagé</div>
          <div class="pk-val" id="kpiEngage">0</div>
          <div class="pk-sub">FCFA commandés</div>
        </div>
        <div class="pa-kpi pk-orange">
          <div class="pk-lbl">Montant payé</div>
          <div class="pk-val" id="kpiPaye">0</div>
          <div class="pk-sub">FCFA payés</div>
        </div>
        <div class="pa-kpi pk-red">
          <div class="pk-lbl">Écart non exécuté</div>
          <div class="pk-val" id="kpiEcart">0</div>
          <div class="pk-sub">FCFA restants</div>
        </div>
        <div class="pa-kpi pk-purple">
          <div class="pk-lbl">Taux d'exécution</div>
          <div class="pk-val" id="kpiTaux" style="font-size:.88rem">0%</div>
          <div class="pk-sub" id="kpiNbProd">0 produit</div>
        </div>"""

NEW_KPI_PREVU = """        <div class="pa-kpi pk-blue" title="Budget total prévu pour l'exercice 2026">
          <i class="fas fa-wallet pk-icon"></i>
          <div class="pk-lbl">Budget prévu total</div>
          <div class="pk-val" id="kpiPrevu">0</div>
          <div class="pk-sub">FCFA · PSLSH-032 + 033</div>
        </div>
        <div class="pa-kpi pk-green" title="Montant total engagé (bons de commande émis)">
          <i class="fas fa-file-signature pk-icon"></i>
          <div class="pk-lbl">Montant engagé</div>
          <div class="pk-val" id="kpiEngage">0</div>
          <div class="pk-sub">FCFA commandés</div>
        </div>
        <div class="pa-kpi pk-orange" title="Montant total effectivement payé">
          <i class="fas fa-money-check-alt pk-icon"></i>
          <div class="pk-lbl">Montant payé</div>
          <div class="pk-val" id="kpiPaye">0</div>
          <div class="pk-sub">FCFA payés</div>
        </div>
        <div class="pa-kpi pk-red" title="Écart entre budget prévu et montant payé">
          <i class="fas fa-exclamation-triangle pk-icon"></i>
          <div class="pk-lbl">Écart non exécuté</div>
          <div class="pk-val" id="kpiEcart">0</div>
          <div class="pk-sub">FCFA restants</div>
        </div>
        <div class="pa-kpi pk-purple" title="Taux d'exécution = Payé ÷ Budget prévu × 100">
          <i class="fas fa-chart-pie pk-icon"></i>
          <div class="pk-lbl">Taux d'exécution</div>
          <div class="pk-val" id="kpiTaux" style="font-size:1.0rem">0 %</div>
          <div class="pk-sub" id="kpiNbProd">0 produit</div>
        </div>"""

if OLD_KPI_PREVU in content:
    content = content.replace(OLD_KPI_PREVU, NEW_KPI_PREVU, 1)
    print("OK KPI cards : icônes + titles ajoutés")
else:
    print("WARN: KPI cards HTML non trouvé")

# ─── 10. Tabs : ajouter role=tab + tabindex pour accessibilité ───
OLD_TAB_HTML = """      <div class="pa-tabs">
        <div class="pa-tab active" onclick="switchTab('compte')">
          <i class="fas fa-table me-1"></i>Compte financier
        </div>
        <div class="pa-tab" onclick="switchTab('calendrier')">
          <i class="fas fa-calendar-alt me-1"></i>Calendrier trimestriel
        </div>
        <div class="pa-tab" onclick="switchTab('procedures')">
          <i class="fas fa-clipboard-list me-1"></i>Procédures
        </div>
        <div class="pa-tab" onclick="switchTab('dci')">
          <i class="fas fa-vials me-1"></i>Détail DCI
        </div>
      </div>"""

NEW_TAB_HTML = """      <!-- Tabs navigation (§9 keyboard nav + aria) -->
      <div class="pa-tabs" role="tablist" aria-label="Vues du plan d'achat">
        <div class="pa-tab active" role="tab" aria-selected="true" aria-controls="panel-compte" tabindex="0"
             onclick="switchTab('compte')" onkeydown="if(event.key==='Enter'||event.key===' ')switchTab('compte')">
          <i class="fas fa-table"></i>Compte financier
        </div>
        <div class="pa-tab" role="tab" aria-selected="false" aria-controls="panel-calendrier" tabindex="-1"
             onclick="switchTab('calendrier')" onkeydown="if(event.key==='Enter'||event.key===' ')switchTab('calendrier')">
          <i class="fas fa-calendar-alt"></i>Calendrier trimestriel
        </div>
        <div class="pa-tab" role="tab" aria-selected="false" aria-controls="panel-procedures" tabindex="-1"
             onclick="switchTab('procedures')" onkeydown="if(event.key==='Enter'||event.key===' ')switchTab('procedures')">
          <i class="fas fa-clipboard-list"></i>Procédures
        </div>
        <div class="pa-tab" role="tab" aria-selected="false" aria-controls="panel-dci" tabindex="-1"
             onclick="switchTab('dci')" onkeydown="if(event.key==='Enter'||event.key===' ')switchTab('dci')">
          <i class="fas fa-vials"></i>Détail DCI
        </div>
      </div>"""

if OLD_TAB_HTML in content:
    content = content.replace(OLD_TAB_HTML, NEW_TAB_HTML, 1)
    print("OK Tabs : role=tab + aria-selected + keyboard nav ajoutés")
else:
    print("WARN: Tabs HTML non trouvé")

# ─── 11. switchTab() : mettre à jour aria-selected ───
OLD_SWITCH_TAB = """  function switchTab(name) {
    document.querySelectorAll('.pa-tab').forEach(t => t.classList.remove('active'));
    document.querySelectorAll('.pa-panel').forEach(p => p.classList.remove('active'));
    document.querySelector(\`.pa-tab[onclick*="${name}"]\`).classList.add('active');
    document.getElementById('panel-' + name).classList.add('active');
  }"""

NEW_SWITCH_TAB = """  function switchTab(name) {
    document.querySelectorAll('.pa-tab').forEach(t => {
      t.classList.remove('active');
      t.setAttribute('aria-selected','false');
      t.setAttribute('tabindex','-1');
    });
    document.querySelectorAll('.pa-panel').forEach(p => p.classList.remove('active'));
    const activeTab = document.querySelector('.pa-tab[aria-controls="panel-' + name + '"]');
    if (activeTab) {
      activeTab.classList.add('active');
      activeTab.setAttribute('aria-selected','true');
      activeTab.setAttribute('tabindex','0');
    }
    document.getElementById('panel-' + name).classList.add('active');
  }"""

if OLD_SWITCH_TAB in content:
    content = content.replace(OLD_SWITCH_TAB, NEW_SWITCH_TAB, 1)
    print("OK switchTab() : aria-selected mis à jour dynamiquement")
else:
    print("WARN: switchTab() non trouvé — recherche alternative")
    # Cherche version avec backtick différent
    if "function switchTab(name)" in content:
        print("  → fonction trouvée mais syntaxe différente, skip")

# ─── 12. Bouton "Ajouter un produit" : améliorer style + aria ───
OLD_ADD_BTN = """            <button class="no-print" onclick="openModalAjouter()" style="background:rgba(255,255,255,.15);border:1px solid rgba(255,255,255,.4);color:#fff;border-radius:7px;padding:4px 14px;font-size:.74rem;font-weight:700;cursor:pointer;display:flex;align-items:center;gap:6px;">
              <i class="fas fa-plus"></i> Ajouter un produit
            </button>"""
NEW_ADD_BTN = """            <button class="no-print" onclick="openModalAjouter()" aria-label="Ajouter un nouveau produit"
              style="background:rgba(255,255,255,.18);border:1px solid rgba(255,255,255,.45);color:#fff;border-radius:8px;padding:6px 16px;font-size:.75rem;font-weight:700;cursor:pointer;display:flex;align-items:center;gap:7px;transition:background .15s;min-height:34px;"
              onmouseover="this.style.background='rgba(255,255,255,.28)'"
              onmouseout="this.style.background='rgba(255,255,255,.18)'">
              <i class="fas fa-plus"></i> Ajouter un produit
            </button>"""
if OLD_ADD_BTN in content:
    content = content.replace(OLD_ADD_BTN, NEW_ADD_BTN, 1)
    print("OK Bouton Ajouter : amélioration hover + aria-label")
else:
    print("WARN: Bouton Ajouter non trouvé")

# ─── 13. Ajouter CSS bar sources : hauteur augmentée ───
OLD_SRC_BAR = "    .src-bar-track { flex:2; height:7px; background:#e2e8f0; border-radius:4px; overflow:hidden; }"
NEW_SRC_BAR = "    .src-bar-track { flex:2; height:8px; background:#e2e8f0; border-radius:4px; overflow:hidden; transition:all .2s; }"
if OLD_SRC_BAR in content:
    content = content.replace(OLD_SRC_BAR, NEW_SRC_BAR, 1)
    print("OK Barres sources : hauteur 7→8px + transition")

# ─── 14. Proc badges : taille légèrement augmentée ───
OLD_PROC = """    .proc-bc { background:#eff6ff; color:#1d4ed8; border:1px solid #bfdbfe; padding:2px 8px; border-radius:20px; font-size:.67rem; font-weight:600; white-space:nowrap; }
    .proc-mr { background:#fdf4ff; color:#7e22ce; border:1px solid #ddd6fe; padding:2px 8px; border-radius:20px; font-size:.67rem; font-weight:600; white-space:nowrap; }"""
NEW_PROC = """    .proc-bc { background:#eff6ff; color:#1d4ed8; border:1px solid #bfdbfe; padding:3px 9px; border-radius:20px; font-size:.70rem; font-weight:600; white-space:nowrap; }
    .proc-mr { background:#fdf4ff; color:#7e22ce; border:1px solid #ddd6fe; padding:3px 9px; border-radius:20px; font-size:.70rem; font-weight:600; white-space:nowrap; }"""
if OLD_PROC in content:
    content = content.replace(OLD_PROC, NEW_PROC, 1)
    print("OK Badges procédure : .67→.70rem")

with open('frontend/pages/planification/plan-achat.html', 'w', encoding='utf-8') as f:
    f.write(content)

print()
print("═══════════════════════════════════════════════")
print("  AMÉLIORATIONS UI/UX PRO MAX APPLIQUÉES")
print("═══════════════════════════════════════════════")
print("1. Focus-visible global (§1 Accessibilité)")
print("2. KPI cards : hover lift, gradient top-bar, icônes de fond")
print("3. Valeurs KPI : 0.95→1.05rem, labels .67→.72rem")
print("4. Tabs : animation fadeIn, hover amélioré, aria-selected")
print("5. switchTab() : gestion aria-selected dynamique")
print("6. En-tête bloc : couleur plate → gradient 135°")
print("7. Table : hover #f8fafc→#eff6ff, padding 7→8px, header .66→.69rem")
print("8. Badges cat/statut/proc : .64-.67 → .70rem")
print("9. Filtres : 28px → 32px, style propre, border arrondie")
print("10. Emoji 🔍 supprimé → aria-label")
print("11. Bouton Ajouter : aria-label + hover amélioré")
print("12. Barres sources : 7→8px + transition")
print("13. role=tab + keyboard nav sur chaque tab")
