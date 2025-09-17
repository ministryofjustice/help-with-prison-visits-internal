const { getDatabaseConnector } = require('../../../databaseConnector')

module.exports = (reference, reportId) => {
  const db = getDatabaseConnector()
  return db('ReportData')
    .select(
      'ClaimId',
      'Band5Validity',
      'Band5Description',
      'Band5Username',
      'Band9Validity',
      'Band9Description',
      'Band9Username',
    )
    .where('Reference', reference)
    .andWhere('ReportId', reportId)
}
