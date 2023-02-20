const { getDatabaseConnector } = require('../../databaseConnector')
const getEligibilityForClaimId = require('./get-eligibility-for-claim-id')

module.exports = function (claimId, benefitExpiryDate) {
  const db = getDatabaseConnector()

  const expiryDate = benefitExpiryDate.expiryDate.format('YYYY-MM-DD')
  return getEligibilityForClaimId(claimId)
    .then(function (eligibility) {
      return db('Visitor')
        .where('EligibilityId', eligibility.EligibilityId)
        .update({ BenefitExpiryDate: expiryDate })
    })
}
