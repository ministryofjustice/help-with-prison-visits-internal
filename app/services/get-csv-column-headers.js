const getMaxNumberOfExpenses = require('./get-max-number-of-expenses')

module.exports = function (claims) {
  var maxExpenses = getMaxNumberOfExpenses(claims)
  var columns = ['Name', 'Prison Name', 'Prisoner Relationship', 'Child Count', 'Has Escort?', 'Visit Date', 'Claim Submission Date', 'Region', 'Benefit Claimed', 'Assisted Digital Caseworker', 'Caseworker', 'Trusted?', 'Status', 'Date Reviewed by Caseworker', 'Is Advance Claim?', 'Total amount paid', 'Payment Method']
  var i
  for (i = 1; i <= maxExpenses; i++) {
    var expenseTypeHeader = 'Expense Type ' + i
    var expenseCostHeader = 'Approved Cost ' + i
    columns.push(expenseTypeHeader)
    columns.push(expenseCostHeader)
  }
  return columns
}
