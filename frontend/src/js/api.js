// ══════════════════════════════════════════════════════════════════════════════
// SIGFIC-PSLSH — Client API
// ══════════════════════════════════════════════════════════════════════════════
//
// CONFIGURATION CENTRALE — un seul endroit à modifier selon l'environnement :
//   Développement : http://localhost:3000
//   Production    : https://api.sigfic-pslsh.td
//
const BACKEND_URL = 'http://localhost:3000';
const BASE_URL = `${BACKEND_URL}/api/v1`;
const API_TIMEOUT = 15000; // 15 secondes

// ── Token & session ───────────────────────────────────────────────────────────
function getToken() {
  return localStorage.getItem('pslsh_token');
}
function setToken(t) {
  localStorage.setItem('pslsh_token', t);
}
function removeToken() {
  localStorage.removeItem('pslsh_token');
}

function getUser() {
  try {
    return JSON.parse(localStorage.getItem('pslsh_user') || 'null');
  } catch {
    return null;
  }
}
function setUser(u) {
  localStorage.setItem('pslsh_user', JSON.stringify(u));
}
function removeUser() {
  localStorage.removeItem('pslsh_user');
}

// ── Redirect URL persistence (survives navigation to login) ───────────────────
function saveRedirectUrl(url) {
  if (url && !url.includes('/auth/login')) {
    sessionStorage.setItem('pslsh_redirect_after_login', url);
  }
}
function getRedirectUrl() {
  return sessionStorage.getItem('pslsh_redirect_after_login') || null;
}
function clearRedirectUrl() {
  sessionStorage.removeItem('pslsh_redirect_after_login');
}

// ── Server-side session verification ─────────────────────────────────────────
async function verifySession() {
  if (!getToken()) return false;
  try {
    await fetch(`${BASE_URL}/auth/me`, {
      method: 'GET',
      headers: { Authorization: `Bearer ${getToken()}`, 'Content-Type': 'application/json' },
      signal: AbortSignal.timeout(5000),
    }).then((r) => {
      if (r.status === 401) {
        removeToken();
        removeUser();
        return false;
      }
      return r.ok;
    });
    return !!getToken();
  } catch {
    // Network error — keep token, assume valid (offline/server down)
    return !!getToken();
  }
}

// ── Requête HTTP centrale ─────────────────────────────────────────────────────
async function request(method, path, body, isForm) {
  const headers = {};
  const token = getToken();
  if (token) headers['Authorization'] = `Bearer ${token}`;
  if (!isForm) headers['Content-Type'] = 'application/json';

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), API_TIMEOUT);

  try {
    const opts = { method, headers, signal: controller.signal };
    if (body) opts.body = isForm ? body : JSON.stringify(body);

    const res = await fetch(BASE_URL + path, opts);
    clearTimeout(timer);

    if (res.status === 401) {
      removeToken();
      removeUser();
      saveRedirectUrl(window.location.href);
      window.location.href = '/pages/auth/login.html';
      return;
    }

    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data.message || `Erreur serveur ${res.status}`);
    return data;
  } catch (err) {
    clearTimeout(timer);
    if (err.name === 'AbortError') {
      throw new Error('La requête a expiré. Vérifiez la connexion au serveur.');
    }
    if (err.message.includes('Failed to fetch') || err.message.includes('NetworkError')) {
      throw new Error('Impossible de joindre le serveur. Vérifiez que le backend est démarré.');
    }
    throw err;
  }
}

const api = {
  get: (path) => request('GET', path),
  post: (path, body) => request('POST', path, body),
  put: (path, body) => request('PUT', path, body),
  delete: (path) => request('DELETE', path),
  upload: (path, form) => request('POST', path, form, true),

  // Auth
  auth: {
    login: (email, password) => api.post('/auth/login', { email, password }),
    me: () => api.get('/auth/me'),
    changePassword: (data) => api.put('/auth/change-password', data),
  },
  // Dashboard
  dashboard: {
    kpis: (exercice_id) =>
      api.get(`/dashboard/kpis${exercice_id ? `?exercice_id=${exercice_id}` : ''}`),
  },
  // Exercices
  exercices: {
    list: () => api.get('/exercices'),
    create: (d) => api.post('/exercices', d),
    show: (id) => api.get(`/exercices/${id}`),
    update: (id, d) => api.put(`/exercices/${id}`, d),
    clore: (id) => api.post(`/exercices/${id}/clore`),
  },
  // Budget
  budget: {
    sources: {
      list: () => api.get('/budget/sources'),
      create: (d) => api.post('/budget/sources', d),
      show: (id) => api.get(`/budget/sources/${id}`),
      update: (id, d) => api.put(`/budget/sources/${id}`, d),
    },
    rubriques: {
      list: () => api.get('/budget/rubriques'),
      create: (d) => api.post('/budget/rubriques', d),
    },
    lignes: {
      list: (q) => api.get(`/budget/lignes${q ? `?${new URLSearchParams(q)}` : ''}`),
      create: (d) => api.post('/budget/lignes', d),
      show: (id) => api.get(`/budget/lignes/${id}`),
      update: (id, d) => api.put(`/budget/lignes/${id}`, d),
      disponibilite: (id, m) => api.get(`/budget/lignes/${id}/disponibilite?montant=${m}`),
      amender: (id, d) => api.post(`/budget/lignes/${id}/amender`, d),
    },
    suivi: () => api.get('/budget/suivi'),
  },
  // Fournisseurs
  fournisseurs: {
    list: () => api.get('/fournisseurs'),
    create: (d) => api.post('/fournisseurs', d),
    show: (id) => api.get(`/fournisseurs/${id}`),
    update: (id, d) => api.put(`/fournisseurs/${id}`, d),
  },
  // Dossiers
  dossiers: {
    list: (q) => api.get(`/dossiers${q ? `?${new URLSearchParams(q)}` : ''}`),
    create: (d) => api.post('/dossiers', d),
    show: (id) => api.get(`/dossiers/${id}`),
    update: (id, d) => api.put(`/dossiers/${id}`, d),
    delete: (id) => api.delete(`/dossiers/${id}`),
    transition: (id, d) => api.post(`/dossiers/${id}/transition`, d),
    workflow: (id) => api.get(`/dossiers/${id}/workflow`),
  },
  // Passation
  passation: {
    besoins: {
      list: (q) => api.get(`/passation/besoins${q ? `?${new URLSearchParams(q)}` : ''}`),
      create: (d) => api.post('/passation/besoins', d),
    },
    dc: {
      list: () => api.get('/passation/demandes-cotation'),
      create: (d) => api.post('/passation/demandes-cotation', d),
      show: (id) => api.get(`/passation/demandes-cotation/${id}`),
    },
    offres: {
      list: (q) => api.get(`/passation/offres${q ? `?${new URLSearchParams(q)}` : ''}`),
      create: (d) => api.post('/passation/offres', d),
    },
    attributions: {
      list: () => api.get('/passation/attributions'),
      create: (d) => api.post('/passation/attributions', d),
    },
  },
  // Commandes
  commandes: {
    bons: {
      list: () => api.get('/commandes/bons-commande'),
      create: (d) => api.post('/commandes/bons-commande', d),
      show: (id) => api.get(`/commandes/bons-commande/${id}`),
    },
    contrats: {
      list: () => api.get('/commandes/contrats'),
      create: (d) => api.post('/commandes/contrats', d),
      show: (id) => api.get(`/commandes/contrats/${id}`),
    },
  },
  // Réceptions
  receptions: {
    list: () => api.get('/receptions'),
    create: (d) => api.post('/receptions', d),
    show: (id) => api.get(`/receptions/${id}`),
    valider: (id) => api.post(`/receptions/${id}/valider`),
    asf: { list: () => api.get('/receptions/asf'), create: (d) => api.post('/receptions/asf', d) },
  },
  // Stock
  stock: {
    articles: {
      list: () => api.get('/stock/articles'),
      create: (d) => api.post('/stock/articles', d),
      show: (id) => api.get(`/stock/articles/${id}`),
    },
    mouvements: {
      list: (q) => api.get(`/stock/mouvements${q ? `?${new URLSearchParams(q)}` : ''}`),
      create: (d) => api.post('/stock/mouvements', d),
    },
    immobilisations: {
      list: () => api.get('/stock/immobilisations'),
      create: (d) => api.post('/stock/immobilisations', d),
    },
  },
  // Comptabilité
  comptabilite: {
    planComptable: () => api.get('/comptabilite/plan-comptable'),
    journaux: () => api.get('/comptabilite/journaux'),
    ecritures: {
      list: (q) => api.get(`/comptabilite/ecritures${q ? `?${new URLSearchParams(q)}` : ''}`),
      create: (d) => api.post('/comptabilite/ecritures', d),
      show: (id) => api.get(`/comptabilite/ecritures/${id}`),
      valider: (id) => api.post(`/comptabilite/ecritures/${id}/valider`),
    },
    grandLivre: (q) => api.get(`/comptabilite/grand-livre${q ? `?${new URLSearchParams(q)}` : ''}`),
    balance: (q) => api.get(`/comptabilite/balance${q ? `?${new URLSearchParams(q)}` : ''}`),
  },
  // Paiement
  paiement: {
    factures: {
      list: (q) => api.get(`/paiement/factures${q ? `?${new URLSearchParams(q)}` : ''}`),
      create: (d) => api.post('/paiement/factures', d),
      show: (id) => api.get(`/paiement/factures/${id}`),
      verifier: (id) => api.post(`/paiement/factures/${id}/verifier`),
    },
    liquidations: {
      list: () => api.get('/paiement/liquidations'),
      create: (d) => api.post('/paiement/liquidations', d),
    },
    ordres: {
      list: () => api.get('/paiement/ordres'),
      create: (d) => api.post('/paiement/ordres', d),
      show: (id) => api.get(`/paiement/ordres/${id}`),
      signer: (id) => api.post(`/paiement/ordres/${id}/signer`),
    },
    paiements: {
      list: () => api.get('/paiement/paiements'),
      create: (d) => api.post('/paiement/paiements', d),
    },
  },
  // Contrôle
  controle: {
    controles: {
      list: () => api.get('/controle/controles'),
      create: (d) => api.post('/controle/controles', d),
    },
    anomalies: {
      list: (q) => api.get(`/controle/anomalies${q ? `?${new URLSearchParams(q)}` : ''}`),
    },
    audits: {
      list: () => api.get('/controle/audits'),
      create: (d) => api.post('/controle/audits', d),
      show: (id) => api.get(`/controle/audits/${id}`),
    },
    recommandations: {
      list: (q) => api.get(`/controle/recommandations${q ? `?${new URLSearchParams(q)}` : ''}`),
      create: (d) => api.post('/controle/recommandations', d),
    },
  },
  // Documents
  documents: {
    list: (q) => api.get(`/documents${q ? `?${new URLSearchParams(q)}` : ''}`),
    upload: (form) => api.upload('/documents', form),
    download: (id) => `${BASE_URL}/documents/${id}/download`,
    delete: (id) => api.delete(`/documents/${id}`),
    types: () => api.get('/documents/types'),
  },
  // Reporting
  reporting: {
    suiviBudgetaire: (q) =>
      api.get(`/reporting/suivi-budgetaire${q ? `?${new URLSearchParams(q)}` : ''}`),
    executionFinanciere: (q) =>
      api.get(`/reporting/execution-financiere${q ? `?${new URLSearchParams(q)}` : ''}`),
    compteGestion: (q) =>
      api.get(`/reporting/compte-gestion${q ? `?${new URLSearchParams(q)}` : ''}`),
    kpis: (q) => api.get(`/reporting/kpis${q ? `?${new URLSearchParams(q)}` : ''}`),
  },
  // Users
  users: {
    list: () => api.get('/users'),
    create: (d) => api.post('/users', d),
    show: (id) => api.get(`/users/${id}`),
    update: (id, d) => api.put(`/users/${id}`, d),
    delete: (id) => api.delete(`/users/${id}`),
    assignRole: (id, d) => api.post(`/users/${id}/roles`, d),
    resetPassword: (id, d) => api.put(`/users/${id}/password`, d),
  },
  // Roles
  roles: {
    list: () => api.get('/roles'),
  },
};

// ── Utilitaires globaux ───────────────────────────────────────────────────────
function formatXOF(n) {
  if (n == null) return '0 FCFA';
  return `${Number(n).toLocaleString('fr-FR', { minimumFractionDigits: 0 })} FCFA`;
}

function formatDate(d) {
  if (!d) return '-';
  return new Date(d).toLocaleDateString('fr-FR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
}

function statutBadge(s) {
  const labels = {
    brouillon: 'Brouillon',
    soumis: 'Soumis',
    valide: 'Validé',
    en_cotation: 'En cotation',
    analyse: 'Analysé',
    attribue: 'Attribué',
    commande: 'Commandé',
    receptionne: 'Réceptionné',
    service_fait: 'Service fait',
    liquide: 'Liquidé',
    ordonnance: 'Ordonnancé',
    paye: 'Payé',
    rejete: 'Rejeté',
    suspendu: 'Suspendu',
    archive: 'Archivé',
  };
  return `<span class="badge-statut statut-${s}">${labels[s] || s}</span>`;
}

function toast(msg, type = 'success') {
  let c = document.getElementById('toast-container');
  if (!c) {
    c = document.createElement('div');
    c.id = 'toast-container';
    document.body.appendChild(c);
  }
  const t = document.createElement('div');
  t.className = `toast show align-items-center text-white bg-${type === 'success' ? 'success' : type === 'error' ? 'danger' : 'warning'} border-0 mb-2`;
  t.innerHTML = `<div class="d-flex"><div class="toast-body">${msg}</div><button type="button" class="btn-close btn-close-white me-2 m-auto" onclick="this.closest('.toast').remove()"></button></div>`;
  c.appendChild(t);
  setTimeout(() => t.remove(), 4000);
}

function requireAuth() {
  if (!getToken()) {
    saveRedirectUrl(window.location.href);
    window.location.href = '/pages/auth/login.html';
    return false;
  }
  return true;
}

function logout() {
  removeToken();
  removeUser();
  clearRedirectUrl();
  window.location.href = '/pages/auth/login.html';
}
