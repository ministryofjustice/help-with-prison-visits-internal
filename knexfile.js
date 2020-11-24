const config = require('./config')

module.exports = {
  intweb: {
    client: 'mssql',
    connection: {
      host: config.DATABASE_SERVER,
      user: config.INT_WEB_USERNAME,
      password: config.INT_WEB_PASSWORD,
      database: config.DATABASE,
      options: {
        encrypt: true,
        enableArithAbort: true
      }
    },
    pool: {
      min: 2,
      max: 10
    },
    acquireConnectionTimeout: 500000
  },

  migrations: {
    client: 'mssql',
    connection: {
      host: config.DATABASE_SERVER,
      user: config.INT_MIGRATION_USERNAME,
      password: config.INT_MIGRATION_PASSWORD,
      database: config.DATABASE,
      options: {
        encrypt: true,
        enableArithAbort: true
      }
    },
    migrations: {
      tableName: 'knex_int_migrations'
    }
    // , debug: true // Uncomment to see knex generated SQL
  }
}
