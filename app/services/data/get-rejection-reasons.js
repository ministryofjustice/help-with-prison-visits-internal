const { getDatabaseConnector } = require('../../databaseConnector')
const RejectionReason = require('../domain/claim-rejection-reason')

module.exports = () => {
  const rejectionReasons = []
  const db = getDatabaseConnector()

  return db('ClaimRejectionReason')
    .select('ClaimRejectionReasonId', 'RejectionReason', 'IsEnabled')
    .then(results => {
      results.forEach(result => {
        rejectionReasons.push(
          new RejectionReason(result.ClaimRejectionReasonId, result.RejectionReason, result.IsEnabled),
        )
      })
      return rejectionReasons
    })
}
