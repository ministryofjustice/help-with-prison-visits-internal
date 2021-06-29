const { getDatabaseConnector } = require('../../databaseConnector')

module.exports = function (claimId, claimDeduction) {
  const db = getDatabaseConnector()

  return getClaim(claimId)
    .then(function (claim) {
      return db('ClaimDeduction')
        .returning('ClaimDeductionId')
        .insert({
          EligibilityId: claim.EligibilityId,
          Reference: claim.Reference,
          ClaimId: claimId,
          Amount: claimDeduction.amount,
          DeductionType: claimDeduction.deductionType,
          IsEnabled: true
        })
    })
}

function getClaim (claimId) {
  const db = getDatabaseConnector()

  return db('Claim')
    .where('ClaimId', claimId)
    .first()
}
