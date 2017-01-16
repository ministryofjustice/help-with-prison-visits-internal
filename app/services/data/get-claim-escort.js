const config = require('../../../knexfile').intweb
const knex = require('knex')(config)

module.exports = function (claimId) {
  return knex('ClaimEscort')
    .select('ClaimEscortId')
    .where('ClaimId', claimId)
}
