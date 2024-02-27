const {
  getDatabaseConnector
} = require('../../../databaseConnector')

module.exports = function (claimData, reference, reportId) {
  const db = getDatabaseConnector()
  return db('ReportData')
    .update(claimData)
    .where('Reference', reference)
    .andWhere('ReportId', reportId)
}
