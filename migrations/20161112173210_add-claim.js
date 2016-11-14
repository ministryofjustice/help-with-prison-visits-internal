exports.up = function (knex, Promise) {
  return knex.schema.createTable('Claim', function (table) {
    table.integer('ClaimId').unsigned().primary()
    table.integer('EligibilityId').unsigned().notNullable() // NO FOREIGN KEY FOR REPEAT CLAIMS WHEN NO ELIGIBILITY IN EXTSCHEMA
    table.string('Reference', 10).notNullable().index() // NO FOREIGN KEY FOR REPEAT CLAIMS WHEN NO ELIGIBILITY IN EXTSCHEMA
    table.dateTime('DateOfJourney').notNullable()
    table.dateTime('DateCreated').notNullable()
    table.dateTime('DateSubmitted')
    table.string('Status', 20).notNullable()
    table.string('Reason', 100)
    table.string('Note', 250)
  })
  .then(function () {
    return knex.schema.alterTable('Claim', function (table) {
      table.unique(['ClaimId', 'EligibilityId', 'Reference'])
    })
  })
  .catch(function (error) {
    console.log(error)
    throw error
  })
}

exports.down = function (knex, Promise) {
  return knex.schema.dropTable('Claim')
}
