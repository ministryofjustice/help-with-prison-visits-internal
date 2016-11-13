exports.up = function (knex, Promise) {
  return knex.schema.createTable('ClaimExpense', function (table) {
    table.integer('ClaimExpenseId').unsigned().primary()
    table.integer('EligibilityId').unsigned().notNullable()
    table.string('Reference', 10).notNullable().index()
    table.integer('ClaimId').unsigned().notNullable().references('Claim.ClaimId')
    table.string('ExpenseType', 100).notNullable()
    table.decimal('Cost').notNullable()
    table.string('TravelTime', 100)
    table.string('From', 100)
    table.string('To', 100)
    table.boolean('IsReturn')
    table.integer('DurationOfTravel')
    table.string('TicketType', 100)
    table.boolean('IsChild')
    table.boolean('IsEnabled')
    table.decimal('ApprovedCost')
    table.string('Note', 250)
    table.string('Status', 20)
  })
  .then(function () {
    return knex.schema.alterTable('ClaimExpense', function (table) {
      table.foreign(['ClaimId', 'EligibilityId', 'Reference']).references(['Claim.ClaimId', 'Claim.EligibilityId', 'Claim.Reference'])
    })
  })
  .catch(function (error) {
    console.log(error)
    throw error
  })
}

exports.down = function (knex, Promise) {
  return knex.schema.dropTable('ClaimExpense')
}
