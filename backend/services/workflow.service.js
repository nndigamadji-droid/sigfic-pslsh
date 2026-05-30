const { Dossier, WorkflowTransition, User, Role, UserRole } = require('../models');
const { canTransition, isRoleAllowed } = require('../config/workflow');
const auditService = require('./audit.service');

async function getUserRoleCodes(userId) {
  const user = await User.findByPk(userId, {
    include: [{ model: Role, as: 'roles', attributes: ['code'] }],
  });
  if (!user) return [];
  return user.roles.map((r) => r.code);
}

async function transition(dossierId, toStatus, userId, comment) {
  const dossier = await Dossier.findByPk(dossierId);
  if (!dossier) throw new Error('Dossier introuvable');

  const fromStatus = dossier.statut;
  if (!canTransition(fromStatus, toStatus)) {
    throw new Error(`Transition impossible de "${fromStatus}" vers "${toStatus}"`);
  }

  const userRoles = await getUserRoleCodes(userId);
  if (!isRoleAllowed(fromStatus, toStatus, userRoles)) {
    throw new Error("Vous n'avez pas les droits pour effectuer cette transition");
  }

  const updates = { statut: toStatus };
  if (toStatus === 'soumis') {
    updates.soumis_par = userId;
    updates.soumis_le = new Date();
  }
  if (toStatus === 'valide') {
    updates.valide_par = userId;
    updates.valide_le = new Date();
  }
  if (toStatus === 'rejete') {
    updates.rejete_par = userId;
    updates.rejete_le = new Date();
    if (comment) updates.motif_rejet = comment;
  }

  await dossier.update(updates);

  await WorkflowTransition.create({
    dossier_id: dossierId,
    from_status: fromStatus,
    to_status: toStatus,
    comment: comment || null,
    transitioned_by: userId,
  });

  await auditService.log(userId, `workflow:${fromStatus}->${toStatus}`, 'dossier', dossierId, {
    old: { statut: fromStatus },
    new: { statut: toStatus, comment },
  });

  return dossier;
}

async function getHistory(dossierId) {
  return WorkflowTransition.findAll({
    where: { dossier_id: dossierId },
    include: [{ model: User, as: 'agent', attributes: ['nom', 'prenom'] }],
    order: [['createdAt', 'ASC']],
  });
}

module.exports = { transition, getHistory };
