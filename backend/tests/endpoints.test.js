const { app, request, loginAsAdmin, authHeader, tokenFor } = require('./helpers');
const { Dossier, Exercice, Facture } = require('../models');

async function createTestDossier(overrides = {}) {
  const [exercice] = await Exercice.findOrCreate({
    where: { annee: 2099 },
    defaults: {
      libelle: 'Exercice tests automatises',
      date_debut: '2099-01-01',
      date_fin: '2099-12-31',
      statut: 'en_cours',
      created_by: 1,
    },
  });

  return Dossier.create({
    reference: `TEST-${Date.now()}-${Math.round(Math.random() * 1e6)}`,
    exercice_id: exercice.id,
    objet: 'Dossier de test',
    type_depense: 'services',
    statut: 'brouillon',
    created_by: 1,
    ...overrides,
  });
}

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

  it("GET /dossiers/:id retourne le detail du dossier sans erreur d'association Sequelize", async () => {
    const dossier = await createTestDossier({
      objet: 'Dossier de test detail',
      statut: 'brouillon',
    });

    const res = await request(app).get(`/api/v1/dossiers/${dossier.id}`).set(authHeader(token));

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.reference).toBe(dossier.reference);
  });
});

describe('Regression paiement', () => {
  it('POST /paiement/factures refuse un utilisateur qui a seulement paiement:read', async () => {
    const dossier = await createTestDossier({
      objet: 'Dossier test permission facture',
      statut: 'service_fait',
    });
    const token = tokenFor({ id: 1, permissions: ['paiement:read'] });

    const res = await request(app)
      .post('/api/v1/paiement/factures')
      .set(authHeader(token))
      .send({
        dossier_id: dossier.id,
        reference_facture: `FAC-TEST-${Date.now()}`,
        montant_ttc: 1000,
      });

    expect(res.status).toBe(403);
  });

  it('POST /paiement/factures/:id/verifier accepte une facture recue', async () => {
    const dossier = await createTestDossier({
      objet: 'Dossier test verification facture',
      statut: 'service_fait',
    });
    const facture = await Facture.create({
      dossier_id: dossier.id,
      reference_facture: `FAC-VERIF-${Date.now()}`,
      montant_ttc: 1000,
      statut: 'recu',
    });
    const token = tokenFor({ id: 1, permissions: ['paiement:liquider'] });

    const res = await request(app)
      .post(`/api/v1/paiement/factures/${facture.id}/verifier`)
      .set(authHeader(token));

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.statut).toBe('verifie');
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
