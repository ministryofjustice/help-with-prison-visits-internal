const config = require('../../../knexfile').intweb
const knex = require('knex')(config)
const moment = require('moment')

module.exports = function (reference, eligibilityId, claimId, event, additionalData, note, caseworker, isInternal) {
  return knex('ClaimEvent').insert({
    EligibilityId: eligibilityId,
    Reference: reference,
    ClaimId: claimId,
    DateAdded: moment().toDate(),
    Event: event,
    AdditionalData: additionalData,
    Note: note,
    Caseworker: caseworker,
    IsInternal: isInternal
  })
}
