const { getDatabaseConnector } = require('../../databaseConnector')
const insertClaimEvent = require('./insert-claim-event')
const claimEventEnum = require('../../constants/claim-event-enum')

module.exports = (claimId, reference, note, email) => {
  const db = getDatabaseConnector()

  return db('Eligibility')
    .where('Reference', reference)
    .update({ ReferenceDisabled: true, DisabledReason: note })
    .then(() => {
      db('Claim')
        .where('ClaimId', claimId)
        .first('EligibilityId')
        .then(eligibility => {
          const eligibilityId = eligibility.EligibilityId
          return insertClaimEvent(
            reference,
            eligibilityId,
            claimId,
            claimEventEnum.REFERENCE_DISABLED.value,
            null,
            note,
            email,
            true,
          )
        })
    })
}
