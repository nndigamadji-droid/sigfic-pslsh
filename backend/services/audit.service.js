const { AuditLog } = require('../models');

async function log(userId, action, resource, resourceId, details = {}) {
  try {
    await AuditLog.create({
      user_id: userId,
      action,
      resource,
      resource_id: resourceId,
      old_values: details.old || null,
      new_values: details.new || null,
      ip_address: details.ip || null,
      user_agent: details.userAgent || null,
    });
  } catch (e) {
    // Audit must never break business flow
    console.error('AuditLog error:', e.message);
  }
}

module.exports = { log };
