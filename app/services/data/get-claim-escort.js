const config = require('../../../knexfile').intweb
const knex = require('knex')(config)

module.exports = function (claimId) {
  return knex('ClaimEscort')
    .count('ClaimEscortId AS Count')
    .where('ClaimId', claimId)
}
