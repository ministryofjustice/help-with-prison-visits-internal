class ClaimExpenseResponse {
  constructor (claimExpenseId, approvedCost, status) {
    this.claimExpenseId = claimExpenseId
    this.approvedCost = approvedCost
    this.status = status
  }

  static getClaimExpenseData (body) {
    var claimExpenses = []
    var formKeys = Object.keys(body)

    formKeys.forEach(function (formKey) {
      if (formKey.match(/claim-expense-[0-9]*-status/)) {
        var approvedCostKey = formKey.replace('-status', '-approvedcost')

        var claimExpenseId = formKey.replace('claim-expense-', '').replace('-status', '')
        var status = body[formKey]
        var approvedCost = body[approvedCostKey]

        claimExpenses.push(new ClaimExpenseResponse(claimExpenseId, approvedCost, status))
      }
    })

    return claimExpenses
  }
}

module.exports = ClaimExpenseResponse
