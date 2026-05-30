function requirePermission(resource, action) {
  return (req, res, next) => {
    const user = req.user;
    if (!user) return res.status(401).json({ success: false, message: 'Non authentifié' });

    // Admin a tous les droits
    if (user.roles && user.roles.includes('admin')) return next();

    const perm = `${resource}:${action}`;
    if (user.permissions && user.permissions.includes(perm)) return next();

    return res.status(403).json({ success: false, message: `Permission refusée: ${perm}` });
  };
}

module.exports = requirePermission;
