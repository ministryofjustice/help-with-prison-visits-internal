const { getDatabaseConnector } = require('../../databaseConnector')

module.exports = () => {
  const db = getDatabaseConnector()

  return db('ClaimChild').select('ClaimId').count('ClaimChildId AS Count').groupBy('ClaimId')
}
