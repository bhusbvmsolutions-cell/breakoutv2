const { Sequelize } = require('sequelize');
const path = require('path');
const fs = require('fs');
require('dotenv').config(); // Load environment variables

async function listModelsFromDB() {
  try {
    // Get database configuration from environment variables
    const dbConfig = {
      database: process.env.DB_NAME || process.env.DATABASE_NAME,
      username: process.env.DB_USER || process.env.DATABASE_USER,
      password: process.env.DB_PASSWORD || process.env.DATABASE_PASSWORD,
      host: process.env.DB_HOST || process.env.DATABASE_HOST || 'localhost',
      port: process.env.DB_PORT || process.env.DATABASE_PORT || 3306,
      dialect: process.env.DB_DIALECT || process.env.DATABASE_DIALECT || 'mysql'
    };

    // Validate required configuration
    const required = ['database', 'username', 'password'];
    const missing = required.filter(key => !dbConfig[key]);
    
    if (missing.length > 0) {
      throw new Error(`Missing required database configuration: ${missing.join(', ')}`);
    }

    console.log('📊 Database Configuration:');
    console.log(`   Host: ${dbConfig.host}`);
    console.log(`   Port: ${dbConfig.port}`);
    console.log(`   Database: ${dbConfig.database}`);
    console.log(`   Username: ${dbConfig.username}`);
    console.log(`   Dialect: ${dbConfig.dialect}\n`);

    // Create Sequelize instance with environment variables
    const sequelize = new Sequelize(
      dbConfig.database,
      dbConfig.username,
      dbConfig.password,
      {
        host: dbConfig.host,
        port: dbConfig.port,
        dialect: dbConfig.dialect,
        logging: false,
        dialectOptions: {
          // Add SSL if needed in production
          ssl: process.env.DB_SSL === 'true' ? {
            require: true,
            rejectUnauthorized: false
          } : undefined
        }
      }
    );

    // Test connection
    await sequelize.authenticate();
    console.log('✅ Database connected successfully\n');

    // Get all tables from database (works with MySQL, PostgreSQL, MariaDB)
    let tablesQuery;
    
    if (dbConfig.dialect === 'postgres') {
      tablesQuery = `
        SELECT table_name 
        FROM information_schema.tables 
        WHERE table_schema = 'public'
        AND table_type = 'BASE TABLE'
        ORDER BY table_name
      `;
    } else {
      // MySQL, MariaDB
      tablesQuery = `
        SELECT table_name 
        FROM information_schema.tables 
        WHERE table_schema = :database
        AND table_type = 'BASE TABLE'
        ORDER BY table_name
      `;
    }

    const [tables] = await sequelize.query(tablesQuery, {
      replacements: dbConfig.dialect !== 'postgres' ? { database: dbConfig.database } : {}
    });

    // Format the output
    const modelNames = tables.map(table => {
      const tableName = table.TABLE_NAME || table.table_name;
      return {
        table: tableName,
        model: tableName.split('_').map(word => 
          word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
        ).join(''),
        // Get column count for each table (optional)
        columns: 0 // Will be populated below
      };
    });

    // Get column counts for each table (optional)
    for (const model of modelNames) {
      try {
        const [columns] = await sequelize.query(`
          SELECT COUNT(*) as count 
          FROM information_schema.columns 
          WHERE table_schema = :database 
          AND table_name = :table
        `, {
          replacements: { 
            database: dbConfig.database,
            table: model.table 
          }
        });
        model.columns = parseInt(columns[0].count || columns[0].COUNT || 0);
      } catch (err) {
        // Skip if column count fails
      }
    }

    const output = {
      total: modelNames.length,
      timestamp: new Date().toISOString(),
      database: {
        name: dbConfig.database,
        host: dbConfig.host,
        port: dbConfig.port,
        dialect: dbConfig.dialect
      },
      models: modelNames
    };

    // Print to console
    console.log('📋 Tables found:');
    console.log(JSON.stringify(output, null, 2));

    // Save to file
    const outputPath = path.join(__dirname, '../database-models.json');
    fs.writeFileSync(
      outputPath,
      JSON.stringify(output, null, 2)
    );
    console.log(`\n✅ Models list saved to: ${outputPath}`);

    // Also save a simple names-only version
    const simpleOutput = {
      total: modelNames.length,
      timestamp: new Date().toISOString(),
      models: modelNames.map(m => m.model)
    };

    fs.writeFileSync(
      path.join(__dirname, '../model-names.json'),
      JSON.stringify(simpleOutput, null, 2)
    );
    console.log('✅ Simple model names saved to: model-names.json');

    await sequelize.close();
    return output;

  } catch (error) {
    console.error('❌ Error:', error.message);
    if (error.original) {
      console.error('   Details:', error.original.message);
    }
    return { error: error.message };
  }
}

// Run the function
listModelsFromDB();