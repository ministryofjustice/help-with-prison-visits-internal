const {
  getDatabaseConnector
} = require('../../../databaseConnector')

module.exports = function () {
  const db = getDatabaseConnector()
  return db('AuditReport')
    .where({
      IsDeleted: false
    })
}
