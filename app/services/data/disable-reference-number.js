const config = require('../../../knexfile').intweb
const knex = require('knex')(config)
const insertClaimEvent = require('./insert-claim-event')
const claimEventEnum = require('../../constants/claim-event-enum')

module.exports = function (claimId, reference, note, email) {
  return knex('Eligibility')
    .where('Reference', reference)
    .update({ ReferenceDisabled: true, DisabledReason: note })
    .then(function () {
      knex('Claim')
        .where('ClaimId', claimId)
        .first('EligibilityId')
        .then(function (eligibility) {
          var eligibilityId = eligibility.EligibilityId
          return insertClaimEvent(reference, eligibilityId, claimId, claimEventEnum.REFERENCE_DISABLED.value, null, note, email, true)
        })
    })
}
