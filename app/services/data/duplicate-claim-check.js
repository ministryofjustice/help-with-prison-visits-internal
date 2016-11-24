const config = require('../../../knexfile').intweb
const knex = require('knex')(config)

module.exports = function (claimId, niNumber, prisonerNumber, visitDate) {
  return knex('Claim')
    .join('Visitor', 'Claim.EligibilityId', '=', 'Visitor.EligibilityId')
    .join('Prisoner', 'Claim.EligibilityId', '=', 'Prisoner.EligibilityId')
    .where({
      'Visitor.NationalInsuranceNumber': niNumber,
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
