const claimExpenseTypes = require('../../app/views/helpers/display-field-names')

module.exports = function (claimExpenses) {
  const result = []

  claimExpenses.forEach(function (claimExpense) {
    const claimExpenseString = `${claimExpenseTypes[claimExpense.ExpenseType]}: ${claimExpense.ApprovedCost ? claimExpense.ApprovedCost : '0'}`

    result.push(claimExpenseString)
  })

  return result.join('|')
}
