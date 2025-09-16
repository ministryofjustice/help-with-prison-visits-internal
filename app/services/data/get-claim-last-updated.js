const { getDatabaseConnector } = require('../../databaseConnector')

module.exports = claimId => {
  const db = getDatabaseConnector()

  return db('Claim')
    .where('Claim.ClaimId', claimId)
    .first('Claim.LastUpdated', 'Claim.Status', 'Claim.AssignedTo', 'Claim.AssignmentExpiry')
}
