const { getDatabaseConnector } = require('../../databaseConnector')

module.exports = function (claimIds) {
  const db = getDatabaseConnector()

  return db('ClaimExpense')
    .select('ClaimExpenseId', 'ExpenseType', 'ApprovedCost', 'ClaimId')
    .whereIn('ClaimId', claimIds)
}
