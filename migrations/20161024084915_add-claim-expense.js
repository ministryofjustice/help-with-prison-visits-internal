exports.up = function (knex, Promise) {
  return knex.schema.createTable('ClaimExpense', function (table) {
    table.increments('ClaimExpenseId')
    table.integer('ClaimId').notNullable().references('Claim.ClaimId')
    table.string('ExpenseType', 100).notNullable()
    table.decimal('Cost').notNullable()
    table.string('Description', 100)
    table.integer('NumberOfNights')
    table.boolean('AwayOverFiveHours')
    table.decimal('ApprovedCost')
    table.string('Note', 250)
    table.string('Status', 20)
  })
}

exports.down = function (knex, Promise) {
  return knex.schema.dropTable('ClaimExpense')
}
