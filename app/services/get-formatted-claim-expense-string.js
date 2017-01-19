const claimExpenseTypes = require('../../app/views/helpers/display-field-names')

module.exports = function (claimExpenses) {
  var result = []

  claimExpenses.forEach(function (claimExpense) {
    var claimExpenseString = `${claimExpenseTypes[claimExpense.ExpenseType]}: ${claimExpense.ApprovedCost ? claimExpense.ApprovedCost : '0'}`

    result.push(claimExpenseString)
  })

  return result.join('|')
}
