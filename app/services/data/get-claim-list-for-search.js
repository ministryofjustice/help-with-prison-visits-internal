const config = require('../../../knexfile').intweb
const knex = require('knex')(config)
const moment = require('moment')

module.exports = function (query, offset, limit) {
  query = `%${query}%` // wrap in % for where clause
  return knex('Claim')
    .join('Eligibility', 'Claim.EligibilityId', '=', 'Eligibility.EligibilityId')
    .join('Visitor', 'Eligibility.EligibilityId', '=', 'Visitor.EligibilityId')
    .join('Prisoner', 'Eligibility.EligibilityId', '=', 'Prisoner.EligibilityId')
    .where('Claim.Reference', 'like', query)
    .orWhere('Visitor.NationalInsuranceNumber', 'like', query)
    .orWhereRaw(`CONCAT(Visitor.FirstName, ' ', Visitor.LastName) like '${query}'`)
    .orWhere('Prisoner.PrisonNumber', 'like', query)
    .count('Claim.ClaimId AS Count')
    .then(function (count) {
      return knex('Claim')
        .join('Eligibility', 'Claim.EligibilityId', '=', 'Eligibility.EligibilityId')
        .join('Visitor', 'Eligibility.EligibilityId', '=', 'Visitor.EligibilityId')
        .join('Prisoner', 'Eligibility.EligibilityId', '=', 'Prisoner.EligibilityId')
        .where('Claim.Reference', 'like', query)
        .orWhere('Visitor.NationalInsuranceNumber', 'like', query)
        .orWhereRaw(`CONCAT(Visitor.FirstName, ' ', Visitor.LastName) like '${query}'`)
        .orWhere('Prisoner.PrisonNumber', 'like', query)
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
