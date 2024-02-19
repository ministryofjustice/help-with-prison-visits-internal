const {
  getDatabaseConnector
} = require('../../../databaseConnector')

module.exports = function (startDate, endDate, threshold) {
  const db = getDatabaseConnector()
  return db('Claim')
    .count('ClaimId AS Count')
    .whereIn('Status', [
      'APPROVED'
    ])
    .andWhere('DateSubmitted', '>', startDate.endOf('day').toDate())
    .andWhere('DateSubmitted', '<', endDate.endOf('day').toDate())
    .andWhere('PaymentAmount', '>', threshold)
    .andWhere('IsIncludedInAudit', null)
}