const config = require('../../../knexfile').intweb
const knex = require('knex')(config)

module.exports = function (claimId) {
  return knex('ClaimExpense')
    .select('ClaimExpenseId', 'ExpenseType', 'ApprovedCost')
    .where('ClaimId', claimId)
}
