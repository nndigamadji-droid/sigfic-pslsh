const { User, Role, UserRole, AuditLog } = require('../models');

describe('Nettoyage des donnees de demonstration', () => {
  it('supprime les comptes de demonstration sans toucher aux administrateurs', async () => {
    const { cleanupDemoData } = require('../services/data-cleanup.service');
    const lectureRole = await Role.findOne({ where: { code: 'lecture' } });
    const adminRole = await Role.findOne({ where: { code: 'admin' } });
    const suffix = `${Date.now()}-${Math.round(Math.random() * 1e6)}`;
    const demoEmail = `demo.${suffix}@sigfic.invalid`;
    const staleEmail = `old.${suffix}@sigfic.invalid`;
    const adminEmail = `admin.${suffix}@sigfic.invalid`;
    let demoUser = null;
    let staleUser = null;
    let adminUser = null;

    try {
      demoUser = await User.create({
        nom: 'Demo',
        prenom: 'User',
        email: demoEmail,
        password_hash: 'disabled',
        is_active: true,
      });
      await UserRole.create({ user_id: demoUser.id, role_id: lectureRole.id });

      staleUser = await User.create({
        nom: 'Old',
        prenom: 'Deleted',
        email: staleEmail,
        password_hash: 'disabled',
        is_active: false,
      });
      await staleUser.destroy();

      adminUser = await User.create({
        nom: 'Admin',
        prenom: 'Preserve',
        email: adminEmail,
        password_hash: 'disabled',
        is_active: true,
      });
      await UserRole.create({ user_id: adminUser.id, role_id: adminRole.id });

      const dryRun = await cleanupDemoData({ apply: false });
      expect(dryRun.demoUsers).toBeGreaterThanOrEqual(1);
      expect(await User.findOne({ where: { email: demoEmail } })).toBeTruthy();

      const applied = await cleanupDemoData({ apply: true });
      expect(applied.demoUsers).toBeGreaterThanOrEqual(1);
      expect(applied.deletedEmailLocks).toBeGreaterThanOrEqual(1);

      const demoAfter = await User.findByPk(demoUser.id, { paranoid: false });
      expect(demoAfter.deletedAt).toBeTruthy();
      expect(demoAfter.email).toContain('deleted-');

      const staleAfter = await User.findByPk(staleUser.id, { paranoid: false });
      expect(staleAfter.email).toContain('deleted-');

      const adminAfter = await User.findByPk(adminUser.id);
      expect(adminAfter).toBeTruthy();
      expect(adminAfter.email).toBe(adminEmail);
    } finally {
      for (const id of [demoUser && demoUser.id, staleUser && staleUser.id, adminUser && adminUser.id].filter(Boolean)) {
        await UserRole.destroy({ where: { user_id: id } });
        await AuditLog.destroy({ where: { user_id: id } });
        await AuditLog.destroy({ where: { resource: 'user', resource_id: id } });
        await User.destroy({ where: { id }, force: true });
      }
    }
  });
});
