const { sequelize } = require('../models');
const { Umzug, SequelizeStorage } = require('umzug');
const path = require('path');

async function runMigrations() {
  console.log('🔄 Running migrations...\n');
  
  const umzug = new Umzug({
    migrations: {
      glob: path.join(__dirname, '../migrations/*.js'),
      resolve: ({ name, path, context }) => {
        const migration = require(path);
        return {
          name,
          up: async () => migration.up(context, sequelize.Sequelize),
          down: async () => migration.down(context, sequelize.Sequelize),
        };
      },
    },
    context: sequelize.getQueryInterface(),
    storage: new SequelizeStorage({ sequelize }),
    logger: console,
  });

  try {
    const migrations = await umzug.up();
    console.log(`\n✅ ${migrations.length} migrations executed successfully`);
    
    // Show migration status
    const executed = await umzug.executed();
    console.log('\n📋 Executed migrations:');
    executed.forEach(m => console.log(`   - ${m.name}`));
    
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  runMigrations();
}

module.exports = runMigrations;