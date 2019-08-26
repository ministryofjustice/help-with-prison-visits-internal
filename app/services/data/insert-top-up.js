const config = require('../../../knexfile').intweb
const knex = require('knex')(config)
const insertClaimEvent = require('./insert-claim-event')
const claimEventEnum = require('../../constants/claim-event-enum')

module.exports = function (claim, topup, caseworker) {
  return knex('IntSchema.TopUp')
    .insert({
      ClaimId: claim.ClaimId,
      IsPaid: false,
      Caseworker: caseworker,
      TopUpAmount: topup.amount,
      Reason: topup.reason
    }).then(function () {
      return insertClaimEvent(claim.Reference, claim.EligibilityId, claim.ClaimId, claimEventEnum.TOP_UP_SUBMITTED.value, null, topup.reason, caseworker, true)
    })
}
