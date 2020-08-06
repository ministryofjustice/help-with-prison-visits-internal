const config = require('../../../knexfile').intweb
const knex = require('knex')(config)
const insertClaimEvent = require('./insert-claim-event')
const claimEventEnum = require('../../constants/claim-event-enum')
const dateFormatter = require('../date-formatter')

module.exports = function (claim, topup, caseworker) {
  return knex('IntSchema.TopUp')
    .update({
      TopUpAmount: topup.amount,
      Reason: topup.reason,
      DateAdded: dateFormatter.now().toDate()
    })
    .where({ ClaimId: claim.ClaimId, PaymentStatus: 'PENDING' })
    .then(function () {
      return insertClaimEvent(claim.Reference, claim.EligibilityId, claim.ClaimId, claimEventEnum.TOP_UP_UPDATED.value, null, topup.reason, caseworker, true)
    })
}
