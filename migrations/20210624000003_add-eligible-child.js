exports.up = function (knex, Promise) {
  return knex.schema.createTable('EligibleChild', function (table) {
    table.integer('EligibleChildId').unsigned().primary()
    table.integer('EligibilityId').unsigned().notNullable().references('Eligibility.EligibilityId')
    table.string('Reference', 10).notNullable().index()
    table.string('FirstName', 100).notNullable()
    table.string('LastName', 100).notNullable()
    table.string('ChildRelationship', 100).notNullable()
    table.dateTime('DateOfBirth').notNullable()
    table.string('ParentFirstName', 100).notNullable()
    table.string('ParentLastName', 100).notNullable()
    table.string('HouseNumberAndStreet', 250).notNullable()
    table.string('Town', 100).notNullable()
    table.string('County', 100).notNullable()
    table.string('PostCode', 10).notNullable()
    table.string('Country', 100).notNullable()
  })
    .catch(function (error) {
      console.log(error)
      throw error
    })
}

exports.down = function (knex, Promise) {
  return knex.schema.dropTable('EligibleChild')
}
