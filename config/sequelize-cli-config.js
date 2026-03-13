require('dotenv').config();

module.exports = {
  development: {
    username: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || null,
    database: process.env.DB_NAME || 'breakoutv2_dev',
    host: process.env.DB_HOST || '127.0.0.1',
    port: process.env.DB_PORT || 3306,
    dialect: 'mysql',
    dialectOptions: {
      connectTimeout: 60000
    },
    pool: {
      max: 5,
      min: 0,
      acquire: 30000,
      idle: 10000
    },
    logging: console.log,
    seederStorage: 'sequelize',
    seederStorageTableName: 'SequelizeData',
    migrationStorageTableName: 'SequelizeMeta'
  },
  test: {
    username: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || null,
    database: process.env.DB_NAME ? process.env.DB_NAME + '_test' : 'breakoutv2_test',
    host: process.env.DB_HOST || '127.0.0.1',
    port: process.env.DB_PORT || 3306,
    dialect: 'mysql',
    dialectOptions: {
      connectTimeout: 60000
    },
    logging: false,
    seederStorage: 'sequelize',
    seederStorageTableName: 'SequelizeData',
    migrationStorageTableName: 'SequelizeMeta'
  },
  production: {
    username: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    host: process.env.DB_HOST,
    port: process.env.DB_PORT || 3306,
    dialect: 'mysql',
    dialectOptions: {
      connectTimeout: 60000,
      ssl: process.env.DB_SSL === 'true' ? {
        require: true,
        rejectUnauthorized: false
      } : false
    },
    pool: {
      max: 10,
      min: 2,
      acquire: 60000,
      idle: 20000
    },
    logging: false,
    seederStorage: 'sequelize',
    seederStorageTableName: 'SequelizeData',
    migrationStorageTableName: 'SequelizeMeta'
  }
};