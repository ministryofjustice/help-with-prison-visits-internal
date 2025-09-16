const { getDatabaseConnector } = require('../../../databaseConnector')

module.exports = reportId => {
  const db = getDatabaseConnector()
  return db('AuditReport')
    .select('IsDeleted')
    .where('ReportId', reportId)
    .then(result => {
      if (!result.length || result[0].IsDeleted) {
        return null
      }
      return db('ReportData').where('ReportId', reportId)
    })
}
