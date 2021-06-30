const { getDatabaseConnector } = require('../../databaseConnector')

module.exports = function (claimId) {
  const db = getDatabaseConnector()

  return db('Claim').where('ClaimId', claimId)
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
