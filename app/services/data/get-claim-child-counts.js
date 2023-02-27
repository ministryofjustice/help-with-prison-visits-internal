const { getDatabaseConnector } = require('../../databaseConnector')

module.exports = function (claimIds) {
  const db = getDatabaseConnector()

  return db('ClaimChild')
    .select('ClaimId')
    .count('ClaimChildId AS Count')
    .groupBy('ClaimId')
}
