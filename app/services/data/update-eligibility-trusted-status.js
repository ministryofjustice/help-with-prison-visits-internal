const config = require('../../../knexfile').intweb
const knex = require('knex')(config)
const dateFormatter = require('../date-formatter')
const insertClaimEvent = require('./insert-claim-event')
const claimEventEnum = require('../../constants/claim-event-enum')

module.exports = function (claimId, isTrusted, untrustedReason) {
  return getEligibilityData(claimId)
    .then(function (eligibilityData) {
      if (isTrusted !== eligibilityData.IsTrusted) {
        var updateObject = {
          isTrusted: isTrusted,
          UntrustedDate: !isTrusted ? dateFormatter.now().toDate() : null,
          UntrustedReason: !isTrusted ? untrustedReason : null
        }

        return knex('Eligibility')
          .where('EligibilityId', eligibilityData.EligibilityId)
          .update(updateObject)
          .then(function () {
            var event = isTrusted ? claimEventEnum.ALLOW_AUTO_APPROVAL.value : claimEventEnum.DISABLE_AUTO_APPROVAL.value
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
