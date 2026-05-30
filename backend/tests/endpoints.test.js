const { app, request, loginAsAdmin, authHeader } = require('./helpers');

describe('Endpoints protégés (smoke tests)', () => {
  let token;
  beforeAll(async () => {
    token = await loginAsAdmin();
  });

  const endpoints = [
    '/api/v1/dashboard/kpis',
    '/api/v1/users',
    '/api/v1/exercices',
    '/api/v1/budget/sources',
    '/api/v1/budget/rubriques',
    '/api/v1/budget/lignes',
    '/api/v1/fournisseurs',
    '/api/v1/beneficiaires',
    '/api/v1/stock/articles',
    '/api/v1/comptabilite/journaux',
    '/api/v1/comptabilite/plan-comptable',
    '/api/v1/reporting/compte-gestion',
    '/api/v1/paiement/factures',
    '/api/v1/paiement/liquidations',
    '/api/v1/paiement/ordres',
    '/api/v1/paiement/paiements',
    '/api/v1/controle/controles',
    '/api/v1/controle/anomalies',
    '/api/v1/controle/audits',
    '/api/v1/documents/types',
    '/api/v1/roles',
    '/api/v1/audit-logs',
    '/api/v1/receptions',
  ];

  test.each(endpoints)('GET %s → 200', async (url) => {
    const res = await request(app).get(url).set(authHeader(token));
    expect(res.status).toBe(200);
  });
});

describe('Régression bugs critiques', () => {
  let token;
  beforeAll(async () => {
    token = await loginAsAdmin();
  });

  it('GET /dossiers ne doit plus retourner 500 (colonne expression_besoin_id ajoutée)', async () => {
    const res = await request(app).get('/api/v1/dossiers').set(authHeader(token));
    expect(res.status).toBe(200);
  });

  it('GET /passation/besoins ne doit plus retourner 500 (colonne reference ajoutée)', async () => {
    const res = await request(app).get('/api/v1/passation/besoins').set(authHeader(token));
    expect(res.status).toBe(200);
  });
});

describe('Sécurité — autorisation', () => {
  const protectedEndpoints = [
    '/api/v1/users',
    '/api/v1/dossiers',
    '/api/v1/budget/sources',
    '/api/v1/paiement/paiements',
  ];

  test.each(protectedEndpoints)('GET %s sans token → 401', async (url) => {
    const res = await request(app).get(url);
    expect(res.status).toBe(401);
  });
});
