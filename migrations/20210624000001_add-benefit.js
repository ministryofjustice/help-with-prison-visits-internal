exports.up = function (knex, Promise) {
  return knex.schema.createTable('Benefit', function (table) {
    table.integer('BenefitId').unsigned().primary()
    table.integer('EligibilityId').unsigned().notNullable().index()
    table.string('Reference', 10).notNullable().index()
    table.string('FirstName', 100).notNullable()
    table.string('LastName', 100).notNullable()
    table.string('NationalInsuranceNumber', 10).notNullable()
    table.dateTime('DateOfBirth').notNullable()
  })
    .catch(function (error) {
      console.log(error)
      throw error
    })
}

exports.down = function (knex, Promise) {
  return knex.schema.dropTable('Benefit')
}
