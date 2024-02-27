const {
  getDatabaseConnector
} = require('../../../databaseConnector')

module.exports = function (startDate, endDate, threshold) {
  const db = getDatabaseConnector()
  return db('Claim')
    .count('ClaimId AS Count')
    .where('Status', 'APPROVED')
    .andWhere(function () {
      this.where('IsIncludedInAudit', false)
        .orWhereNull('IsIncludedInAudit')
    })
    .andWhere('DateSubmitted', '>', startDate.startOf('day').toDate())
    .andWhere('DateSubmitted', '<', endDate.endOf('day').toDate())
    .andWhere('PaymentAmount', '>', threshold)
}
