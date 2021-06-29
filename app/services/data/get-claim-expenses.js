const { getDatabaseConnector } = require('../../databaseConnector')

module.exports = function (claimId) {
  const db = getDatabaseConnector()

  return db('ClaimExpense')
    .select('ClaimExpenseId', 'ExpenseType', 'ApprovedCost')
    .where('ClaimId', claimId)
}
