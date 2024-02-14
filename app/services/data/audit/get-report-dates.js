const {
  getDatabaseConnector
} = require('../../../databaseConnector')

module.exports = function (reportId) {
  const db = getDatabaseConnector()
  return db('AuditReport')
    .select('StartDate')
    .select('EndDate')
    .where('ReportId', reportId)
}
