const config = require('../../../knexfile').intweb
const knex = require('knex')(config)

module.exports = function (reason) {
  return knex('IntSchema.ClaimRejectionReason')
    .first('ClaimRejectionReasonId')
    .where('RejectionReason', reason)
    .then(function (result) {
      if (result) {
        return result.ClaimRejectionReasonId
      } else {
        return null
      }
    })
}
