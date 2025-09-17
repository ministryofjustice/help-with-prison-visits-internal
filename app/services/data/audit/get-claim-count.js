const { getDatabaseConnector } = require('../../../databaseConnector')

module.exports = (startDate, endDate) => {
  const db = getDatabaseConnector()
  return db('Claim')
    .count('ClaimId AS Count')
    .where('Status', 'APPROVED')
    .andWhere(function andWhereQuery() {
      this.where('IsIncludedInAudit', false).orWhereNull('IsIncludedInAudit')
    })
    .andWhere('DateSubmitted', '>', startDate.startOf('day').toDate())
    .andWhere('DateSubmitted', '<', endDate.endOf('day').toDate())
}
