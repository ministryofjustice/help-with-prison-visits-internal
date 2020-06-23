exports.up = function (knex, Promise) {
  return knex.schema.createTable('ClaimChild', function (table) {
    table.integer('ClaimChildId').unsigned().primary()
    table.integer('EligibilityId').unsigned().notNullable().references('Eligibility.EligibilityId')
    table.string('Reference', 10).notNullable().index().references('Eligibility.Reference')
    table.integer('ClaimId').unsigned().notNullable().references('Claim.ClaimId')
    table.string('FirstName', 50).notNullable()
    table.string('LastName', 50).notNullable()
    table.dateTime('DateOfBirth').notNullable()
    table.string('Relationship', 100).notNullable()
    table.boolean('IsEnabled')
  })
    .catch(function (error) {
      console.log(error)
      throw error
    })
}

exports.down = function (knex, Promise) {
  return knex.schema.dropTable('ClaimChild')
    .catch(function (error) {
      console.log(error)
      throw error
    })
}
