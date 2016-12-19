
exports.up = function (knex, Promise) {
  return knex.schema.createTable('ClaimEvent', function (table) {
    table.increments('ClaimEventId')
    table.integer('EligibilityId').unsigned().notNullable()
    table.string('Reference', 10).notNullable().index()
    table.integer('ClaimId').unsigned().notNullable().references('Claim.ClaimId')
    table.dateTime('DateAdded').notNullable()
    table.string('Event', 100).notNullable()
    table.string('AdditionalData', 100)
    table.string('Note', 250)
    table.string('Caseworker', 100)
    table.boolean('IsInternal').defaultTo(true)
  })
  .then(function () {
    return knex.schema.alterTable('ClaimEvent', function (table) {
      table
        .foreign(['ClaimId', 'EligibilityId', 'Reference'])
        .references(['Claim.ClaimId', 'Claim.EligibilityId', 'Claim.Reference'])
    })
  })
  .catch(function (error) {
    console.log(error)
    throw error
  })
}

exports.down = function (knex, Promise) {
  return knex.schema.dropTable('ClaimEvent')
    .catch(function (error) {
      console.log(error)
      throw error
    })
}
