const config = require('../../../knexfile').intweb
const knex = require('knex')(config)

module.exports = function (claimId) {
  return knex('Claim')
    .where('Claim.ClaimId', claimId)
    .first('Claim.LastUpdated', 'Claim.Status', 'Claim.AssignedTo')
}
