path = r'C:\Users\HP\Desktop\pslsh-app\frontend\pages\planification\plan-achat.html'
with open(path, 'r', encoding='utf-8') as f:
    content = f.read()

# ═══════════════════════════════════════════════════════════════
# 1. Restaurer la clé localStorage v1 (vos vraies données)
# ═══════════════════════════════════════════════════════════════
content = content.replace("'pslsh_plan_achat_v2'", "'pslsh_plan_achat_v1'", 10)
print("OK localStorage key restauré -> v1")

# ═══════════════════════════════════════════════════════════════
# 2. Restaurer les 21 items originaux EXACTEMENT
#    (données financières originales — rien ne change sauf le cat
#     pour les items mal classés)
#    On restaure avec les BONS cat dès le départ pour les items
#    qui étaient déjà corrects. La fonction normalizeCategories()
#    (ajoutée ci-dessous) s'occupera des items ajoutés par
#    l'utilisateur en localStorage (AZT, TDF, Spiruline, CPA…)
# ═══════════════════════════════════════════════════════════════
NEW_PRODUITS = """  let PRODUITS = [

    /* ══ RÉACTIFS DÉPISTAGE VIH  (PSLSH-032) ════════════════════ */
    { id:1,  cat:'Réactifs dépistage VIH',       dci:'HIV 1+2 Determine (tests rapides — 1ère détection)', dosage:'1ère détection', unite:'Boîte 100 tests',    qte:2000, prix_u:55000,  pao:'PSLSH-032', T1:600, T2:500, T3:500, T4:400, engage:97350000,  paye:88000000,  procedure:'MR', statut:'Partiellement reçu', fourn:'Abbott / Import.' },
    { id:2,  cat:'Réactifs dépistage VIH',       dci:'HIV 1+2 SD Bioline (tests de confirmation)',         dosage:'Confirmation',   unite:'Boîte 25 tests',     qte:3000, prix_u:32000,  pao:'PSLSH-032', T1:900, T2:750, T3:750, T4:600, engage:86400000,  paye:86400000,  procedure:'MR', statut:'Reçu',               fourn:'SD Biosensor' },
    { id:3,  cat:'Réactifs dépistage VIH',       dci:'STAT-PAK HIV (tests de départage)',                  dosage:'Départage',      unite:'Boîte 30 tests',     qte:1500, prix_u:28000,  pao:'PSLSH-032', T1:450, T2:375, T3:375, T4:300, engage:37800000,  paye:37800000,  procedure:'MR', statut:'Reçu',               fourn:'Chembio' },

    /* ══ RÉACTIFS CHARGE VIRALE VIH  (PSLSH-032) ════════════════ */
    { id:4,  cat:'Réactifs charge virale VIH',   dci:'Cartouches COBAS VIH Qual/Quant (Roche)',            dosage:'Charge virale',  unite:'Boîte 24 cartouches',qte:1200, prix_u:185000, pao:'PSLSH-032', T1:360, T2:300, T3:300, T4:240, engage:199800000, paye:133200000, procedure:'MR', statut:'Partiellement reçu', fourn:'Roche Import.' },
    { id:5,  cat:'Réactifs charge virale VIH',   dci:'Cartouches GeneXpert HIV Quant',                     dosage:'GX Quant VIH',   unite:'Boîte 10 cartouches',qte:800,  prix_u:125000, pao:'PSLSH-032', T1:240, T2:200, T3:200, T4:160, engage:90000000,  paye:60000000,  procedure:'MR', statut:'Partiellement reçu', fourn:'Cepheid Import.' },

    /* ══ RÉACTIFS HÉPATITES & SYPHILIS  (PSLSH-033) ════════════ */
    { id:6,  cat:'Réactifs hépatites & syphilis',dci:'HBsAg SD Bioline (tests rapides)',                   dosage:'HBs dépistage',  unite:'Boîte 25 tests',     qte:2500, prix_u:18000,  pao:'PSLSH-033', T1:750, T2:625, T3:625, T4:500, engage:40500000,  paye:40500000,  procedure:'MR', statut:'Reçu',               fourn:'SD Biosensor' },
    { id:7,  cat:'Réactifs hépatites & syphilis',dci:'Anti-HCV Determine (tests rapides)',                 dosage:'HCV dépistage',  unite:'Boîte 100 tests',    qte:1500, prix_u:52000,  pao:'PSLSH-033', T1:450, T2:375, T3:375, T4:300, engage:70200000,  paye:58500000,  procedure:'MR', statut:'Partiellement reçu', fourn:'Abbott' },
    { id:8,  cat:'Réactifs hépatites & syphilis',dci:'Tests RPR syphilis (boîtes 100)',                    dosage:'RPR',            unite:'Boîte 100 tests',    qte:1000, prix_u:14500,  pao:'PSLSH-033', T1:300, T2:250, T3:250, T4:200, engage:13050000,  paye:13050000,  procedure:'MR', statut:'Reçu',               fourn:'Import.' },
    { id:9,  cat:'Réactifs hépatites & syphilis',dci:'SD Bioline Syphilis 3.0',                            dosage:'TPHA',           unite:'Boîte 25 tests',     qte:1200, prix_u:22000,  pao:'PSLSH-033', T1:360, T2:300, T3:300, T4:240, engage:23760000,  paye:23760000,  procedure:'MR', statut:'Reçu',               fourn:'SD Biosensor' },

    /* ══ CHARGE VIRALE HÉPATITES  (PSLSH-033) ══════════════════ */
    { id:10, cat:'Charge virale hépatites',      dci:'Cartouches GeneXpert HBV – Xpert HBV Viral Load',   dosage:'GX HBV VL',      unite:'Boîte 10 tests',     qte:400,  prix_u:95000,  pao:'PSLSH-033', T1:120, T2:100, T3:100, T4:80,  engage:13680000,  paye:10260000,  procedure:'MR', statut:'Partiellement reçu', fourn:'Cepheid Import.' },
    { id:11, cat:'Charge virale hépatites',      dci:'Réactifs PCR HBV quantitatif (charge virale)',       dosage:'PCR HBV Quant.', unite:'Kit 96 réactions',   qte:200,  prix_u:185000, pao:'PSLSH-033', T1:60,  T2:50,  T3:50,  T4:40,  engage:12580000,  paye:9435000,   procedure:'MR', statut:'Partiellement reçu', fourn:'Roche Diagnostics' },
    { id:12, cat:'Charge virale hépatites',      dci:'Réactifs PCR HCV quantitatif (charge virale)',       dosage:'PCR HCV Quant.', unite:'Kit 96 réactions',   qte:180,  prix_u:180000, pao:'PSLSH-033', T1:54,  T2:45,  T3:45,  T4:36,  engage:11610000,  paye:8707500,   procedure:'MR', statut:'Partiellement reçu', fourn:'Roche Diagnostics' },

    /* ══ SÉROLOGIE HÉPATITES  (PSLSH-033) ══════════════════════ */
    { id:13, cat:'Sérologie hépatites',          dci:'Tests rapides HBsAg (dépistage terrain)',            dosage:'HBsAg rapide',   unite:'Boîte 25 tests',     qte:2000, prix_u:8500,   pao:'PSLSH-033', T1:600, T2:500, T3:500, T4:400, engage:17000000,  paye:17000000,  procedure:'BC', statut:'Reçu',               fourn:'SD Biosensor / CPA' },
    { id:14, cat:'Sérologie hépatites',          dci:'Kits ELISA Hépatite B (HBsAg + Anti-HBc)',          dosage:'ELISA HBV',      unite:'Kit 96 puits',       qte:300,  prix_u:42000,  pao:'PSLSH-033', T1:90,  T2:75,  T3:75,  T4:60,  engage:12600000,  paye:12600000,  procedure:'MR', statut:'Reçu',               fourn:'Biorad / DiaSorin' },
    { id:15, cat:'Sérologie hépatites',          dci:'Tests rapides anti-HCV (dépistage communautaire)',   dosage:'Anti-HCV rapide',unite:'Boîte 25 tests',     qte:1500, prix_u:12000,  pao:'PSLSH-033', T1:450, T2:375, T3:375, T4:300, engage:18000000,  paye:18000000,  procedure:'BC', statut:'Reçu',               fourn:'SD Biosensor' },
    { id:16, cat:'Sérologie hépatites',          dci:'Kits ELISA anti-HCV — sérologie totale',            dosage:'ELISA HCV',      unite:'Kit 96 puits',       qte:250,  prix_u:38000,  pao:'PSLSH-033', T1:75,  T2:62,  T3:63,  T4:50,  engage:9500000,   paye:9500000,   procedure:'MR', statut:'Reçu',               fourn:'Biorad / DiaSorin' },

    /* ══ RÉACTIFS IST — VRAIS TESTS IST UNIQUEMENT  (PSLSH-033) */
    { id:17, cat:'Réactifs IST',                 dci:'Tests rapides syphilis — TP Rapid Test',             dosage:'Syphilis RDT',   unite:'Boîte 25 tests',     qte:1200, prix_u:9000,   pao:'PSLSH-033', T1:360, T2:300, T3:300, T4:240, engage:10800000,  paye:10800000,  procedure:'BC', statut:'Reçu',               fourn:'SD Biosensor' },
    { id:18, cat:'Réactifs IST',                 dci:'TPHA — Treponema pallidum Hemaggl. Assay',           dosage:'TPHA',           unite:'Kit 200 tests',      qte:800,  prix_u:18000,  pao:'PSLSH-033', T1:240, T2:200, T3:200, T4:160, engage:14400000,  paye:14400000,  procedure:'BC', statut:'Reçu',               fourn:'Omega Diagnostics' },
    { id:19, cat:'Réactifs IST',                 dci:'VDRL — Venereal Disease Research Laboratory',        dosage:'VDRL',           unite:'Kit 500 tests',      qte:500,  prix_u:15000,  pao:'PSLSH-033', T1:150, T2:125, T3:125, T4:100, engage:7500000,   paye:7500000,   procedure:'BC', statut:'Reçu',               fourn:'Omega / Import.' },
    { id:20, cat:'Réactifs IST',                 dci:'Tests combinés VIH/Syphilis Dual RDT',               dosage:'VIH + Syphilis', unite:'Boîte 25 tests',     qte:1500, prix_u:22000,  pao:'PSLSH-033', T1:450, T2:375, T3:375, T4:300, engage:23100000,  paye:19800000,  procedure:'BC', statut:'Partiellement reçu', fourn:'SD Biosensor' },
    { id:21, cat:'Réactifs IST',                 dci:'GeneXpert CT/NG — gonocoque & chlamydia',            dosage:'CT/NG GX',       unite:'Boîte 10 tests',     qte:300,  prix_u:125000, pao:'PSLSH-033', T1:90,  T2:75,  T3:75,  T4:60,  engage:11250000,  paye:0,         procedure:'MR', statut:'En attente',         fourn:'Cepheid · Appel offres' },
  ];"""

start = content.find('  let PRODUITS = [')
end   = content.find('\n  ];', start) + len('\n  ];')
content = content[:start] + NEW_PRODUITS + content[end:]
print("OK PRODUITS originaux restaurés (21 items, données financières intactes)")

# ═══════════════════════════════════════════════════════════════
# 3. _nextId restauré à 22
# ═══════════════════════════════════════════════════════════════
for old in ['  let _nextId = 21;', '  let _nextId = 33;']:
    content = content.replace(old, '  let _nextId = 22;', 1)
print("OK _nextId = 22")

# ═══════════════════════════════════════════════════════════════
# 4. Ajouter normalizeCategories() — corrige le cat des items
#    ajoutés par l'utilisateur (AZT, TDF, Spiruline, CPA…)
#    sans jamais toucher aux montants financiers
# ═══════════════════════════════════════════════════════════════
NORMALIZE_FN = """
  /* ═══════════════════════════════════════════════════════════════
     NORMALISATION DES CATÉGORIES
     Corrige automatiquement le champ cat selon la DCI :
     - ARV/médicaments → 'Médicaments ARV'
     - Spiruline/nutrition → 'Intrants nutritionnels'
     - CPA/redevance → 'Frais logistiques et institutionnels'
     Les réactifs diagnostiques restent dans leurs catégories.
     ⚠ NE modifie JAMAIS les données financières.
  ═══════════════════════════════════════════════════════════════ */
  function normalizeCategories(data) {
    const ARV = ['arv','dolutegravir','tenofovir','lamivudine','zidovudine','azt',
                 'nevirapine','nvp','lopinavir','ritonavir','abacavir','efavirenz',
                 'dtg','tdf','lpv/r','3tc','abc/','médicament arv','medicament arv',
                 'antirétroviral','antiretroviral'];
    const NUTRI = ['spiruline','plumpy','rutf','multivitamine','nutrition','intrant'];
    const FRAIS = ['redevance cpa','redevance','frais cpa','cpa 20','forfait cpa',
                   'allocation cpa','logistique','institutionnel'];
    data.forEach(p => {
      const d = (p.dci || '').toLowerCase();
      if (ARV.some(k  => d.includes(k)))  { p.cat = 'Médicaments ARV'; return; }
      if (NUTRI.some(k => d.includes(k))) { p.cat = 'Intrants nutritionnels'; return; }
      if (FRAIS.some(k => d.includes(k))) { p.cat = 'Frais logistiques et institutionnels'; return; }
    });
    return data;
  }

"""

# Insérer avant la fonction loadPlanAchat / localStorage init
# (juste avant le bloc STOCKAGE localStorage)
insert_before = "  /* ═══════════════════════════════════════════════════════════════\n     STOCKAGE localStorage"
if insert_before in content:
    content = content.replace(insert_before, NORMALIZE_FN + insert_before, 1)
    print("OK normalizeCategories() insérée")
else:
    # Fallback: insérer avant le bloc HELPERS
    insert_before2 = "  /* ═══════════════════════════════════════════════════════════════\n     HELPERS"
    content = content.replace(insert_before2, NORMALIZE_FN + insert_before2, 1)
    print("OK normalizeCategories() insérée (fallback)")

# ═══════════════════════════════════════════════════════════════
# 5. Appeler normalizeCategories() dans le bloc de chargement
#    localStorage ET sur les PRODUITS par défaut
# ═══════════════════════════════════════════════════════════════
OLD_LOAD = """  (function() {
    const raw = localStorage.getItem(PA_STORAGE_KEY);
    if (raw) {
      try {
        const s = JSON.parse(raw);
        if (s && Array.isArray(s.data) && s.data.length) {
          PRODUITS = s.data;
          _nextId  = s._nextId || (Math.max(...PRODUITS.map(p => p.id)) + 1);
        }
      } catch(e) {}
    }
  })();"""

NEW_LOAD = """  (function() {
    const raw = localStorage.getItem(PA_STORAGE_KEY);
    if (raw) {
      try {
        const s = JSON.parse(raw);
        if (s && Array.isArray(s.data) && s.data.length) {
          PRODUITS = normalizeCategories(s.data);
          _nextId  = s._nextId || (Math.max(...PRODUITS.map(p => p.id)) + 1);
        }
      } catch(e) {}
    } else {
      normalizeCategories(PRODUITS);
    }
  })();"""

if OLD_LOAD in content:
    content = content.replace(OLD_LOAD, NEW_LOAD, 1)
    print("OK chargement localStorage mis à jour")
else:
    print("ATTENTION: bloc localStorage non trouvé — vérifier manuellement")

# ═══════════════════════════════════════════════════════════════
# 6. CAT_CLS — toutes les catégories (originales + nouvelles)
# ═══════════════════════════════════════════════════════════════
old_cls_start = content.find('  const CAT_CLS = {')
old_cls_end   = content.find('\n  };', old_cls_start) + len('\n  };')
NEW_CAT_CLS = """  const CAT_CLS = {
    /* Réactifs diagnostiques — catégories originales */
    'Réactifs dépistage VIH':        'cat-react-vih',
    'Réactifs charge virale VIH':    'cat-cv-vih',
    'Réactifs hépatites & syphilis': 'cat-react-hep',
    'Charge virale hépatites':       'cat-cv-hep',
    'Sérologie hépatites':           'cat-sero-hep',
    'Réactifs IST':                  'cat-ist',
    /* Nouvelles catégories correctement classées */
    'Médicaments ARV':                       'cat-arv',
    'Médicaments Ios':                       'cat-ios',
    'Intrants nutritionnels':               'cat-intrants',
    'Frais logistiques et institutionnels': 'cat-institutionnel',
  };"""
if old_cls_start >= 0:
    content = content[:old_cls_start] + NEW_CAT_CLS + content[old_cls_end:]
    print("OK CAT_CLS mis à jour")

# ═══════════════════════════════════════════════════════════════
# 7. CSS badges — ajouter cat-ios et cat-institutionnel si absents
# ═══════════════════════════════════════════════════════════════
if 'cat-ios' not in content:
    content = content.replace(
        '    .cat-ist        { background:#e8f5e9; color:#1b5e20; }',
        '    .cat-ist        { background:#e8f5e9; color:#1b5e20; }\n    .cat-arv           { background:#ede9fe; color:#5b21b6; }\n    .cat-ios           { background:#fef3c7; color:#92400e; }\n    .cat-intrants      { background:#d1fae5; color:#065f46; }\n    .cat-institutionnel{ background:#f1f5f9; color:#334155; }',
        1)
print("OK CSS badges présents")

# ═══════════════════════════════════════════════════════════════
# 8. Filtres — options catégories (filtre + modals Ajouter/Modifier)
# ═══════════════════════════════════════════════════════════════
NEW_CAT_OPTS_FILTER = """              <option value="">Toutes catégories</option>
              <optgroup label="Réactifs — VIH">
                <option value="Réactifs dépistage VIH">Réactifs dépistage VIH</option>
                <option value="Réactifs charge virale VIH">Réactifs charge virale VIH</option>
              </optgroup>
              <optgroup label="Réactifs — Hépatites">
                <option value="Réactifs hépatites &amp; syphilis">Réactifs hépatites &amp; syphilis</option>
                <option value="Charge virale hépatites">Charge virale hépatites</option>
                <option value="Sérologie hépatites">Sérologie hépatites</option>
              </optgroup>
              <optgroup label="Réactifs — IST">
                <option value="Réactifs IST">Réactifs IST</option>
              </optgroup>
              <optgroup label="Médicaments">
                <option value="Médicaments ARV">Médicaments ARV</option>
                <option value="Médicaments Ios">Médicaments Ios</option>
              </optgroup>
              <optgroup label="Intrants &amp; Frais">
                <option value="Intrants nutritionnels">Intrants nutritionnels</option>
                <option value="Frais logistiques et institutionnels">Frais logistiques et institutionnels</option>
              </optgroup>"""

NEW_CAT_OPTS_MODAL = """              <option value="">Sélectionner...</option>
              <optgroup label="Réactifs — VIH">
                <option value="Réactifs dépistage VIH">Réactifs dépistage VIH</option>
                <option value="Réactifs charge virale VIH">Réactifs charge virale VIH</option>
              </optgroup>
              <optgroup label="Réactifs — Hépatites">
                <option value="Réactifs hépatites &amp; syphilis">Réactifs hépatites &amp; syphilis</option>
                <option value="Charge virale hépatites">Charge virale hépatites</option>
                <option value="Sérologie hépatites">Sérologie hépatites</option>
              </optgroup>
              <optgroup label="Réactifs — IST">
                <option value="Réactifs IST">Réactifs IST</option>
              </optgroup>
              <optgroup label="Médicaments">
                <option value="Médicaments ARV">Médicaments ARV</option>
                <option value="Médicaments Ios">Médicaments Ios</option>
              </optgroup>
              <optgroup label="Intrants &amp; Frais">
                <option value="Intrants nutritionnels">Intrants nutritionnels</option>
                <option value="Frais logistiques et institutionnels">Frais logistiques et institutionnels</option>
              </optgroup>"""

import re as re2

# Filtre fCat
pat = re2.compile(r'(<select id="fCat"[^>]+>)\s*.*?</select>', re2.DOTALL)
m = pat.search(content)
if m:
    content = content[:m.start()] + m.group(1) + '\n' + NEW_CAT_OPTS_FILTER + '\n            </select>' + content[m.end():]
    print("OK filtre fCat mis à jour")

# Modal aCat
pat2 = re2.compile(r'(<select class="form-select form-select-sm" id="aCat">)\s*.*?</select>', re2.DOTALL)
m = pat2.search(content)
if m:
    content = content[:m.start()] + m.group(1) + '\n' + NEW_CAT_OPTS_MODAL + '\n            </select>' + content[m.end():]
    print("OK modal aCat mis à jour")

# Modal mCat
pat3 = re2.compile(r'(<select class="form-select form-select-sm" id="mCat">)\s*.*?</select>', re2.DOTALL)
m = pat3.search(content)
if m:
    content = content[:m.start()] + m.group(1) + '\n' + NEW_CAT_OPTS_MODAL + '\n            </select>' + content[m.end():]
    print("OK modal mCat mis à jour")

# ═══════════════════════════════════════════════════════════════
# 9. Titres (restaurer le libellé correct)
# ═══════════════════════════════════════════════════════════════
content = content.replace(
    'Compte financier — intrants, médicaments &amp; réactifs 2026',
    'Compte financier : réactifs &amp; consommables médicaux 2026', 1)
content = content.replace(
    "COMPTE FINANCIER : INTRANTS, MÉDICAMENTS & RÉACTIFS 2026",
    "COMPTE FINANCIER : RÉACTIFS & CONSOMMABLES MÉDICAUX 2026", 1)
content = content.replace(
    "Sources de financement — Plan d'achat intrants & médicaments 2026",
    "Sources de financement — Plan d'achat 2026", 1)
print("OK titres restaurés")

# ═══════════════════════════════════════════════════════════════
# Sauvegarde
# ═══════════════════════════════════════════════════════════════
with open(path, 'w', encoding='utf-8') as f:
    f.write(content)
print("\nFichier sauvegarde avec succes.")
