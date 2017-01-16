const config = require('../../../knexfile').intweb
const knex = require('knex')(config)

module.exports = function (claimId) {
  return knex('ClaimChild')
    .count('ClaimChildId AS Count')
    .where('ClaimId', claimId)
}
