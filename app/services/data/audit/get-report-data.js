const {
  getDatabaseConnector
} = require('../../../databaseConnector')

module.exports = function (reportId) {
  const db = getDatabaseConnector()
  return db('AuditReport')
    .select('IsDeleted')
    .where('ReportId', reportId)
    .then(function (result) {
      if (!result.length || result[0].IsDeleted) {
        return null
      } else {
        return db('ReportData')
          .where('ReportId', reportId)
      }
    })
}
