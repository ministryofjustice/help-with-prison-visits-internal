const { getDatabaseConnector } = require('../../databaseConnector')

module.exports = reason => {
  const db = getDatabaseConnector()

  return db('ClaimRejectionReason')
    .first('ClaimRejectionReasonId')
    .where('RejectionReason', reason)
    .then(result => {
      if (result) {
        return result.ClaimRejectionReasonId
      }
      return null
    })
}
