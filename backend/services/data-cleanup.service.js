const { Op } = require('sequelize');
const { User, Role, UserRole, Notification } = require('../models');

const DEMO_EMAILS = new Set(['comptable@pslsh.org', 'saf@pslsh.org']);
const DEMO_DOMAINS = ['@sigfic.invalid', '@example.com', '@example.org', '@example.net'];
const DEMO_NOTIFICATION_TITLES = [
  'Dépassement budgétaire L-DF2-001',
  'Délai moyen de traitement excède 30 jours',
  '4 dossiers bloqués depuis plus de 5 jours',
  'Validation à signer : DOS-2026-0019',
  'Pièces manquantes : DOS-2026-0008',
  'Liquidation à effectuer : 3 factures',
  'Rapprochement bancaire CBT — échéance dans 3 jours',
  'Comité de pilotage trimestriel — dans 14 jours',
  'Bienvenue dans SIGFIC-PSLSH v2.0',
  'Nouveau message du SAF',
  'Audit trail : 24 nouvelles entrées',
];

function buildDeletedEmail(user) {
  const safeLocal =
    String(user.email || 'user')
      .split('@')[0]
      .replace(/[^a-z0-9._-]/gi, '')
      .slice(0, 48) || 'user';
  return `deleted-${user.id}-${Date.now()}-${safeLocal}@deleted.local`;
}

async function archiveUserIdentity(user, options = {}) {
  const transaction = options.transaction;
  const archivedEmail = buildDeletedEmail(user);
  await UserRole.destroy({ where: { user_id: user.id }, transaction });
  await user.update(
    {
      email: archivedEmail,
      is_active: false,
    },
    { transaction, paranoid: false }
  );
  return archivedEmail;
}

function isDeletedEmail(email) {
  return String(email || '').startsWith('deleted-') && String(email || '').endsWith('@deleted.local');
}

function isDemoUser(user) {
  const email = String(user.email || '').toLowerCase();
  if (DEMO_EMAILS.has(email)) return true;
  if (DEMO_DOMAINS.some((domain) => email.endsWith(domain))) return true;
  return false;
}

function hasAdminRole(user) {
  return Array.isArray(user.roles) && user.roles.some((role) => role.code === 'admin');
}

async function cleanupDemoData(options = {}) {
  const apply = options.apply === true;
  const summary = {
    dryRun: !apply,
    demoUsers: 0,
    deletedEmailLocks: 0,
    demoNotifications: 0,
  };

  const users = await User.findAll({
    paranoid: false,
    include: [{ model: Role, as: 'roles', attributes: ['code'] }],
    order: [['id', 'ASC']],
  });

  for (const user of users) {
    if (user.deletedAt) {
      if (!isDeletedEmail(user.email)) {
        summary.deletedEmailLocks += 1;
        if (apply) await archiveUserIdentity(user);
      }
      continue;
    }

    if (!hasAdminRole(user) && isDemoUser(user)) {
      summary.demoUsers += 1;
      if (apply) {
        await archiveUserIdentity(user);
        await user.destroy();
      }
    }
  }

  summary.demoNotifications = await Notification.count({
    where: { title: { [Op.in]: DEMO_NOTIFICATION_TITLES } },
  });
  if (apply && summary.demoNotifications > 0) {
    await Notification.destroy({
      where: { title: { [Op.in]: DEMO_NOTIFICATION_TITLES } },
    });
  }

  return summary;
}

module.exports = {
  cleanupDemoData,
  archiveUserIdentity,
  buildDeletedEmail,
  isDemoUser,
};
