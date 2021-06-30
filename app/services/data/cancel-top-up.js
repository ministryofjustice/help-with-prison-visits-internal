const { getDatabaseConnector } = require('../../databaseConnector')
const insertClaimEvent = require('./insert-claim-event')
const claimEventEnum = require('../../constants/claim-event-enum')
const dateFormatter = require('../date-formatter')

module.exports = function (claim, caseworker) {
  const db = getDatabaseConnector()

  return db('TopUp')
    .update({
      PaymentStatus: 'CANCELLED',
      DateAdded: dateFormatter.now().toDate()
    })
    .where({ ClaimId: claim.ClaimId, PaymentStatus: 'PENDING' })
    .then(function () {
      return insertClaimEvent(claim.Reference, claim.EligibilityId, claim.ClaimId, claimEventEnum.TOP_UP_CANCELLED.value, null, '', caseworker, true)
    })
}
