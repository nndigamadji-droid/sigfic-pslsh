require('dotenv').config();

// JWT_SECRET est obligatoire — refuse de démarrer si absent ou trop faible
// (sauf en mode test pour permettre l'exécution de Jest sans .env complet)
const JWT_SECRET = process.env.JWT_SECRET;
const isTest = process.env.NODE_ENV === 'test';

if (!isTest) {
  if (!JWT_SECRET) {
    console.error('\n❌ FATAL : JWT_SECRET manquant dans .env');
    console.error(
      "   Générez-en un avec : node -e \"console.log(require('crypto').randomBytes(48).toString('hex'))\""
    );
    process.exit(1);
  }
  if (JWT_SECRET.length < 32) {
    console.error('\n❌ FATAL : JWT_SECRET trop court (< 32 caractères)');
    process.exit(1);
  }
  if (JWT_SECRET === 'pslsh_default_secret' || JWT_SECRET.includes('change_in_production')) {
    console.warn(
      '\n⚠  WARN : JWT_SECRET semble être une valeur par défaut. Régénérez-en un en production.'
    );
  }
}

module.exports = {
  jwtSecret: JWT_SECRET || 'test_only_secret_do_not_use_in_production_xyz123',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '8h',
  jwtRefreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
  bcryptRounds: parseInt(process.env.BCRYPT_ROUNDS, 10) || 12,
};
