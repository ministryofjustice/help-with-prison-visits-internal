const {
  getDatabaseConnector
} = require('../../../databaseConnector')

module.exports = function (startDate, endDate) {
  const db = getDatabaseConnector()
  return db('Claim')
    .count('ClaimId AS Count')
    .whereIn('Status', [
      'APPROVED'
    ])
    .whereIn('IsIncludedInAudit', [
      false, null
    ])
    .andWhere('DateSubmitted', '>', startDate.endOf('day').toDate())
    .andWhere('DateSubmitted', '<', endDate.endOf('day').toDate())
}
