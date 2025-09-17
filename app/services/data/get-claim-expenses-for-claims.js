const { getDatabaseConnector } = require('../../databaseConnector')

module.exports = () => {
  const db = getDatabaseConnector()

  return db('ClaimExpense').select('ClaimExpenseId', 'ExpenseType', 'ApprovedCost', 'ClaimId')
}
