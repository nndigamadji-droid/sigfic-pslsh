function errorHandler(err, req, res, next) {
  console.error(err.stack);

  if (err.name === 'SequelizeValidationError') {
    return res.status(422).json({
      success: false,
      message: 'Erreur de validation',
      errors: err.errors.map((e) => ({ field: e.path, message: e.message })),
    });
  }

  if (err.name === 'SequelizeUniqueConstraintError') {
    return res.status(409).json({
      success: false,
      message: 'Un enregistrement avec ces données existe déjà',
    });
  }

  const status = err.status || 500;
  return res.status(status).json({
    success: false,
    message: err.message || 'Erreur interne du serveur',
  });
}

module.exports = errorHandler;
