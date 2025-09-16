const Validator = require('../../services/validators/common-validator')
const claimDecisionEnum = require('../../constants/claim-decision-enum')

module.exports = (oldData, nonPersistedData) => {
  const claimExpensesById = {}

  if (nonPersistedData) {
    nonPersistedData.forEach(claimExpense => {
      claimExpensesById[claimExpense.claimExpenseId] = claimExpense
    })

    oldData.forEach(expense => {
      const postedClaimExpenseResponse = claimExpensesById[expense.ClaimExpenseId.toString()]
      expense.Status = postedClaimExpenseResponse ? postedClaimExpenseResponse.status : null
      if (
        expense.Status === claimDecisionEnum.APPROVED_DIFF_AMOUNT ||
        expense.Status === claimDecisionEnum.MANUALLY_PROCESSED
      ) {
        expense.ApprovedCost = postedClaimExpenseResponse.approvedCost
        if (
          !Validator.isCurrency(postedClaimExpenseResponse.approvedCost) ||
          !Validator.isGreaterThanZero(postedClaimExpenseResponse.approvedCost) ||
          !Validator.isLessThanMaximumDifferentApprovedAmount(postedClaimExpenseResponse.approvedCost)
        ) {
          expense.Error = true
        }
      }
    })
  }

  const newClaimExpenseData = oldData
  return newClaimExpenseData
}
