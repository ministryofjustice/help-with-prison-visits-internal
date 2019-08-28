const config = require('../../../knexfile').intweb
const knex = require('knex')(config)
const insertClaimEvent = require('./insert-claim-event')
const claimEventEnum = require('../../constants/claim-event-enum')

module.exports = function (claim, topup, caseworker) {
  return knex('IntSchema.TopUp')
    .insert({
      ClaimId: claim.ClaimId,
      Reference: claim.Reference,
      IsPaid: false,
      Caseworker: caseworker,
      TopUpAmount: topup.amount,
      Reason: topup.reason,
      PaymentMethod: claim.PaymentMethod
    }).then(function () {
      return insertClaimEvent(claim.Reference, claim.EligibilityId, claim.ClaimId, claimEventEnum.TOP_UP_SUBMITTED.value, null, topup.reason, caseworker, true)
    })
}
