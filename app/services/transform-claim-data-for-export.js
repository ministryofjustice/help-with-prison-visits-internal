const Promise = require('bluebird')
const claimExpenseTypes = require('../../app/views/helpers/display-field-names')
const getClaimEscorts = require('../services/data/get-claim-escorts')
const getClaimChildCounts = require('../services/data/get-claim-child-counts')
const getClaimExpensesForClaims = require('../services/data/get-claim-expenses-for-claims')
const log = require('../services/log')

const displayHelper = require('../views/helpers/display-helper')
const dateHelper = require('../views/helpers/date-helper')
const prisonerRelationshipEnum = require('../../app/constants/prisoner-relationships-enum')

const NAME_HEADER = 'Name'
const PRISON_NAME_HEADER = 'Prison Name'
const PRISONER_RELATIONSHIP_HEADER = 'Prisoner Relationship'
const CHILD_COUNT_HEADER = 'Child Count'
const HAS_ESCORT_HEADER = 'Has Escort?'
const PRISON_REGION_HEADER = 'Region'
const VISIT_DATE_HEADER = 'Visit Date'
const CLAIM_SUBMISSION_DATE_HEADER = 'Claim Submission Date'
const BENEFIT_CLAIMED_HEADER = 'Benefit Claimed'
const ASSISTED_DIGITAL_CASEWORKER_HEADER = 'Assisted Digital Caseworker'
const CASEWORKER_HEADER = 'Caseworker'
const IS_TRUSTED_HEADER = 'Trusted?'
const CLAIM_STATUS_HEADER = 'Status'
const DATE_REVIEWED_BY_CASEWORKER_HEADER = 'Date Reviewed by Caseworker'
const IS_ADVANCE_CLAIM_HEADER = 'Is Advance Claim?'
const TOTAL_AMOUNT_PAID_HEADER = 'Total amount paid'
const PAYMENT_METHOD_HEADER = 'Payment Method'
const CLAIM_EXPENSE_TYPE_HEADER = 'Expense Type '
const EXPENSE_APPROVED_COST_HEADER = 'Approved Cost '
const REJECTION_REASON_HEADER = 'Rejection Reason'
const DAYS_UNTIL_PAYMENT_HEADER = 'Days Until Payment'

module.exports = function (claims) {
  const claimIds = claims.reduce(function (currentClaimIds, claim) {
    currentClaimIds.push(claim.ClaimId)

    return currentClaimIds
  }, [])

  return Promise.all([
    getClaimChildCounts(claimIds),
    getClaimEscorts(claimIds),
    getClaimExpensesForClaims(claimIds)
  ]).then(function (data) {
    return Promise.map(claims, function (claim) {
      const returnValue = {}

      const childCount = data[0].find(function (childCountRow) { return childCountRow.ClaimId === claim.ClaimId })
      const hasEscort = data[1].find(function (escortRow) { return escortRow.ClaimId === claim.ClaimId }) !== undefined
      const claimExpenses = data[2].filter(function (expenseRow) { return expenseRow.ClaimId === claim.ClaimId })

      const totalAmountPaid = (claim.PaymentAmount || 0) + (claim.ManuallyProcessedAmount || 0)

      returnValue[NAME_HEADER] = claim.Name
      returnValue[PRISON_NAME_HEADER] = displayHelper.getPrisonDisplayName(claim.NameOfPrison)
      returnValue[PRISONER_RELATIONSHIP_HEADER] = prisonerRelationshipEnum[claim.Relationship].displayName
      returnValue[CHILD_COUNT_HEADER] = childCount ? childCount.Count : 0
      returnValue[HAS_ESCORT_HEADER] = hasEscort ? 'Y' : 'N'
      returnValue[VISIT_DATE_HEADER] = dateHelper.shortDate(claim.DateOfJourney)
      returnValue[CLAIM_SUBMISSION_DATE_HEADER] = dateHelper.shortDate(claim.DateSubmitted)
      returnValue[PRISON_REGION_HEADER] = displayHelper.getPrisonRegion(claim.NameOfPrison)
      returnValue[BENEFIT_CLAIMED_HEADER] = displayHelper.getBenefitDisplayName(claim.Benefit)
      returnValue[ASSISTED_DIGITAL_CASEWORKER_HEADER] = claim.AssistedDigitalCaseworker
      returnValue[CASEWORKER_HEADER] = claim.Caseworker
      returnValue[IS_TRUSTED_HEADER] = claim.IsTrusted ? 'Y' : 'N'
      returnValue[CLAIM_STATUS_HEADER] = claim.DisplayStatus
      returnValue[DATE_REVIEWED_BY_CASEWORKER_HEADER] = claim.DateReviewed ? dateHelper.shortDate(claim.DateReviewed) : null
      returnValue[IS_ADVANCE_CLAIM_HEADER] = claim.IsAdvanceClaim ? 'Y' : 'N'
      returnValue[TOTAL_AMOUNT_PAID_HEADER] = totalAmountPaid
      returnValue[PAYMENT_METHOD_HEADER] = claim.PaymentMethod ? displayHelper.getPaymentMethodDisplayName(claim.PaymentMethod) : ''
      returnValue[REJECTION_REASON_HEADER] = claim.RejectionReason
      returnValue[DAYS_UNTIL_PAYMENT_HEADER] = claim.DaysUntilPayment
      if (claim.RejectionReason === 'Other') {
        returnValue[REJECTION_REASON_HEADER] = claim.Note
      }
      let expenseCount = 1
      claimExpenses.forEach(function (expense) {
        returnValue[CLAIM_EXPENSE_TYPE_HEADER + expenseCount] = claimExpenseTypes[expense.ExpenseType]
        returnValue[EXPENSE_APPROVED_COST_HEADER + expenseCount] = expense.ApprovedCost ? expense.ApprovedCost : 0
        expenseCount = expenseCount + 1
      })

      return returnValue
    })
  }).catch((error) => {
    log.error(error.message)
  })
}
