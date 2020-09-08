const config = require('../../../knexfile').intweb
const knex = require('knex')(config)

module.exports = function (claimId) {
  return knex('Claim').where('ClaimId', claimId)
    .join('Eligibility', 'Claim.EligibilityId', '=', 'Eligibility.EligibilityId')
    .first(
      'Eligibility.EligibilityId',
      'Eligibility.Reference',
      'Eligibility.IsTrusted',
      'Eligibility.UntrustedReason',
      'Eligibility.UntrustedDate',
      'Eligibility.DateCreated',
      'Eligibility.DateSubmitted',
      'Eligibility.Status',
      'Eligibility.ReferenceDisabled',
      'Eligibility.DisabledReason',
      'Eligibility.ReEnabledReason'
    )
}
