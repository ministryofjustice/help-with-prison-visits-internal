class ClaimExpenseResponse {
  constructor (claimExpenseId, approvedCost, cost, status) {
    this.claimExpenseId = claimExpenseId
    this.approvedCost = approvedCost
    this.cost = cost
    this.status = status
  }
}

module.exports = ClaimExpenseResponse
