module.exports = {
  VISIT_IN_THE_PAST: {
    value: 'visit-in-the-past',
    displayName: 'Visit in the past',
    description: 'Visit must be in the past'
  },
  FIRST_TIME_CLAIM_APPROVED: {
    value: 'first-time-claim-approved',
    displayName: 'First time claim approved',
    description: 'First time claim must be approved'
  },
  NO_PREVIOUS_PENDING_CLAIM_FOR_CLAIMANT: {
    value: 'is-no-previous-pending-claim',
    displayName: 'No previous pending claim',
    description: 'There must be no pending claims for the claimant'
  },
  PRISON_NOT_IN_GUERNSEY_OR_JOURNEY: {
    value: 'prison-not-in-guernsey-or-jersey',
    displayName: 'Prison not in Guernsey or Jersey',
    description: 'Prison must not be in Guernsey or Jersey'
  },
  CLAIM_WITHIN_TIME_LIMIT: {
    value: 'claim-within-time-limit',
    displayName: 'Claim within time limit',
    description: 'Claim must be within the specified number of days'
  },
  MAX_NUMBER_OF_CLAIMS_PER_YEAR: {
    value: 'max-number-of-claims-per-year',
    displayName: 'Max number of claims per year',
    description: 'Claimant has not claimed more than the maximum number of claims in a year'
  }
}
