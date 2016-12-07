const config = require('../../../knexfile').intweb
const knex = require('knex')(config)

module.exports = function (claimId, deductionType, amount) {
  return getClaim(claimId)
    .then(function (claim) {
      return knex('IntSchema.ClaimDeduction')
        .insert({
          EligibilityId: claim.EligibilityId,
          Reference: claim.Reference,
          ClaimId: claimId,
          Amount: amount,
          DeductionType: deductionType,
          IsEnabled: true
        })
        .returning('ClaimDeductionId')
    })
}

function getClaim (claimId) {
  return knex('IntSchema.Claim')
    .where('ClaimId', claimId)
    .first()
}
