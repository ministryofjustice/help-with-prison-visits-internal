const config = require('../../../knexfile').intweb
const knex = require('knex')(config)

module.exports = function (reference, currentClaimId) {
  return knex('Claim')
    .where({
      Reference: reference,
      IsOverpaid: true
    })
    .whereNot('ClaimId', currentClaimId)
    .orderBy('DateOfJourney', 'asc')
}
