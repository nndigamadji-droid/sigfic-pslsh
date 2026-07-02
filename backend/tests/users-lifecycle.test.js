const { request, app, loginAsAdmin, authHeader } = require('./helpers');
const { User, UserRole, AuditLog } = require('../models');

describe('Cycle de vie des comptes utilisateurs', () => {
  it('permet de recreer un compte avec le meme email apres suppression', async () => {
    const token = await loginAsAdmin();
    const suffix = `${Date.now()}-${Math.round(Math.random() * 1e6)}`;
    const email = `recreate.${suffix}@sigfic.invalid`;
    const password = `Recreate@2026!${suffix}`;
    let firstUserId = null;
    let secondUserId = null;

    try {
      const firstCreate = await request(app)
        .post('/api/v1/users')
        .set(authHeader(token))
        .send({
          nom: 'Premier',
          prenom: 'Compte',
          email,
          password,
          role_code: 'lecture',
          service_code: 'SAF',
          fonction: 'Compte a supprimer',
        });

      expect(firstCreate.status).toBe(201);
      firstUserId = firstCreate.body.data.id;

      const deleteRes = await request(app)
        .delete(`/api/v1/users/${firstUserId}`)
        .set(authHeader(token));

      expect(deleteRes.status).toBe(200);

      const deletedUser = await User.findByPk(firstUserId, { paranoid: false });
      expect(deletedUser.deletedAt).toBeTruthy();
      expect(deletedUser.email).not.toBe(email);
      expect(deletedUser.email).toContain('deleted-');

      const secondCreate = await request(app)
        .post('/api/v1/users')
        .set(authHeader(token))
        .send({
          nom: 'Second',
          prenom: 'Compte',
          email,
          password,
          role_code: 'lecture',
          service_code: 'SAF',
          fonction: 'Compte recree',
        });

      expect(secondCreate.status).toBe(201);
      secondUserId = secondCreate.body.data.id;
      expect(secondUserId).not.toBe(firstUserId);
      expect(secondCreate.body.data.email).toBe(email);
    } finally {
      for (const id of [firstUserId, secondUserId].filter(Boolean)) {
        await UserRole.destroy({ where: { user_id: id } });
        await AuditLog.destroy({ where: { user_id: id } });
        await AuditLog.destroy({ where: { resource: 'user', resource_id: id } });
        await User.destroy({ where: { id }, force: true });
      }
    }
  });

  it('libere un email deja bloque par un ancien compte supprime', async () => {
    const token = await loginAsAdmin();
    const suffix = `${Date.now()}-${Math.round(Math.random() * 1e6)}`;
    const email = `stale.${suffix}@sigfic.invalid`;
    const password = `Stale@2026!${suffix}`;
    let staleUser = null;
    let createdUserId = null;

    try {
      staleUser = await User.create({
        nom: 'Ancien',
        prenom: 'Supprime',
        email,
        password_hash: 'disabled',
        is_active: false,
      });
      await staleUser.destroy();

      const createRes = await request(app)
        .post('/api/v1/users')
        .set(authHeader(token))
        .send({
          nom: 'Nouveau',
          prenom: 'Compte',
          email,
          password,
          role_code: 'lecture',
          service_code: 'SAF',
          fonction: 'Compte apres nettoyage',
        });

      expect(createRes.status).toBe(201);
      createdUserId = createRes.body.data.id;
      expect(createRes.body.data.email).toBe(email);

      const staleAfter = await User.findByPk(staleUser.id, { paranoid: false });
      expect(staleAfter.email).not.toBe(email);
      expect(staleAfter.email).toContain('deleted-');
    } finally {
      for (const id of [staleUser && staleUser.id, createdUserId].filter(Boolean)) {
        await UserRole.destroy({ where: { user_id: id } });
        await AuditLog.destroy({ where: { user_id: id } });
        await AuditLog.destroy({ where: { resource: 'user', resource_id: id } });
        await User.destroy({ where: { id }, force: true });
      }
    }
  });
});
