const getMaxNumberOfExpenses = require('./get-max-number-of-expenses')

module.exports = claims => {
  const maxExpenses = getMaxNumberOfExpenses(claims)
  const columns = [
    'Name',
    'Reference',
    'Prison Name',
    'Prisoner Number',
    'Prisoner Date Of Birth',
    'Prisoner Relationship',
    'Child Count',
    'Has Escort?',
    'Visit Date',
    'Claim Submission Date',
    'Region',
    'Benefit Claimed',
    'Assisted Digital Caseworker',
    'Caseworker',
    'Trusted?',
    'Status',
    'Date Reviewed by Caseworker',
    'Is Advance Claim?',
    'Total amount paid',
    'Payment Method',
    'Rejection Reason',
    'Days Until Payment',
  ]
  let i
  for (i = 1; i <= maxExpenses; i += 1) {
    const expenseTypeHeader = `Expense Type ${i}`
    const expenseCostHeader = `Approved Cost ${i}`
    columns.push(expenseTypeHeader)
    columns.push(expenseCostHeader)
  }
  return columns
}
