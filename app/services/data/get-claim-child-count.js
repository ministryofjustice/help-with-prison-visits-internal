const { getDatabaseConnector } = require('../../databaseConnector')

module.exports = function (claimId) {
  const db = getDatabaseConnector()

  return db('ClaimChild')
    .count('ClaimChildId AS Count')
    .where('ClaimId', claimId)
}
