module.exports = {
  ARE_CHILDREN_UNDER_18: {
    value: 'are-children-under-18',
    displayName: 'Are children under 18?',
    description: 'Children claimed for must be under 18',
  },
  COST_AND_VARIANCE_EQUAL_OR_LESS_THAN_FIRST_TIME_CLAIM: {
    value: 'cost-and-variance-equal-or-less-than-first-time-claim',
    displayName: 'Cost and variance equal or less than first time claim',
    description: 'The cost and variance of a claim must be less than or equal to that of the first time claim',
  },
  DO_EXPENSES_MATCH_FIRST_TIME_CLAIM: {
    value: 'do-expenses-match-first-time-claim',
    displayName: 'Do expenses match first time claim?',
    description: 'Expenses claimed for must also have been claimed for in the first time claim',
  },
  HAS_CLAIMED_LESS_THAN_MAX_TIMES_THIS_YEAR: {
    value: 'has-claimed-less-than-max-times-this-year',
    displayName: 'Has claimed less than max times this year',
    description: 'Claimant has not claimed more than the maximum number of claims in a year',
  },
  HAS_UPLOADED_PRISON_VISIT_CONFIRMATION_AND_RECEIPTS: {
    value: 'has-uploaded-prison-visit-confirmation-and-receipts',
    displayName: 'Has uploaded prison visit confirmation and receipts',
    description: 'Claimant must have uploaded their visit confirmation and all required receipts',
  },
  IS_CLAIM_WITHIN_TIME_LIMIT: {
    value: 'is-claim-submitted-within-time-limit',
    displayName: 'Claim submitted within time limit',
    description: 'Claim must be submitted within the specified time after the visit',
  },
  IS_CLAIM_TOTAL_UNDER_LIMIT: {
    value: 'is-claim-total-under-limit',
    displayName: 'Claim total under limit',
    description: 'The total amount of the claim must be under the set limit',
  },
  IS_LATEST_MANUAL_CLAIM_APPROVED: {
    value: 'is-latest-manual-claim-approved',
    displayName: 'Latest manual claim approved',
    description: "The Claimant's latest manual claim must have been approved",
  },
  IS_NO_PREVIOUS_PENDING_CLAIM_FOR_CLAIMANT: {
    value: 'is-no-previous-pending-claim',
    displayName: 'No previous pending claim',
    description: 'There must be no pending claims for the claimant',
  },
  IS_PRISON_NOT_IN_GUERNSEY_OR_JOURNEY: {
    value: 'is-prison-not-in-guernsey-jersey',
    displayName: 'Prison not in Guernsey or Jersey',
    description: 'Prison must not be in Guernsey or Jersey',
  },
  IS_VISIT_IN_THE_PAST: {
    value: 'is-visit-in-past',
    displayName: 'Visit in the past',
    description: 'Visit must be in the past',
  },
  VISIT_DATE_DIFFERENT_TO_PREVIOUS_CLAIMS: {
    value: 'visit-date-different-to-previous-claims',
    displayName: 'Visit date different to previous claims',
    description: 'The visit date must be different to the dates of previous claims',
  },
  CLAIMANT_HAS_NOT_OVERPAID: {
    value: 'claimant-has-not-been-overpaid',
    displayName: 'Claimant not overpaid on a previous claim',
    description: 'Then Claimant must not have an associated claim that has been flagged as overpaid',
  },
  HAS_CLAIMED_LESS_THAN_MAX_TIMES_THIS_MONTH: {
    value: 'has-claimed-less-than-max-times-this-month',
    displayName: 'Has claimed less than max times this month',
    description: 'Claimant has not claimed more than the maximum number of claims in a month',
  },
  IS_CLAIMANT_TRUSTED: {
    value: 'is-claimant-trusted',
    displayName: 'Is the claimant trusted?',
    description: 'Auto-approval has been disabled for this Claimant by a case worker',
  },
  FORCE_MANUAL_CHECK_AFTER_NUMBER_OF_AUTO_APPROVALS: {
    value: 'force-manual-check-after-number-of-auto-approvals',
    displayName: 'Force manual check after number of auto approvals',
    description: 'Claimants claims are forced to be manually checked after a set number of consecutive auto approvals',
  },
}
