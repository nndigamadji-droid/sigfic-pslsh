const { User, Role, UserRole, Departement, Agent } = require('../models');
const authService = require('../services/auth.service');
const auditService = require('../services/audit.service');

const ROLE_CODE_ALIASES = {
  administrateur: 'admin',
  admin: 'admin',
  coordination: 'coordinateur',
  coordinateur: 'coordinateur',
  chef_service: 'gestionnaire',
  gestionnaire: 'gestionnaire',
  comptable_principal: 'comptable',
  comptable: 'comptable',
  controleur: 'auditeur',
  auditeur: 'auditeur',
  archiviste: 'archiviste',
  agent: 'lecture',
  lecture: 'lecture',
  comite_pilotage: 'lecture',
};

function normalizeRoleCode(roleCode) {
  if (!roleCode) return null;
  const key = String(roleCode).trim().toLowerCase();
  return ROLE_CODE_ALIASES[key] || key;
}

async function resolveRole({ role_code, role_id }) {
  if (role_code) {
    const normalizedRoleCode = normalizeRoleCode(role_code);
    const role = await Role.findOne({ where: { code: normalizedRoleCode } });
    return { role, normalizedRoleCode };
  }
  if (role_id) {
    const role = await Role.findByPk(role_id);
    return { role, normalizedRoleCode: role ? role.code : null };
  }
  return { role: null, normalizedRoleCode: null };
}

/* ── Liste tous les utilisateurs ──────────────────────────────────────────── */
async function list(req, res, next) {
  try {
    const users = await User.findAll({
      include: [
        { model: Role, as: 'roles', attributes: ['id', 'nom', 'code'] },
        { model: Departement, as: 'departement', attributes: ['id', 'nom'] },
      ],
      attributes: { exclude: ['password_hash'] },
      order: [['nom', 'ASC']],
    });
    res.json({ success: true, data: users });
  } catch (err) {
    next(err);
  }
}

/* ── Créer un utilisateur + attribuer son rôle ────────────────────────────── */
async function create(req, res, next) {
  try {
    const {
      nom,
      prenom,
      email,
      password,
      telephone,
      departement_id,
      service_code,
      unite_code,
      fonction,
      role_code,
      role_id,
      is_active,
    } = req.body;

    if (!password)
      return res.status(400).json({ success: false, message: 'Le mot de passe est obligatoire.' });

    const { role, normalizedRoleCode } = await resolveRole({ role_code, role_id });
    if (!role) {
      return res.status(400).json({
        success: false,
        message: 'Veuillez selectionner un role valide.',
      });
    }

    const hash = await authService.hashPassword(password);
    const user = await User.create({
      nom,
      prenom,
      email,
      password_hash: hash,
      telephone,
      departement_id,
      service_code: service_code || null,
      unite_code: unite_code || null,
      fonction: fonction || null,
      is_active: is_active !== undefined ? Boolean(is_active) : true,
      created_by: req.user.id,
    });

    /* Attribution du rôle (par code ou par id) */
    await UserRole.findOrCreate({
      where: { user_id: user.id, role_id: role.id },
      defaults: { assigned_by: req.user.id, assigned_at: new Date() },
    });

    await auditService.log(req.user.id, 'users:create', 'user', user.id, {
      new: { nom, prenom, email, role_code: normalizedRoleCode },
    });

    /* Retourner l'utilisateur avec son rôle */
    const created = await User.findByPk(user.id, {
      include: [{ model: Role, as: 'roles', attributes: ['id', 'nom', 'code'] }],
      attributes: { exclude: ['password_hash'] },
    });
    res.status(201).json({ success: true, data: created });
  } catch (err) {
    next(err);
  }
}

/* ── Afficher un utilisateur ──────────────────────────────────────────────── */
async function show(req, res, next) {
  try {
    const user = await User.findByPk(req.params.id, {
      include: [
        { model: Role, as: 'roles' },
        { model: Departement, as: 'departement' },
      ],
      attributes: { exclude: ['password_hash'] },
    });
    if (!user) return res.status(404).json({ success: false, message: 'Utilisateur introuvable' });
    res.json({ success: true, data: user });
  } catch (err) {
    next(err);
  }
}

/* ── Mettre à jour un utilisateur ────────────────────────────────────────── */
async function update(req, res, next) {
  try {
    const user = await User.findByPk(req.params.id);
    if (!user) return res.status(404).json({ success: false, message: 'Utilisateur introuvable' });

    const old = {
      nom: user.nom,
      prenom: user.prenom,
      email: user.email,
      is_active: user.is_active,
    };
    const {
      nom,
      prenom,
      email,
      telephone,
      departement_id,
      service_code,
      unite_code,
      fonction,
      is_active,
      role_code,
      role_id,
    } = req.body;

    await user.update({
      nom: nom ?? user.nom,
      prenom: prenom ?? user.prenom,
      email: email ?? user.email,
      telephone: telephone ?? user.telephone,
      departement_id: departement_id ?? user.departement_id,
      service_code: service_code !== undefined ? service_code : user.service_code,
      unite_code: unite_code !== undefined ? unite_code : user.unite_code,
      fonction: fonction !== undefined ? fonction : user.fonction,
      is_active: is_active !== undefined ? is_active : user.is_active,
    });

    /* Mise à jour du rôle si fourni */
    let role = null;
    if (role_code || role_id) {
      const resolved = await resolveRole({ role_code, role_id });
      role = resolved.role;
      if (!role) {
        return res.status(400).json({
          success: false,
          message: 'Veuillez selectionner un role valide.',
        });
      }
    }
    if (role) {
      /* Remplacer tous les rôles existants par le nouveau */
      await UserRole.destroy({ where: { user_id: user.id } });
      await UserRole.create({
        user_id: user.id,
        role_id: role.id,
        assigned_by: req.user.id,
        assigned_at: new Date(),
      });
    }

    await auditService.log(req.user.id, 'users:update', 'user', user.id, {
      old,
      new: { nom, prenom, email },
    });

    const updated = await User.findByPk(user.id, {
      include: [{ model: Role, as: 'roles', attributes: ['id', 'nom', 'code'] }],
      attributes: { exclude: ['password_hash'] },
    });
    res.json({ success: true, data: updated });
  } catch (err) {
    next(err);
  }
}

/* ── Supprimer un utilisateur (soft delete) ───────────────────────────────── */
async function destroy(req, res, next) {
  try {
    const user = await User.findByPk(req.params.id);
    if (!user) return res.status(404).json({ success: false, message: 'Utilisateur introuvable' });
    await user.destroy();
    await auditService.log(req.user.id, 'users:delete', 'user', user.id, {});
    res.json({ success: true, message: 'Utilisateur supprimé' });
  } catch (err) {
    next(err);
  }
}

/* ── Attribuer un rôle ────────────────────────────────────────────────────── */
async function assignRole(req, res, next) {
  try {
    const { role_id, role_code } = req.body;
    const user = await User.findByPk(req.params.id, { include: [{ model: Role, as: 'roles' }] });
    if (!user) return res.status(404).json({ success: false, message: 'Utilisateur introuvable' });

    const { role } = await resolveRole({ role_code, role_id });
    if (!role) return res.status(404).json({ success: false, message: 'Rôle introuvable' });

    await user.addRole(role, { through: { assigned_by: req.user.id, assigned_at: new Date() } });
    await auditService.log(req.user.id, 'users:assign_role', 'user', user.id, {
      new: { role_id: role.id, role_code: role.code },
    });
    res.json({ success: true, message: 'Rôle attribué' });
  } catch (err) {
    next(err);
  }
}

/* ── Réinitialiser le mot de passe (admin) ────────────────────────────────── */
async function resetPassword(req, res, next) {
  try {
    const user = await User.findByPk(req.params.id);
    if (!user) return res.status(404).json({ success: false, message: 'Utilisateur introuvable' });
    const { new_password } = req.body;
    if (!new_password || new_password.length < 6) {
      return res
        .status(400)
        .json({
          success: false,
          message: 'Le nouveau mot de passe doit comporter au moins 6 caractères.',
        });
    }
    const hash = await authService.hashPassword(new_password);
    await user.update({ password_hash: hash });
    await auditService.log(req.user.id, 'users:reset_password', 'user', user.id, {});
    res.json({ success: true, message: 'Mot de passe réinitialisé avec succès.' });
  } catch (err) {
    next(err);
  }
}

module.exports = { list, create, show, update, destroy, assignRole, resetPassword };
