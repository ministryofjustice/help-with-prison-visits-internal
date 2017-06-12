const Validator = require('../../services/validators/common-validator')
const claimDecisionEnum = require('../../constants/claim-decision-enum')

module.exports = function (oldData, nonPersistedData) {
  var claimExpensesById = {}
  var newClaimExpenseData

  if (nonPersistedData) {
    nonPersistedData.forEach(function (claimExpense) {
      claimExpensesById[claimExpense.claimExpenseId] = claimExpense
    })

    oldData.forEach(function (expense) {
      var postedClaimExpenseResponse = claimExpensesById[expense.ClaimExpenseId.toString()]
      expense.Status = postedClaimExpenseResponse ? postedClaimExpenseResponse.status : null
      if (expense.Status === claimDecisionEnum.APPROVED_DIFF_AMOUNT || expense.Status === claimDecisionEnum.MANUALLY_PROCESSED) {
        expense.ApprovedCost = postedClaimExpenseResponse.approvedCost
        if (!Validator.isCurrency(postedClaimExpenseResponse.approvedCost) || !Validator.isGreaterThanZero(postedClaimExpenseResponse.approvedCost) ||
          !Validator.isGreaterThanMinimumClaim(postedClaimExpenseResponse.approvedCost) ||
          !Validator.isLessThanMaximumDifferentApprovedAmount(postedClaimExpenseResponse.approvedCost)) {
          expense.Error = true
        }
      }
    })
  }

  newClaimExpenseData = oldData
  return newClaimExpenseData
}
