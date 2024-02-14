const moment = require('moment')
const {
  getDatabaseConnector
} = require('../../../databaseConnector')

module.exports = function (startDate, endDate, percent, threshold) {
  const db = getDatabaseConnector()
  return db('Claim')
    .select('Reference')
    .select('ClaimId')
    .select('PaymentAmount')
    .whereIn('Status', [
      'APPROVED'
    ])
    .andWhere('DateSubmitted', '>', moment(startDate).endOf('day').toDate())
    .andWhere('DateSubmitted', '<', moment(endDate).endOf('day').toDate())
    .andWhere('PaymentAmount', '<=', threshold)
    .andWhere('IsIncludedInAudit', null)
    .orderByRaw('NEWID()')
    .limit(percent)
}
