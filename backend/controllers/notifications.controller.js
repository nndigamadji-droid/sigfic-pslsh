/* ════════════════════════════════════════════════════════════════════════════
   Centre des notifications — filtrage strict par destinataire (habilitations)
   ════════════════════════════════════════════════════════════════════════════ */
const { Notification, User, Role, UserRole } = require('../models');
const { Op } = require('sequelize');

/* Helper : récupère rôles + permissions de l'utilisateur (cache simple par requête) */
async function userScope(userId) {
  const user = await User.findByPk(userId, {
    include: [{ model: Role, as: 'roles', through: { attributes: [] } }],
  });
  if (!user) return { roles: [], permissions: [] };
  const roles = (user.roles || []).map((r) => r.code);
  return { user, roles };
}

/* Vérifie qu'une notification est légitimement adressable à l'utilisateur */
function isAllowed(notif, userRoles) {
  if (!notif.role_required) return true;
  return userRoles.includes(notif.role_required);
}

/* ── GET /api/v1/notifications ─────────────────────────────────────────────
   Filtres : ?type=alert|task|reminder|message|info
             ?category=budget|finance|...
             ?status=unread|read|done|snoozed|dismissed|active
             ?priority=urgent|high|normal|low
             ?limit=N
   ──────────────────────────────────────────────────────────────────────── */
async function list(req, res, next) {
  try {
    const { type, category, status, priority, limit } = req.query;
    const scope = await userScope(req.user.id);

    const where = { user_id: req.user.id };
    if (type) where.type = type;
    if (category) where.category = category;
    if (priority) where.priority = priority;

    if (status === 'active') {
      // Tout ce qui n'est ni fermé ni "reporté en cours"
      where.status = { [Op.in]: ['unread', 'read'] };
    } else if (status) {
      where.status = status;
    }

    // Snoozed dont la date est passée → on les remonte comme actifs
    const rows = await Notification.findAll({
      where,
      order: [
        ['status', 'ASC'],        // unread d'abord
        ['priority', 'DESC'],     // urgent > normal
        ['createdAt', 'DESC'],
      ],
      limit: limit ? parseInt(limit, 10) : 200,
    });

    // Filtre additionnel par rôle (sécurité)
    const filtered = rows.filter((n) => isAllowed(n, scope.roles));

    res.json({ success: true, data: filtered });
  } catch (err) { next(err); }
}

/* ── GET /api/v1/notifications/count ──────────────────────────────────────
   Badge counter : nombre de notifs unread + facteurs catégoriels.
   ──────────────────────────────────────────────────────────────────────── */
async function count(req, res, next) {
  try {
    const scope = await userScope(req.user.id);
    const where = { user_id: req.user.id };
    const all = await Notification.findAll({ where });
    const visible = all.filter((n) => isAllowed(n, scope.roles));

    const tally = {
      total: visible.length,
      unread: visible.filter((n) => n.status === 'unread').length,
      active: visible.filter((n) => ['unread', 'read'].includes(n.status)).length,
      by_type: {},
      by_priority: {},
      by_category: {},
    };
    for (const n of visible) {
      if (['unread', 'read'].includes(n.status)) {
        tally.by_type[n.type]         = (tally.by_type[n.type]         || 0) + 1;
        tally.by_priority[n.priority] = (tally.by_priority[n.priority] || 0) + 1;
        tally.by_category[n.category] = (tally.by_category[n.category] || 0) + 1;
      }
    }
    res.json({ success: true, data: tally });
  } catch (err) { next(err); }
}

/* ── POST /api/v1/notifications/:id/read ──────────────────────────────── */
async function markRead(req, res, next) {
  try {
    const n = await Notification.findOne({ where: { id: req.params.id, user_id: req.user.id } });
    if (!n) return res.status(404).json({ success: false, message: 'Notification introuvable' });
    if (n.status === 'unread') await n.update({ status: 'read', read_at: new Date() });
    res.json({ success: true, data: n });
  } catch (err) { next(err); }
}

/* ── POST /api/v1/notifications/:id/done ──────────────────────────────── */
async function markDone(req, res, next) {
  try {
    const n = await Notification.findOne({ where: { id: req.params.id, user_id: req.user.id } });
    if (!n) return res.status(404).json({ success: false, message: 'Notification introuvable' });
    await n.update({ status: 'done', done_at: new Date(), read_at: n.read_at || new Date() });
    res.json({ success: true, data: n });
  } catch (err) { next(err); }
}

/* ── POST /api/v1/notifications/:id/snooze ────────────────────────────── */
async function snooze(req, res, next) {
  try {
    const n = await Notification.findOne({ where: { id: req.params.id, user_id: req.user.id } });
    if (!n) return res.status(404).json({ success: false, message: 'Notification introuvable' });
    const hours = parseInt(req.body.hours, 10) || 24;
    const until = new Date(Date.now() + hours * 3600 * 1000);
    await n.update({ status: 'snoozed', snoozed_until: until });
    res.json({ success: true, data: n });
  } catch (err) { next(err); }
}

/* ── POST /api/v1/notifications/:id/dismiss ───────────────────────────── */
async function dismiss(req, res, next) {
  try {
    const n = await Notification.findOne({ where: { id: req.params.id, user_id: req.user.id } });
    if (!n) return res.status(404).json({ success: false, message: 'Notification introuvable' });
    await n.update({ status: 'dismissed' });
    res.json({ success: true });
  } catch (err) { next(err); }
}

/* ── POST /api/v1/notifications/mark-all-read ─────────────────────────── */
async function markAllRead(req, res, next) {
  try {
    const n = await Notification.update(
      { status: 'read', read_at: new Date() },
      { where: { user_id: req.user.id, status: 'unread' } }
    );
    res.json({ success: true, data: { updated: n[0] } });
  } catch (err) { next(err); }
}

/* ── POST /api/v1/notifications  (création manuelle, admin) ───────────── */
async function create(req, res, next) {
  try {
    const payload = { ...req.body, emitted_by: req.user.id };
    if (!payload.user_id || !payload.title || !payload.message) {
      return res.status(400).json({ success: false, message: 'user_id, title et message requis' });
    }
    const n = await Notification.create(payload);
    res.status(201).json({ success: true, data: n });
  } catch (err) { next(err); }
}

/* ── POST /api/v1/notifications/generate-reminders (cron-like) ────────── */
async function generateReminders(req, res, next) {
  try {
    // Stub : ici on parcourrait Dossier / Validation / Lignes pour créer
    // des notifs automatiques. Pour l'instant retourne ok pour démontrer l'API.
    res.json({ success: true, data: { generated: 0, message: 'Cron générateur prêt (à brancher sur les modules)' } });
  } catch (err) { next(err); }
}

module.exports = {
  list, count, markRead, markDone, snooze, dismiss, markAllRead, create, generateReminders,
};
