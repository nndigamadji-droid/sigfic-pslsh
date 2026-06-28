(function (window) {
  'use strict';

  const EXERCICE_ACTIF = 2026;
  const PERIODE_COMPLEMENTAIRE_FIN = '2027-01-31';

  // Segment institutionnel (qui dépense ?)
  // Tchad : Section / Programme / Structure
  // PSLSH : Ministère Santé Publique (02) / Programme Lutte SIDA (07) / Service porteur
  const SEG_INSTITUTIONNEL = {
    section: '02',
    programme: '07',
    structures: {
      SAF:  '01', SGAS: '02', SEB:  '03', SPCG: '04', SPCH: '05',
      SPSAC:'06', SESRO:'07', SC:   '08', APMS: '09', SLNR: '10', COORD:'00',
    },
  };

  // Segment fonctionnel (pourquoi ?)
  // Classification COFOG (Classification of Functions of Government) — Tchad
  const SEG_FONCTIONNEL = {
    administration: '01',
    sante_globale:  '07',
    prevention_vih: '07.4',
    prevention_hep: '07.5',
    prevention_ist: '07.6',
    recherche:      '07.8',
  };

  // Rubrique → fonction COFOG par défaut
  const RUBRIQUE_FONCTION = {
    DF: 'administration', DI: 'administration', DM: 'sante_globale',
  };

  // Mapping rubrique → famille SYSCOHADA dominante (fallback si pas classifié)
  const RUBRIQUE_OHADA = {
    DF: { code:'6064', libelle:'Fournitures administratives', type:'charge' },
    DI: { code:'2184', libelle:'Mobilier et matériel de bureau', type:'immo'  },
    DM: { code:'60211',libelle:'Médicaments', type:'stock' },
  };

  // ---------- AUDIT LOG ----------
  const AUDIT_KEY = 'pslsh_budget_audit_v1';

  function readAudit() {
    try { return JSON.parse(localStorage.getItem(AUDIT_KEY) || '[]'); }
    catch (_) { return []; }
  }

  function logAudit(action, payload) {
    const log = readAudit();
    log.push({
      ts: new Date().toISOString(),
      utilisateur: getCurrentUser(),
      action, payload,
    });
    localStorage.setItem(AUDIT_KEY, JSON.stringify(log));
  }

  function getCurrentUser() {
    try {
      const u = JSON.parse(localStorage.getItem('pslsh_user') || 'null');
      return (u && (u.email || u.nom)) || 'admin@pslsh.org';
    } catch (_) { return 'admin@pslsh.org'; }
  }

  // ---------- CLÉ BUDGÉTAIRE ----------
  function buildKey(seg) {
    const sec = (seg && seg.institutionnel) || `${SEG_INSTITUTIONNEL.section}-${SEG_INSTITUTIONNEL.programme}-00`;
    const fct = (seg && seg.fonctionnel)   || '01';
    const eco = (seg && seg.economique)    || '6064';
    return `${sec}/${fct}/${eco}`;
  }

  function deriveSegments(ligne) {
    const structCode = SEG_INSTITUTIONNEL.structures[ligne.service] || '00';
    const institutionnel =
      `${SEG_INSTITUTIONNEL.section}-${SEG_INSTITUTIONNEL.programme}-${structCode}`;
    const fonctionKey = RUBRIQUE_FONCTION[ligne.rubrique] || 'administration';
    const fonctionnel = SEG_FONCTIONNEL[fonctionKey] || '01';
    const ohada = mapToOhada(ligne);
    return { institutionnel, fonctionnel, economique: ohada.code };
  }

  function mapToOhada(ligne) {
    if (window.SYSCOHADA && ligne.libelle) {
      const cat = window.SYSCOHADA.classify(ligne.libelle);
      if (cat && cat.code !== '?') {
        return { code: cat.code, libelle: cat.libelle, type: cat.type };
      }
    }
    return RUBRIQUE_OHADA[ligne.rubrique] || RUBRIQUE_OHADA.DF;
  }

  // ---------- ENRICHISSEMENT ----------
  function enrichLigne(ligne) {
    const seg = deriveSegments(ligne);
    const ohada = mapToOhada(ligne);
    return Object.assign({}, ligne, {
      seg_institutionnel: ligne.seg_institutionnel || seg.institutionnel,
      seg_fonctionnel:    ligne.seg_fonctionnel    || seg.fonctionnel,
      seg_economique:     ligne.seg_economique     || seg.economique,
      compte_ohada:       ligne.compte_ohada       || ohada.code,
      compte_ohada_lib:   ligne.compte_ohada_lib   || ohada.libelle,
      compte_ohada_type:  ligne.compte_ohada_type  || ohada.type,
      cle_budgetaire:     buildKey(seg),
      exercice:           ligne.exercice           || EXERCICE_ACTIF,
    });
  }

  function enrichAll(lignes) {
    return (lignes || []).map(enrichLigne);
  }

  // ---------- CALCULS ----------
  function disponible(ligne) {
    const credit = +ligne.revise || +ligne.montant || 0;
    const eng = +ligne.engage || 0;
    return Math.max(0, credit - eng);
  }

  function tauxExec(ligne) {
    const c = +ligne.revise || +ligne.montant || 0;
    return c > 0 ? Math.round(((+ligne.paye || 0) / c) * 100) : 0;
  }

  function tauxEng(ligne) {
    const c = +ligne.revise || +ligne.montant || 0;
    return c > 0 ? Math.round(((+ligne.engage || 0) / c) * 100) : 0;
  }

  function etatLigne(ligne) {
    const t = tauxEng(ligne);
    if (t > 100) return { code:'depassement', label:'Dépassement', color:'#b91c1c', bg:'#fee2e2' };
    if (t >= 90) return { code:'alerte',      label:'Alerte (>90%)', color:'#b45309', bg:'#fef3c7' };
    if (t >= 50) return { code:'engage',      label:'Engagé moyen',  color:'#0e7490', bg:'#cffafe' };
    return            { code:'disponible', label:'Disponible',    color:'#15803d', bg:'#dcfce7' };
  }

  // ---------- HARD CHECK ----------
  function canEngager(ligne, montant) {
    const m = +montant || 0;
    if (m <= 0) return { ok:false, raison:'Montant invalide ou nul.' };
    const dispo = disponible(ligne);
    if (m > dispo) {
      return {
        ok: false,
        raison: `Crédit insuffisant. Disponible : ${fmt(dispo)} FCFA. Demandé : ${fmt(m)} FCFA. Dépassement : ${fmt(m - dispo)} FCFA.`,
        depassement: m - dispo,
      };
    }
    if (ligne.statut === 'Clôturé' || ligne.statut === 'Verrouillé') {
      return { ok:false, raison:`Ligne ${ligne.code} est en statut ${ligne.statut}.` };
    }
    return { ok:true };
  }

  function engager(ligne, montant, refDossier) {
    const check = canEngager(ligne, montant);
    if (!check.ok) return check;
    ligne.engage = (+ligne.engage || 0) + (+montant || 0);
    logAudit('engagement', {
      ligne: ligne.code, montant:+montant, dossier:refDossier || null,
      avant: ligne.engage - +montant, apres: ligne.engage,
    });
    return { ok:true, ligne };
  }

  function virementCredit(ligneSource, ligneDest, montant, motif) {
    const m = +montant || 0;
    if (m <= 0) return { ok:false, raison:'Montant de virement invalide.' };
    const dispoSrc = disponible(ligneSource);
    if (m > dispoSrc) {
      return { ok:false, raison:`Crédit source insuffisant (${fmt(dispoSrc)} disponible).` };
    }
    ligneSource.revise = (+ligneSource.revise || 0) - m;
    ligneDest.revise   = (+ligneDest.revise   || 0) + m;
    ligneSource.statut = 'Révisé';
    ligneDest.statut   = 'Révisé';
    logAudit('virement_credit', {
      source: ligneSource.code, dest: ligneDest.code, montant: m, motif: motif || '',
    });
    return { ok:true };
  }

  // ---------- ANNUALITÉ ----------
  function statutExercice(dateISO) {
    const d = dateISO ? new Date(dateISO) : new Date();
    const annee = d.getFullYear();
    const isoStr = d.toISOString().slice(0, 10);
    if (annee === EXERCICE_ACTIF) {
      return { ouvert:true, exercice:EXERCICE_ACTIF, periode:'principale', message:`Exercice ${EXERCICE_ACTIF} ouvert.` };
    }
    if (annee === EXERCICE_ACTIF + 1 && isoStr <= PERIODE_COMPLEMENTAIRE_FIN) {
      return {
        ouvert: true, exercice: EXERCICE_ACTIF, periode: 'complementaire',
        message: `Période complémentaire active jusqu'au ${PERIODE_COMPLEMENTAIRE_FIN} — uniquement liquidation / ordonnancement des engagements antérieurs au 31/12/${EXERCICE_ACTIF}.`,
      };
    }
    return {
      ouvert: false, exercice: EXERCICE_ACTIF, periode: 'fermee',
      message: `Exercice ${EXERCICE_ACTIF} clos. Toute imputation est interdite.`,
    };
  }

  // ---------- ÉCRITURES OHADA ----------
  function ecritureDepense(ligne, montant, refDossier) {
    const ohada = ligne.compte_ohada || mapToOhada(ligne).code;
    return {
      journal: 'JA',
      date: new Date().toISOString().slice(0, 10),
      reference: refDossier || `ENG-${ligne.code}`,
      libelle: `Engagement ${ligne.libelle}`,
      debit:  [{ compte: ohada,  montant:+montant }],
      credit: [{ compte: '4011', montant:+montant }],
    };
  }

  function ecritureRecette(source, montant, refPiece) {
    const ohada = source.compte_ohada || '7011';
    return {
      journal: 'JV',
      date: new Date().toISOString().slice(0, 10),
      reference: refPiece || `REC-${source.code}`,
      libelle: `Recette ${source.libelle}`,
      debit:  [{ compte: '4111', montant:+montant }],
      credit: [{ compte: ohada,  montant:+montant }],
    };
  }

  // ---------- KPI CONFORMITÉ ----------
  function conformiteKpis(lignes) {
    const enr = enrichAll(lignes);
    const total = enr.length;
    return {
      total,
      mappes: enr.filter((l) => l.compte_ohada && l.compte_ohada !== '?').length,
      depassement: enr.filter((l) => tauxEng(l) > 100).length,
      alerte:      enr.filter((l) => tauxEng(l) >= 90 && tauxEng(l) <= 100).length,
      verrouillees: enr.filter((l) => l.statut === 'Verrouillé' || l.statut === 'Clôturé').length,
      revisees:     enr.filter((l) => l.statut === 'Révisé').length,
      exercice: statutExercice(),
    };
  }

  function fmt(n) { return Math.round(n || 0).toLocaleString('fr-FR'); }

  // ---------- MAPPING T_Budget_Compta_Mapping (API) ----------
  let _mappingCache = null;

  async function loadMapping() {
    if (_mappingCache) return _mappingCache;
    try {
      const token = localStorage.getItem('pslsh_token');
      const res = await fetch(`${window.BASE_URL}/mapping`, {
        headers: { Authorization: 'Bearer ' + token },
      });
      const body = await res.json();
      if (body && body.success) {
        _mappingCache = {};
        body.data.forEach((m) => { _mappingCache[m.code_ligne_budget] = m; });
        return _mappingCache;
      }
    } catch (_) {}
    return {};
  }

  function clearMappingCache() { _mappingCache = null; }

  async function mappingFor(codeLigneBudget) {
    const map = await loadMapping();
    return map[codeLigneBudget] || null;
  }

  async function bulkSyncMapping(lignes) {
    const items = enrichAll(lignes).map((l) => ({
      code_ligne_budget: l.cle_budgetaire,
      compte_syscohada:  l.compte_ohada,
      compte_libelle:    l.compte_ohada_lib,
      sens_flux:         l.compte_ohada && l.compte_ohada.startsWith('7') ? 'C' : 'D',
      source:            'auto-classifier',
      derive_score:      0,
    }));
    try {
      const token = localStorage.getItem('pslsh_token');
      const res = await fetch(`${window.BASE_URL}/mapping/bulk`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + token },
        body: JSON.stringify({ items }),
      });
      const body = await res.json();
      _mappingCache = null;
      return body;
    } catch (e) {
      return { success:false, error:e.message };
    }
  }

  window.BUDGET = {
    EXERCICE_ACTIF, PERIODE_COMPLEMENTAIRE_FIN,
    SEG_INSTITUTIONNEL, SEG_FONCTIONNEL, RUBRIQUE_OHADA,
    enrichLigne, enrichAll, deriveSegments, mapToOhada, buildKey,
    disponible, tauxExec, tauxEng, etatLigne,
    canEngager, engager, virementCredit,
    statutExercice, ecritureDepense, ecritureRecette,
    conformiteKpis, readAudit, logAudit, getCurrentUser, fmt,
    loadMapping, clearMappingCache, mappingFor, bulkSyncMapping,
  };
})(window);
