const config = require('../../../knexfile').intweb
const knex = require('knex')(config)

module.exports = function (claimId) {
  return knex('Claim')
    .join('Eligibility', 'Claim.EligibilityId', '=', 'Eligibility.EligibilityId')
    .join('Visitor', 'Eligibility.EligibilityId', '=', 'Visitor.EligibilityId')
    .join('Prisoner', 'Eligibility.EligibilityId', '=', 'Prisoner.EligibilityId')
    .where('Claim.ClaimId', claimId)
    .first('Eligibility.Reference', 'Claim.DateSubmitted', 'Visitor.FirstName', 'Visitor.LastName',
      'Visitor.DateOfBirth', 'Visitor.NationalInsuranceNumber', 'Visitor.HouseNumberAndStreet', 'Visitor.Town', 'Visitor.County', 'Visitor.PostCode',
      'Visitor.EmailAddress', 'Visitor.PhoneNumber', 'Visitor.Relationship', 'Prisoner.FirstName AS PrisonerFirstName', 'Prisoner.LastName AS PrisonerLastName',
      'Prisoner.DateOfBirth AS PrisonerDateOfBirth', 'Prisoner.PrisonNumber', 'Prisoner.NameOfPrison')
    .then(function (claim) {
      return knex('Claim')
        .join('ClaimExpense', 'Claim.ClaimId', '=', 'ClaimExpense.ClaimId')
        .where('Claim.ClaimId', claimId)
        .select('ClaimExpense.ExpenseType', 'ClaimExpense.Cost', 'ClaimExpense.To', 'ClaimExpense.From', 'ClaimExpense.IsReturn', 'ClaimExpense.TravelTime',
          'ClaimExpense.DurationOfTravel', 'ClaimExpense.TicketType', 'ClaimExpense.ClaimExpenseId')
        .orderBy('ClaimExpense.ClaimExpenseId')
        .then(function (claimExpenses) {
          var total = 0
          claimExpenses.forEach(function (expense) {
            total += expense.Cost
          })
          claim.Total = total
          return {claim: claim, claimExpenses: claimExpenses}
        })
    })
}
