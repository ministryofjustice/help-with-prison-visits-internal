module.exports = function (claims) {
  var highestExpenseCount = 0
  var numberOfColumsBeforeExpenses = 0
  var columnHeads = Object.keys(claims[0])
  var found = false

  while (!found && (numberOfColumsBeforeExpenses < columnHeads.length)) {
    if (columnHeads[numberOfColumsBeforeExpenses] === 'Expense Type 1') {
      found = true
    } else {
      numberOfColumsBeforeExpenses = numberOfColumsBeforeExpenses + 1
    }
  }
  claims.forEach(function (claim) {
    if (((Object.keys(claim).length) - numberOfColumsBeforeExpenses) > highestExpenseCount) {
      highestExpenseCount = Object.keys(claim).length - numberOfColumsBeforeExpenses
    }
  })
  return highestExpenseCount / 2 //divide by 2 as there are 2 columns for each expense
}
