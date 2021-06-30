const { getDatabaseConnector } = require('../../databaseConnector')
const RejectionReason = require('../domain/claim-rejection-reason')

module.exports = function () {
  var rejectionReasons = []
  const db = getDatabaseConnector()

  return db('ClaimRejectionReason')
    .select('ClaimRejectionReasonId', 'RejectionReason', 'IsEnabled')
    .then(function (results) {
      results.forEach(function (result) {
        rejectionReasons.push(new RejectionReason(result.ClaimRejectionReasonId, result.RejectionReason, result.IsEnabled))
      })
      return rejectionReasons
    })
}
