/**
 * Helpers partagés pour les tests d'intégration.
 * Hypothèse : le seed (admin@pslsh.org / Admin@2026) a été lancé au moins une fois.
 */
const request = require('supertest');
const app = require('../app/app');

const ADMIN_EMAIL = 'admin@pslsh.org';
const ADMIN_PASSWORD = 'Admin@2026';

let _cachedToken = null;

async function loginAsAdmin() {
  if (_cachedToken) return _cachedToken;
  const res = await request(app)
    .post('/api/v1/auth/login')
    .send({ email: ADMIN_EMAIL, password: ADMIN_PASSWORD });
  if (res.status !== 200 || !res.body?.data?.token) {
    throw new Error(`Login admin échoué : ${JSON.stringify(res.body)}`);
  }
  _cachedToken = res.body.data.token;
  return _cachedToken;
}

function authHeader(token) {
  return { Authorization: `Bearer ${token}` };
}

module.exports = { app, request, loginAsAdmin, authHeader, ADMIN_EMAIL, ADMIN_PASSWORD };
