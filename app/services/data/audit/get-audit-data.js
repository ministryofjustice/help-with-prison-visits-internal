const { getDatabaseConnector } = require('../../../databaseConnector')

module.exports = () => {
  const db = getDatabaseConnector()
  return db('AuditReport').where({
    IsDeleted: false,
  })
}
