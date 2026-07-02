require('dotenv').config();
const { sequelize } = require('../models');
const { cleanupDemoData } = require('../services/data-cleanup.service');

async function main() {
  if (process.env.ALLOW_DATA_CLEANUP !== 'true') {
    throw new Error('ALLOW_DATA_CLEANUP=true est requis pour autoriser ce nettoyage.');
  }

  const apply = process.env.APPLY_DATA_CLEANUP === 'true';
  const summary = await cleanupDemoData({ apply });

  console.log('\nSIGFIC-PSLSH - Nettoyage donnees demo');
  console.log(`Mode              : ${apply ? 'APPLICATION' : 'APERÇU / DRY-RUN'}`);
  console.log(`Comptes demo      : ${summary.demoUsers}`);
  console.log(`Emails supprimes  : ${summary.deletedEmailLocks}`);
  console.log(`Notifications demo: ${summary.demoNotifications}`);

  if (!apply) {
    console.log('\nAucune donnee modifiee. Relancer avec APPLY_DATA_CLEANUP=true pour appliquer.');
  }
}

main()
  .catch((err) => {
    console.error(err.message || err);
    process.exitCode = 1;
  })
  .finally(async () => {
    await sequelize.close();
  });
