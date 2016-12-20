const config = require('../../../knexfile').intweb
const knex = require('knex')(config)
const insertClaimEvent = require('./insert-claim-event')

module.exports = function (claimId, isUntrusted, untrustedReason) {
  return getEligibilityData(claimId)
    .then(function (eligibilityData) {
      return knex('Eligibility')
        .where('EligibilityId', eligibilityData.EligibilityId)
        .update({
          IsUntrusted: isUntrusted,
          UntrustedReason: untrustedReason
        })
        .then(function () {
          return insertClaimEvent(eligibilityData.Reference, eligibilityData.EligibilityId, claimId, 'UPDATE-CLAIM-TRUSTED-STATUS', null, untrustedReason, null, true)
        })
    })
}

function getEligibilityData (claimId) {
  return knex('Claim')
    .where('ClaimId', claimId)
    .first()
    .select('EligibilityId', 'Reference')
}
