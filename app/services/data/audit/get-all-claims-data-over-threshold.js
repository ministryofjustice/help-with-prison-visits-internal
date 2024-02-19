const moment = require('moment')
const {
  getDatabaseConnector
} = require('../../../databaseConnector')

module.exports = function (startDate, endDate, threshold) {
  const db = getDatabaseConnector()
  return db('Claim')
    .select('Reference')
    .select('ClaimId')
    .select('PaymentAmount')
    .whereIn('IsIncludedInAudit', [
      false, null, 0
    ])
    .andWhere(Status, 'APPROVED')
    .andWhere('DateSubmitted', '>', moment(startDate).endOf('day').toDate())
    .andWhere('DateSubmitted', '<', moment(endDate).endOf('day').toDate())
    .andWhere('PaymentAmount', '>', threshold)
}
