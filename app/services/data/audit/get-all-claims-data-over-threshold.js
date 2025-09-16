const moment = require('moment')
const { getDatabaseConnector } = require('../../../databaseConnector')

module.exports = (startDate, endDate, threshold) => {
  const db = getDatabaseConnector()
  return db('Claim')
    .distinct()
    .select('Reference', 'ClaimId', 'PaymentAmount', 'Caseworker')
    .where('Status', 'APPROVED')
    .andWhere(function orWhereQuery() {
      this.orWhere('IsIncludedInAudit', null).orWhere('IsIncludedInAudit', false)
    })
    .andWhere('DateSubmitted', '>', moment(startDate).startOf('day').toDate())
    .andWhere('DateSubmitted', '<', moment(endDate).endOf('day').toDate())
    .andWhere('PaymentAmount', '>', threshold)
}
