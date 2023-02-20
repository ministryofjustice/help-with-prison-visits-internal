const { getDatabaseConnector } = require('../../databaseConnector')
const insertClaimEvent = require('./insert-claim-event')
const claimEventEnum = require('../../constants/claim-event-enum')

module.exports = function (claimId, reference, note, email) {
  const db = getDatabaseConnector()

  return db('Eligibility')
    .where('Reference', reference)
    .update({ ReferenceDisabled: false, ReEnabledReason: note })
    .then(function () {
      db('Claim')
        .where('ClaimId', claimId)
        .first('EligibilityId')
        .then(function (eligibility) {
          const eligibilityId = eligibility.EligibilityId
          return insertClaimEvent(reference, eligibilityId, claimId, claimEventEnum.REFERENCE_RE_ENABLED.value, null, note, email, true)
        })
    })
}
