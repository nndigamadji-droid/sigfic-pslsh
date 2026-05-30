const dashboardService = require('../services/dashboard.service');

async function getKPIs(req, res, next) {
  try {
    const exerciceId = req.query.exercice_id || null;
    const data = await dashboardService.getKPIs(exerciceId);
    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
}

module.exports = { getKPIs };
