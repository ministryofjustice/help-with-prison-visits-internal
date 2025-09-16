const claimExpenseTypes = require('../views/helpers/display-field-names')

module.exports = claimExpenses => {
  const result = []

  claimExpenses.forEach(claimExpense => {
    const claimExpenseString = `${claimExpenseTypes[claimExpense.ExpenseType]}: ${claimExpense.ApprovedCost ? claimExpense.ApprovedCost : '0'}`

    result.push(claimExpenseString)
  })

  return result.join('|')
}
