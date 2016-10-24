exports.up = function (knex, Promise) {
  return knex.schema.createTable('Eligibility', function (table) {
    table.increments('EligibilityId')
    table.string('Reference', 10).notNullable()
    table.dateTime('DateCreated').notNullable()
    table.dateTime('DateSubmitted').notNullable()
    table.string('Status', 20).notNullable()
  })
}

exports.down = function (knex, Promise) {
  return knex.schema.dropTable('Eligibility')
}
