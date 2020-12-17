const config = require('../../../knexfile').intweb
const knex = require('knex')(config)
const RejectionReason = require('../domain/claim-rejection-reason')

module.exports = function () {
  var rejectionReasons = []
  return knex('IntSchema.ClaimRejectionReason')
    .select('ClaimRejectionReasonId', 'RejectionReason', 'IsEnabled')
    .then(function (results) {
      results.forEach(function (result) {
        rejectionReasons.push(new RejectionReason(result.ClaimRejectionReasonId, result.RejectionReason, result.IsEnabled))
      })
      return rejectionReasons
    })
}
