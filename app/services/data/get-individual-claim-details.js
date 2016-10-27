const config = require('../../../knexfile').intweb
const knex = require('knex')(config)

module.exports.get = function (id) {
  return knex('Claim')
    .join('Eligibility', 'Claim.EligibilityId', '=', 'Eligibility.EligibilityId')
    .join('Visitor', 'Eligibility.EligibilityId', '=', 'Visitor.EligibilityId')
    .where('Claim.ClaimId', id)
    .select('Eligibility.Reference', 'Claim.DateSubmitted', 'Visitor.FirstName', 'Visitor.LastName',
      'Visitor.DateOfBirth', 'Visitor.NationalInsuranceNumber', 'Visitor.HouseNumberAndStreet', 'Visitor.Town', 'Visitor.County', 'Visitor.PostCode',
      'Visitor.EmailAddress', 'Visitor.PhoneNumber', 'Visitor.Relationship')
    .then(function (claim) {
      return claim[0]
    })
}
