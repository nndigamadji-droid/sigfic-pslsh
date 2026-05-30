/**
 * Migration script — synchronise les colonnes BDD avec les modèles Sequelize.
 *
 * Approche : pour chaque table, comparer les colonnes du modèle avec celles
 * réellement présentes en BDD, puis exécuter qi.addColumn() sur les manquantes.
 *
 * Usage : node scripts/migrate.js
 *
 * IMPORTANT : ne supprime jamais de colonnes (mode non destructif).
 */
require('dotenv').config();
const { sequelize } = require('../models');
const models = require('../models');

async function migrate() {
  console.log('═══════════════════════════════════════════════════════════');
  console.log('  SIGFIC-PSLSH — Migration schéma BDD');
  console.log('═══════════════════════════════════════════════════════════\n');

  const qi = sequelize.getQueryInterface();
  let totalAdded = 0;
  let tablesPatched = 0;

  // Liste tous les modèles enregistrés (hors sequelize/Sequelize)
  const modelNames = Object.keys(models).filter(
    (k) => k !== 'sequelize' && k !== 'Sequelize' && typeof models[k] === 'function'
  );

  for (const name of modelNames) {
    const Model = models[name];
    const tableName = Model.getTableName();
    const tableNameStr = typeof tableName === 'string' ? tableName : tableName.tableName;

    try {
      // Colonnes en BDD
      const existing = await qi.describeTable(tableNameStr);
      const existingCols = Object.keys(existing);

      // Colonnes attendues par le modèle
      const modelAttrs = Model.rawAttributes;
      const expectedCols = Object.keys(modelAttrs).map((a) => modelAttrs[a].field || a);

      // Colonnes manquantes
      const missing = expectedCols.filter((c) => !existingCols.includes(c));

      if (missing.length === 0) continue;

      console.log(`📌 ${tableNameStr}`);
      tablesPatched++;
      for (const colName of missing) {
        const attrName = Object.keys(modelAttrs).find(
          (a) => (modelAttrs[a].field || a) === colName
        );
        const attrDef = modelAttrs[attrName];
        try {
          await qi.addColumn(tableNameStr, colName, {
            type: attrDef.type,
            allowNull: attrDef.allowNull !== false, // default true pour migration
            defaultValue: attrDef.defaultValue,
          });
          console.log(`   ✓ ajout colonne « ${colName} »`);
          totalAdded++;
        } catch (err) {
          console.log(`   ✗ ${colName} : ${err.message}`);
        }
      }
    } catch (err) {
      // Table inexistante : la créer via sync individuel
      if (err.message.includes('No description found')) {
        console.log(`📌 ${tableNameStr} (création)`);
        await Model.sync();
        console.log(`   ✓ table créée`);
        tablesPatched++;
      } else {
        console.log(`⚠ ${tableNameStr} : ${err.message}`);
      }
    }
  }

  // Nettoyage : supprimer users_backup si présent
  try {
    const tables = await qi.showAllTables();
    if (tables.includes('users_backup')) {
      console.log('\n🗑  Suppression de la table fantôme « users_backup »…');
      await qi.dropTable('users_backup');
      console.log('   ✓ supprimée');
    }
  } catch (err) {
    console.log(`   ⚠ nettoyage : ${err.message}`);
  }

  console.log('\n═══════════════════════════════════════════════════════════');
  console.log(
    `  Migration terminée : ${totalAdded} colonne(s) ajoutée(s) sur ${tablesPatched} table(s)`
  );
  console.log('═══════════════════════════════════════════════════════════\n');

  await sequelize.close();
  process.exit(0);
}

migrate().catch((err) => {
  console.error('❌ Erreur fatale :', err);
  process.exit(1);
});
