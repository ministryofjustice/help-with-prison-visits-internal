const config = require('../../../knexfile').intweb
const knex = require('knex')(config)
const moment = require('moment')
const insertClaimEvent = require('./insert-claim-event')

module.exports = function (claimId, isTrusted, untrustedReason) {
  return getEligibilityData(claimId)
    .then(function (eligibilityData) {
      if (isTrusted !== eligibilityData.IsTrusted) {
        var updateObject = {
          isTrusted: isTrusted,
          UntrustedDate: !isTrusted ? moment().toDate() : null,
          UntrustedReason: !isTrusted ? untrustedReason : null
        }

        return knex('Eligibility')
          .where('EligibilityId', eligibilityData.EligibilityId)
          .update(updateObject)
          .then(function () {
            var event = isTrusted ? 'ALLOW-AUTO-APPROVAL' : 'DISABLE-AUTO-APPROVAL'
            return insertClaimEvent(eligibilityData.Reference, eligibilityData.EligibilityId, claimId, event, null, untrustedReason, null, true)
          })
      }
    })
}

function getEligibilityData (claimId) {
  return knex('Claim')
    .join('Eligibility', 'Claim.EligibilityId', '=', 'Eligibility.EligibilityId')
    .where('ClaimId', claimId)
    .first()
    .select('Eligibility.EligibilityId', 'Eligibility.Reference', 'Eligibility.IsTrusted')
}
