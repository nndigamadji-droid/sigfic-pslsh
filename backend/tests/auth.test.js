const {
  app,
  request,
  loginAsAdmin,
  authHeader,
  ADMIN_EMAIL,
  ADMIN_PASSWORD,
} = require('./helpers');
const { AuditLog, User, UserRole } = require('../models');

describe('Auth', () => {
  it("GET / retourne l'identité de l'API", async () => {
    const res = await request(app).get('/');
    expect(res.status).toBe(200);
    expect(res.body.app).toBe('SIGFIC-PSLSH API');
    expect(res.body.status).toBe('running');
  });

  it('POST /auth/login refuse sans email/mot de passe (400)', async () => {
    const res = await request(app).post('/api/v1/auth/login').send({});
    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });

  it('POST /auth/login refuse credentials invalides (401)', async () => {
    const res = await request(app)
      .post('/api/v1/auth/login')
      .send({ email: 'inexistant@pslsh.org', password: 'wrong' });
    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
  });

  it('POST /auth/login accepte admin valide (200) + retourne token', async () => {
    const res = await request(app)
      .post('/api/v1/auth/login')
      .send({ email: ADMIN_EMAIL, password: ADMIN_PASSWORD });
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.token).toBeDefined();
    expect(typeof res.body.data.token).toBe('string');
    expect(res.body.data.token.length).toBeGreaterThan(100);
    expect(res.body.data.user.roles).toContain('admin');
    expect(res.body.data.user.permissions.length).toBeGreaterThan(0);
  });

  it('GET /auth/me refuse sans token (401)', async () => {
    const res = await request(app).get('/api/v1/auth/me');
    expect(res.status).toBe(401);
  });

  it('GET /auth/me refuse token invalide (401)', async () => {
    const res = await request(app)
      .get('/api/v1/auth/me')
      .set('Authorization', 'Bearer tokenbidon123');
    expect(res.status).toBe(401);
  });

  it("GET /auth/me accepte token valide et retourne l'utilisateur", async () => {
    const token = await loginAsAdmin();
    const res = await request(app).get('/api/v1/auth/me').set(authHeader(token));
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.email).toBe(ADMIN_EMAIL);
  });

  it('un compte cree depuis le formulaire admin avec role agent peut se connecter avec son mot de passe provisoire', async () => {
    const token = await loginAsAdmin();
    const suffix = `${Date.now()}-${Math.round(Math.random() * 1e6)}`;
    const email = `agent.${suffix}@sigfic.invalid`;
    const password = `Agent@2026!${suffix}`;

    const createRes = await request(app)
      .post('/api/v1/users')
      .set(authHeader(token))
      .send({
        nom: 'Test',
        prenom: 'Agent',
        email,
        password,
        role_code: 'agent',
        service_code: 'saf',
        fonction: 'Compte test',
      });

    expect(createRes.status).toBe(201);
    expect(createRes.body.success).toBe(true);
    expect(createRes.body.data.roles.map((r) => r.code)).toContain('lecture');

    const loginRes = await request(app)
      .post('/api/v1/auth/login')
      .send({ email, password });

    expect(loginRes.status).toBe(200);
    expect(loginRes.body.success).toBe(true);
    expect(loginRes.body.data.token).toBeDefined();
    expect(loginRes.body.data.user.roles).toContain('lecture');
    expect(loginRes.body.data.user.service_code).toBe('saf');
    expect(loginRes.body.data.user.fonction).toBe('Compte test');

    await UserRole.destroy({ where: { user_id: createRes.body.data.id } });
    await AuditLog.destroy({ where: { user_id: createRes.body.data.id } });
    await AuditLog.destroy({ where: { resource: 'user', resource_id: createRes.body.data.id } });
    await User.destroy({ where: { email }, force: true });
  });
});
