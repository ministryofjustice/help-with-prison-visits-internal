const { getDatabaseConnector } = require('../../databaseConnector')

module.exports = function (reason) {
  const db = getDatabaseConnector()

  return db('ClaimRejectionReason')
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
