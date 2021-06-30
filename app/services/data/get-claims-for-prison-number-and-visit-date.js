const { getDatabaseConnector } = require('../../databaseConnector')

module.exports = function (claimId, prisonerNumber, visitDate) {
  const db = getDatabaseConnector()

  return db('Claim')
    .join('Visitor', 'Claim.EligibilityId', '=', 'Visitor.EligibilityId')
    .join('Prisoner', 'Claim.EligibilityId', '=', 'Prisoner.EligibilityId')
    .where({
      'Prisoner.PrisonNumber': prisonerNumber,
      'Claim.DateOfJourney': visitDate
    })
    .whereNot('Claim.ClaimId', claimId)
    .select(
      'Claim.ClaimId',
      'Claim.Reference'
    )
    .then(function (data) {
      return data.map(function (item) {
        return {
          ClaimId: item.ClaimId,
          Reference: item.Reference
        }
      })
    })
}
