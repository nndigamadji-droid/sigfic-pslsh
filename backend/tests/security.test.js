const { app, request } = require('./helpers');

describe('Sécurité — rate-limit login', () => {
  it('Après 5 échecs de login depuis la même IP → 429', async () => {
    // Le test utilise un email qui n'existe sûrement pas pour ne pas verrouiller un vrai compte
    const fakeEmail = `bruteforce_${Date.now()}@example.com`;
    const requests = [];
    for (let i = 0; i < 7; i++) {
      requests.push(
        request(app).post('/api/v1/auth/login').send({ email: fakeEmail, password: 'wrong' })
      );
    }
    const responses = await Promise.all(requests);
    const codes = responses.map((r) => r.status);
    // Au moins une réponse doit être 429 (Too Many Requests)
    expect(codes.some((c) => c === 429)).toBe(true);
  });
});

describe('Sécurité — CORS', () => {
  it('Origin autorisée passe (localhost:5500)', async () => {
    const res = await request(app).get('/').set('Origin', 'http://localhost:5500');
    expect(res.status).toBe(200);
  });
});

describe('Sécurité — Headers Helmet', () => {
  it('X-DNS-Prefetch-Control présent (helmet actif)', async () => {
    const res = await request(app).get('/');
    expect(res.headers['x-dns-prefetch-control']).toBeDefined();
    expect(res.headers['x-content-type-options']).toBe('nosniff');
  });
});
