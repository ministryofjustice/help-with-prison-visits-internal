const {
  getDatabaseConnector
} = require('../../../databaseConnector')

module.exports = function (claimData, reference) {
  const db = getDatabaseConnector()
  return db('ReportData')
    .update(claimData)
    .where('Reference', reference)
}
