const { getDatabaseConnector } = require('../../databaseConnector')

module.exports = function (reference, currentClaimId) {
  const db = getDatabaseConnector()

  return db('Claim')
    .where({
      Reference: reference,
      IsOverpaid: true
    })
    .whereNot('ClaimId', currentClaimId)
    .orderBy('DateOfJourney', 'asc')
}
