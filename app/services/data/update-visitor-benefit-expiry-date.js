const config = require('../../../knexfile').intweb
const knex = require('knex')(config)
const getEligibilityForClaimId = require('./get-eligibility-for-claim-id')

module.exports = function (claimId, benefitExpiryDate) {
  var expiryDate = benefitExpiryDate.expiryDate.format('YYYY-MM-DD')
  return getEligibilityForClaimId(claimId)
    .then(function (eligibility) {
      return knex('Visitor')
        .where('EligibilityId', eligibility.EligibilityId)
        .update({ BenefitExpiryDate: expiryDate })
    })
}
