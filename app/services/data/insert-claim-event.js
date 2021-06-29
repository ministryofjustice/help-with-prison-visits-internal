const { getDatabaseConnector } = require('../../databaseConnector')
const dateFormatter = require('../date-formatter')

module.exports = function (ref, eligibilityId, claimId, event, additionalData, note, caseworker, isInternal) {
  const db = getDatabaseConnector()

  return db('ClaimEvent').insert({
    EligibilityId: eligibilityId,
    Reference: ref,
    ClaimId: claimId,
    DateAdded: dateFormatter.now().toDate(),
    Event: event,
    AdditionalData: additionalData,
    Note: note,
    Caseworker: caseworker,
    IsInternal: isInternal
  })
}
