const { getDatabaseConnector } = require('../../databaseConnector')
const claimStatusEnum = require('../../constants/claim-status-enum')
const dateFormatter = require('../date-formatter')

module.exports = function (reference, claimId) {
  const db = getDatabaseConnector()

  return db('Claim')
    .where({ Reference: reference, ClaimId: claimId })
    .update({ Status: claimStatusEnum.REQUEST_INFO_PAYMENT.value, PaymentStatus: null, LastUpdated: dateFormatter.now().toDate(), DateApproved: null })
}
