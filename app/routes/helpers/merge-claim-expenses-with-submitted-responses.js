const Validator = require('../../services/validators/common-validator')

module.exports = function (oldData, nonPersistedData) {
  var claimExpensesById = {}
  var newClaimExpenseData

  nonPersistedData.forEach(function (claimExpense) {
    claimExpensesById[claimExpense.claimExpenseId] = claimExpense
  })

  oldData.forEach(function (expense) {
    var postedClaimExpenseResponse = claimExpensesById[expense.ClaimExpenseId.toString()]
    expense.Status = postedClaimExpenseResponse.status
    if (expense.Status === 'APPROVED-DIFF-AMOUNT') {
      expense.ApprovedCost = postedClaimExpenseResponse.approvedCost
      if (!Validator.isCurrency(postedClaimExpenseResponse.approvedCost)) {
        expense.Error = true
      }
    }
  })

  newClaimExpenseData = oldData
  return newClaimExpenseData
}
