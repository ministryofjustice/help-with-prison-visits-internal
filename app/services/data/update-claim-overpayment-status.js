const config = require('../../../knexfile').intweb
const knex = require('knex')(config)

const insertClaimEvent = require('./insert-claim-event')

module.exports = function (claim, overpaymentResponse) {
  console.dir(claim)
  console.dir(overpaymentResponse)

  var eventLabel = overpaymentResponse.isOverpaid ? 'OVERPAID-CLAIM' : 'OVERPAID-CLAIM-RESOLVED'
  var updateClaim = {
    IsOverpaid: overpaymentResponse.isOverpaid
  }

  if (overpaymentResponse.isOverpaid) {
    updateClaim.OverpaymentAmount = overpaymentResponse.amount
    updateClaim.RemainingOverpaymentAmount = overpaymentResponse.amount
    updateClaim.OverpaymentReason = overpaymentResponse.reason
  }
  console.dir(updateClaim)

  return knex('Claim')
    .where('ClaimId', claim.ClaimId)
    .update(updateClaim)
    .then(function () {
      return insertClaimEvent(claim.Reference, claim.EligibilityId, claim.ClaimId, eventLabel, null, null, null, true)
    })
}
