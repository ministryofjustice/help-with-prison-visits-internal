const config = require('../../../knexfile').intweb
const knex = require('knex')(config)

module.exports.get = function (status, offset, limit) {
  return knex('Claim')
    .join('Eligibility', 'Claim.EligibilityId', '=', 'Eligibility.EligibilityId')
    .join('Visitor', 'Eligibility.EligibilityId', '=', 'Visitor.EligibilityId')
    .where('Claim.Status', status)
    .select('Eligibility.Reference', 'Visitor.FirstName', 'Visitor.LastName', 'Claim.DateSubmitted', 'Claim.ClaimId')
    .orderBy('Eligibility.Reference')
    .limit(limit)
    .offset(offset)
    .then(function (claims) {
      return claims
    })
}

module.exports.count = function (status) {
  return knex('Claim')
    .join('Eligibility', 'Claim.EligibilityId', '=', 'Eligibility.EligibilityId')
    .join('Visitor', 'Eligibility.EligibilityId', '=', 'Visitor.EligibilityId')
    .where('Claim.Status', status)
    .count('Claim.ClaimId AS Count')
    .then(function (count) {
      return count[0]
    })
}
