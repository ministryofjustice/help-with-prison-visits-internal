const ClaimExpenseResponse = require('../../services/domain/claim-expense-response')

module.exports = function (body) {
  var claimExpenses = []
  var formKeys = Object.keys(body)

  formKeys.forEach(function (formKey) {
    if (formKey.match(/claim-expense-[0-9]*-status/)) {
      var approvedCostKey = formKey.replace('-status', '-approvedcost')
      var costKey = formKey.replace('-status', '-cost')

      var claimExpenseId = formKey.replace('claim-expense-', '').replace('-status', '')
      var status = body[formKey]
      var approvedCost = body[approvedCostKey]
      var cost = body[costKey]

      claimExpenses.push(new ClaimExpenseResponse(claimExpenseId, approvedCost, cost, status))
    }
  })

  return claimExpenses
}
