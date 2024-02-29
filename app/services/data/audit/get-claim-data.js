const {
  getDatabaseConnector
} = require('../../../databaseConnector')

module.exports = function (reference, reportId) {
  const db = getDatabaseConnector()
  return db('ReportData')
    .select('ClaimId')
    .select('Band5Validity')
    .select('Band5Description')
    .select('Band5Username')
    .select('Band9Validity')
    .select('Band9Description')
    .select('Band9Username')
    .where('Reference', reference)
    .andWhere('ReportId', reportId)
}
