require('dotenv').config()
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
        encrypt: false,
        enableArithAbort: true
      }
    },
    pool: {
      min: 2,
      max: 10
    },
    acquireConnectionTimeout: 500000
  }
}
