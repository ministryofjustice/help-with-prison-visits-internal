const { getDatabaseConnector } = require('../../databaseConnector')

module.exports = function (claimId) {
  const db = getDatabaseConnector()

  return db('ClaimEscort')
    .select('ClaimEscortId')
    .where('ClaimId', claimId)
}
