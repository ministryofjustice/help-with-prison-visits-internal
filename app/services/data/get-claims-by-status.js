const config = require('../../../knexfile').intweb
const knex = require('knex')(config)

module.exports.get = function (status) {
  return knex('Claim')
    .join('Eligibility', 'Claim.EligibilityId', '=', 'Eligibility.EligibilityId')
    .join('Visitor', 'Eligibility.EligibilityId', '=', 'Visitor.EligibilityId')
    .where('Claim.Status', status)
    .select('Eligibility.Reference', 'Visitor.FirstName', 'Visitor.LastName', 'Claim.DateSubmitted', 'Claim.ClaimId')
    .orderBy('Eligibility.Reference')
    .then(function (claims) {
      return claims
    })
}
