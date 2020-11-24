module.exports = function (claimExpenses, claimDeductions) {
  let total = 0

  if (claimExpenses && claimExpenses.length > 0) {
    claimExpenses.forEach(function (claimExpense) {
      total += claimExpense.ApprovedCost ? parseFloat(claimExpense.ApprovedCost) : parseFloat(claimExpense.Cost)
    })
  }

  if (claimDeductions && claimDeductions.length > 0) {
    claimDeductions.forEach(function (claimDeduction) {
      total -= parseFloat(claimDeduction.Amount)
    })
  }

  return Number(total).toFixed(2)
}
