exports.up = function (knex, Promise) {
  return knex.schema.createTable('Claim', function (table) {
    table.increments('ClaimId')
    table.integer('EligibilityId').notNullable().references('Eligibility.EligibilityId')
    table.dateTime('DateOfJourney').notNullable()
    table.dateTime('DateCreated').notNullable()
    table.dateTime('DateSubmitted').notNullable()
    table.string('Status', 20).notNullable()
    table.string('Reason', 100)
    table.string('Note', 250)
  })
}

exports.down = function (knex, Promise) {
  return knex.schema.dropTable('Claim')
}
