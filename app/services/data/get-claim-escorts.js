const { getDatabaseConnector } = require('../../databaseConnector')

module.exports = function (claimIds) {
  const db = getDatabaseConnector()

  return db('ClaimEscort')
    .select('ClaimEscortId', 'ClaimId')
    .whereIn('ClaimId', claimIds)
}
