const { getDatabaseConnector } = require('../../databaseConnector')

module.exports = (claimId, niNumber, prisonerNumber, visitDate) => {
  const db = getDatabaseConnector()

  return db('Claim')
    .join('Visitor', 'Claim.EligibilityId', '=', 'Visitor.EligibilityId')
    .join('Prisoner', 'Claim.EligibilityId', '=', 'Prisoner.EligibilityId')
    .where({
      'Visitor.NationalInsuranceNumber': niNumber,
      'Prisoner.PrisonNumber': prisonerNumber,
      'Claim.DateOfJourney': visitDate,
    })
    .whereNot('Claim.ClaimId', claimId)
    .select('Claim.ClaimId', 'Claim.Reference')
    .then(data => {
      return data.map(item => {
        return {
          ClaimId: item.ClaimId,
          Reference: item.Reference,
        }
      })
    })
}
