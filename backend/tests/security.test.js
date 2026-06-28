const { app, request } = require('./helpers');

describe('Securite - rate-limit login', () => {
  it('apres plusieurs echecs de login depuis la meme IP, retourne au moins un 429', async () => {
    const fakeEmail = `bruteforce_${Date.now()}@example.com`;
    const requests = [];
    for (let i = 0; i < 7; i++) {
      requests.push(
        request(app).post('/api/v1/auth/login').send({ email: fakeEmail, password: 'wrong' })
      );
    }
    const responses = await Promise.all(requests);
    const codes = responses.map((r) => r.status);
    expect(codes.some((c) => c === 429)).toBe(true);
  });
});

describe('Securite - CORS', () => {
  it('accepte localhost:5500 en developpement', async () => {
    const res = await request(app).get('/').set('Origin', 'http://localhost:5500');
    expect(res.status).toBe(200);
  });

  it('accepte une origine declaree dans FRONTEND_URLS', async () => {
    const originalFrontendUrl = process.env.FRONTEND_URL;
    const originalFrontendUrls = process.env.FRONTEND_URLS;

    jest.resetModules();
    process.env.FRONTEND_URL = '';
    process.env.FRONTEND_URLS =
      'https://sigfic-pslsh.netlify.app, https://sigfic-pslsh-ist.netlify.app';

    const isolatedRequest = require('supertest');
    const isolatedApp = require('../app/app');
    const res = await isolatedRequest(isolatedApp)
      .get('/')
      .set('Origin', 'https://sigfic-pslsh-ist.netlify.app');

    process.env.FRONTEND_URL = originalFrontendUrl;
    process.env.FRONTEND_URLS = originalFrontendUrls;

    expect(res.status).toBe(200);
  });
});

describe('Securite - Headers Helmet', () => {
  it('sert les headers de securite Helmet', async () => {
    const res = await request(app).get('/');
    expect(res.headers['x-dns-prefetch-control']).toBeDefined();
    expect(res.headers['x-content-type-options']).toBe('nosniff');
  });
});
