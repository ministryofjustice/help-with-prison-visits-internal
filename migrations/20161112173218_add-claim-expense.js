exports.up = function (knex, Promise) {
  return knex.schema.createTable('ClaimExpense', function (table) {
    table.integer('ClaimExpenseId').unsigned().primary()
    table.integer('EligibilityId').unsigned().notNullable().references('Eligibility.EligibilityId')
    table.string('Reference', 10).notNullable().index().references('Eligibility.Reference')
    table.integer('ClaimId').unsigned().notNullable().references('Claim.ClaimId')
    table.string('ExpenseType', 100).notNullable()
    table.decimal('Cost').notNullable()
    table.string('TravelTime', 100)
    table.string('From', 100)
    table.string('To', 100)
    table.boolean('IsReturn')
    table.integer('DurationOfTravel')
    table.string('TicketType', 100)
    table.string('TicketOwner', 10)
    table.boolean('IsEnabled')
    table.decimal('ApprovedCost')
    table.string('Note', 250)
    table.string('Status', 20)
  })
    .catch(function (error) {
      console.log(error)
      throw error
    })
}

exports.down = function (knex, Promise) {
  return knex.schema.dropTable('ClaimExpense')
    .catch(function (error) {
      console.log(error)
      throw error
    })
}
