const config = require('../../../knexfile').intweb
const knex = require('knex')(config)
const dateFormatter = require('../date-formatter')

module.exports = function (ref, eligibilityId, claimId, event, additionalData, note, caseworker, isInternal) {
  return knex('ClaimEvent').insert({
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
