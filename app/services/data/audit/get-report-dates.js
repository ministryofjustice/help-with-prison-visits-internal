const { getDatabaseConnector } = require('../../../databaseConnector')

module.exports = reportId => {
  const db = getDatabaseConnector()
  return db('AuditReport').select('StartDate').select('EndDate').where('ReportId', reportId)
}
