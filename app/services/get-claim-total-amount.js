module.exports = function (claimExpenses, claimDeductions) {
  var total = 0

  if (claimExpenses && claimExpenses.length > 0) {
    claimExpenses.forEach(function (claimExpense) {
      total += claimExpense.Cost
    })
  }

  if (claimDeductions && claimDeductions.length > 0) {
    claimDeductions.forEach(function (claimDeduction) {
      total -= claimDeduction.Amount
    })
  }

  return Number(total).toFixed(2)
}
