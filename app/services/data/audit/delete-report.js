const {
  getDatabaseConnector
} = require('../../../databaseConnector')

module.exports = function (reportId) {
  const db = getDatabaseConnector()
  return db('AuditReport')
    .update({
      IsDeleted: true
    })
    .where({
      ReportId: reportId
    })
}
