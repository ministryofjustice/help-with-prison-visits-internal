const { getDatabaseConnector } = require('../../databaseConnector')
const insertClaimEvent = require('./insert-claim-event')
const claimEventEnum = require('../../constants/claim-event-enum')
const dateFormatter = require('../date-formatter')

module.exports = (claim, topup, caseworker) => {
  const db = getDatabaseConnector()

  return db('TopUp')
    .insert({
      ClaimId: claim.ClaimId,
      PaymentStatus: 'PENDING',
      Caseworker: caseworker,
      TopUpAmount: topup.amount,
      Reason: topup.reason,
      DateAdded: dateFormatter.now().toDate(),
    })
    .then(() => {
      return insertClaimEvent(
        claim.Reference,
        claim.EligibilityId,
        claim.ClaimId,
        claimEventEnum.TOP_UP_SUBMITTED.value,
        null,
        topup.reason,
        caseworker,
        true,
      )
    })
}
