const {
  app,
  request,
  loginAsAdmin,
  authHeader,
  ADMIN_EMAIL,
  ADMIN_PASSWORD,
} = require('./helpers');

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
});
