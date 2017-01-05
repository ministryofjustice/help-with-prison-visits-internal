const config = require('../../../knexfile').intweb
const knex = require('knex')(config)
const moment = require('moment')

module.exports = function (query, offset, limit) {
  return knex('Claim')
    .join('Eligibility', 'Claim.EligibilityId', '=', 'Eligibility.EligibilityId')
    .join('Visitor', 'Eligibility.EligibilityId', '=', 'Visitor.EligibilityId')
    .join('Prisoner', 'Eligibility.EligibilityId', '=', 'Prisoner.EligibilityId')
    .whereIn('Eligibility.Reference', query)
    .orWhereIn('Visitor.NationalInsuranceNumber', query)
    .orWhereRaw(`CONCAT(Visitor.FirstName, ' ', Visitor.LastName) like '%${query}%'`)
    .orWhereIn('Prisoner.PrisonNumber', query)
    .count('Claim.ClaimId AS Count')
    .then(function (count) {
      return knex('Claim')
        .join('Eligibility', 'Claim.EligibilityId', '=', 'Eligibility.EligibilityId')
        .join('Visitor', 'Eligibility.EligibilityId', '=', 'Visitor.EligibilityId')
        .join('Prisoner', 'Eligibility.EligibilityId', '=', 'Prisoner.EligibilityId')
        .whereIn('Eligibility.Reference', query)
        .orWhereIn('Visitor.NationalInsuranceNumber', query)
        .orWhereRaw(`CONCAT(Visitor.FirstName, ' ', Visitor.LastName) like '%${query}%'`)
        .orWhereIn('Prisoner.PrisonNumber', query)
        .select('Eligibility.Reference', 'Visitor.FirstName', 'Visitor.LastName', 'Claim.DateSubmitted', 'Claim.DateOfJourney', 'Claim.ClaimType', 'Claim.ClaimId')
        .orderBy('Claim.DateSubmitted', 'asc')
        .limit(limit)
        .offset(offset)
        .then(function (claims) {
          claims.forEach(function (claim) {
            claim.DateSubmittedFormatted = moment(claim.DateSubmitted).format('DD/MM/YYYY - HH:mm')
            claim.Name = claim.FirstName + ' ' + claim.LastName
          })
          return {claims: claims, total: count[0]}
        })
    })
}
