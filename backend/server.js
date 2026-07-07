require('dotenv').config();
const app = require('./app/app');
const { sequelize } = require('./models');

const PORT = process.env.PORT || 3000;

// Connexion à la base avec quelques tentatives : évite qu'un simple à-coup
// réseau au démarrage (bascule/redémarrage de la base managée) ne tue le
// service et ne rende toute connexion impossible.
async function connectWithRetry(retries = 5, delayMs = 3000) {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      await sequelize.authenticate();
      return;
    } catch (err) {
      console.error(
        `Tentative de connexion BDD ${attempt}/${retries} échouée : ${err.message}`
      );
      if (attempt === retries) throw err;
      await new Promise((resolve) => setTimeout(resolve, delayMs));
    }
  }
}

async function start() {
  try {
    await connectWithRetry();
    console.log('✓ Base de données connectée');

    // Sync all models (create tables if not exist)
    await sequelize.sync({ alter: false });

    // Migration : ajouter les nouvelles colonnes si elles n'existent pas
    const qi = sequelize.getQueryInterface();
    const userCols = await qi.describeTable('users');
    if (!userCols.service_code)
      await qi.addColumn('users', 'service_code', {
        type: require('sequelize').DataTypes.STRING(20),
        allowNull: true,
      });
    if (!userCols.unite_code)
      await qi.addColumn('users', 'unite_code', {
        type: require('sequelize').DataTypes.STRING(20),
        allowNull: true,
      });
    if (!userCols.fonction)
      await qi.addColumn('users', 'fonction', {
        type: require('sequelize').DataTypes.STRING(200),
        allowNull: true,
      });
    console.log('✓ Tables synchronisées');

    app.listen(PORT, () => {
      console.log(`\n╔════════════════════════════════════════════╗`);
      console.log(`║  SIGFIC-PSLSH - Gestion Financière & Comptable ║`);
      console.log(`║  Serveur démarré: http://localhost:${PORT}    ║`);
      console.log(`╚════════════════════════════════════════════╝\n`);
    });
  } catch (err) {
    console.error('Erreur de démarrage:', err);
    process.exit(1);
  }
}

start();
