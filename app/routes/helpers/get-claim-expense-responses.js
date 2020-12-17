const ClaimExpenseResponse = require('../../services/domain/claim-expense-response')

module.exports = function (body) {
  const claimExpenses = []
  const formKeys = Object.keys(body)

  formKeys.forEach(function (formKey) {
    if (formKey.match(/claim-expense-[0-9]*-status/)) {
      const approvedCostKey = formKey.replace('-status', '-approvedcost')
      const costKey = formKey.replace('-status', '-cost')

      const claimExpenseId = formKey.replace('claim-expense-', '').replace('-status', '')
      const status = body[formKey]
      const approvedCost = body[approvedCostKey]
      const cost = body[costKey]

      claimExpenses.push(new ClaimExpenseResponse(claimExpenseId, approvedCost, cost, status))
    }
  })

  return claimExpenses
}
