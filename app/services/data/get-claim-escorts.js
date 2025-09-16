const { getDatabaseConnector } = require('../../databaseConnector')

module.exports = () => {
  const db = getDatabaseConnector()

  return db('ClaimEscort').select('ClaimEscortId', 'ClaimId')
}
