class ClaimExpenseResponse {
  constructor (id, approvedCost, status) {
    this.id = id
    this.approvedCost = approvedCost
    this.status = status
  }

  // TODO test
  static getClaimExpenseData (body) {
    var claimExpenses = []
    var formKeys = Object.keys(body)

    formKeys.forEach(function (formKey) {
      if (formKey.match(/claim-expense-[0-9]*-status/)) {
        var approvedCostKey = formKey.replace('-status', '-approvedcost')

        var id = formKey.replace('claim-expense-', '').replace('-status', '')
        var status = body[formKey]
        var approvedCost = body[approvedCostKey]

        claimExpenses.push(new ClaimExpenseResponse(id, approvedCost, status))
      }
    })

    return claimExpenses
  }
}

module.exports = ClaimExpenseResponse
