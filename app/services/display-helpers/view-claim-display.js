const moment = require('moment')
const DISPLAY_NAMES = require('./display-field-names')

module.exports.get = function (claimDetails, claimExpenses) {
  var totalCost = 0
  claimDetails.DateSubmittedFormatted = moment(claimDetails.DateSubmitted).format('DD-MM-YYYY')
  claimDetails.DateOfBirthFormatted = moment(claimDetails.DateOfBirth).format('DD-MM-YYYY')
  claimDetails.PrisonerDateOfBirthFormatted = moment(claimDetails.PrisonerDateOfBirth).format('DD-MM-YYYY')

  claimExpenses.forEach(function (expense) {
    switch (expense.ExpenseType) {
      case 'car hire':
        expense.Detail = `${expense.From} to ${expense.To} for ${expense.DurationOfTravel} days`
        break
      case 'bus':
      case 'train':
        if (expense.IsReturn) {
          expense.Detail = expense.From + ' to ' + expense.To + ' - Return'
        } else {
          expense.Detail = expense.From + ' to ' + expense.To
        }
        break
      case 'light refreshment':
        if (expense.TravelTime === 'over-five') {
          expense.Detail = 'Over five hours away but under ten hours'
        } else {
          expense.Detail = 'Over ten hours away'
        }
        break
      case 'accommodation':
        expense.Detail = 'Nights stayed: ' + expense.DurationOfTravel
        break
      case 'ferry':
        expense.Detail = expense.From + ' to ' + expense.To + ' as ' + DISPLAY_NAMES[expense.TicketType]
        break
      default:
        expense.Detail = expense.From + ' to ' + expense.To
    }
    if (expense.Status === undefined) {
      expense.Status = ''
    }
    expense.ExpenseType = DISPLAY_NAMES[expense.ExpenseType]
    totalCost += expense.Cost
  })

  claimDetails.TotalCost = totalCost
  return [claimDetails, claimExpenses]
}
