const moment = require('moment')
const { getDatabaseConnector } = require('../../../databaseConnector')

module.exports = (startDate, endDate, percent, threshold) => {
  const db = getDatabaseConnector()
  return db('Claim')
    .distinct()
    .select('Reference', 'ClaimId', 'PaymentAmount', 'Caseworker')
    .where('Status', 'APPROVED')
    .andWhere(function andWhereQuery() {
      this.where('IsIncludedInAudit', false).orWhereNull('IsIncludedInAudit')
    })
    .andWhere('DateSubmitted', '>', moment(startDate).startOf('day').toDate())
    .andWhere('DateSubmitted', '<', moment(endDate).endOf('day').toDate())
    .andWhere('PaymentAmount', '<=', threshold)
    .orderBy('ClaimId')
    .limit(percent)
}
