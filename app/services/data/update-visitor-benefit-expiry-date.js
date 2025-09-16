const { getDatabaseConnector } = require('../../databaseConnector')
const getEligibilityForClaimId = require('./get-eligibility-for-claim-id')

module.exports = (claimId, benefitExpiryDate) => {
  const db = getDatabaseConnector()

  const expiryDate = benefitExpiryDate.expiryDate.format('YYYY-MM-DD')
  return getEligibilityForClaimId(claimId).then(eligibility => {
    return db('Visitor').where('EligibilityId', eligibility.EligibilityId).update({ BenefitExpiryDate: expiryDate })
  })
}
