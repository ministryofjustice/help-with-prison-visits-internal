exports.up = function (knex, Promise) {
  return knex.schema.createTable('Prisoner', function (table) {
    table.increments('PrisonerId')
    table.integer('EligibilityId').notNullable().references('Eligibility.EligibilityId')
    table.string('FirstName', 100).notNullable()
    table.string('LastName', 100).notNullable()
    table.dateTime('DateOfBirth').notNullable()
    table.string('PrisonNumber', 10).notNullable()
    table.string('NameOfPrison', 100).notNullable()
  })
}

exports.down = function (knex, Promise) {
  return knex.schema.dropTable('Prisoner')
}
