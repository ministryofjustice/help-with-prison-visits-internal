module.exports = {
  intweb: {
    client: 'mssql',
    connection: {
      host: process.env.APVS_DATABASE_SERVER,
      user: process.env.APVS_INT_WEB_USERNAME,
      password: process.env.APVS_INT_WEB_PASSWORD,
      database: process.env.APVS_DATABASE,
      options: {
        encrypt: true
      }
    },
    pool: {
      min: 2,
      max: 10
    }
  },

  migrations: {
    client: 'mssql',
    connection: {
      host: process.env.APVS_DATABASE_SERVER,
      user: process.env.APVS_INT_MIGRATION_USERNAME,
      password: process.env.APVS_INT_MIGRATION_PASSWORD,
      database: process.env.APVS_DATABASE,
      options: {
        encrypt: true
      }
    },
    migrations: {
      tableName: 'knex_int_migrations'
    }
    // , debug: true // Uncomment to see knex generated SQL
  }
}
