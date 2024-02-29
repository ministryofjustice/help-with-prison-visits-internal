const moment = require('moment')
const {
  getDatabaseConnector
} = require('../../../databaseConnector')

module.exports = function (startDate, endDate, percent, threshold) {
  const db = getDatabaseConnector()
  return db('Claim')
    .select('Reference', 'ClaimId', 'PaymentAmount')
    .where('Status', 'APPROVED')
    .andWhere(function () {
      this.where('IsIncludedInAudit', false)
        .orWhereNull('IsIncludedInAudit')
    })
    .andWhere('DateSubmitted', '>', moment(startDate).startOf('day').toDate())
    .andWhere('DateSubmitted', '<', moment(endDate).endOf('day').toDate())
    .andWhere('PaymentAmount', '<=', threshold)
    .orderByRaw('NEWID()')
    .limit(percent)
}
