exports.up = function (knex, Promise) {
  return knex.schema.createTable('ClaimEvent', function (table) {
    table.increments('ClaimEventId')
    table.integer('EligibilityId').unsigned().notNullable()
    table.string('Reference', 10).notNullable().index()
    table.integer('ClaimId').unsigned().notNullable()
    table.integer('ClaimDocumentId').unsigned()
    table.dateTime('DateAdded').notNullable()
    table.string('Event', 100).notNullable()
    table.string('AdditionalData', 100)
    table.string('Note', 2000)
    table.string('Caseworker', 100)
    table.boolean('IsInternal').defaultTo(true)
  })
  .then(function () {
    return knex.schema.alterTable('ClaimEvent', function (table) {
      table
        .foreign(['ClaimId', 'EligibilityId', 'Reference', 'ClaimDocumentId'])
        .references(['Claim.ClaimId', 'Claim.EligibilityId', 'Claim.Reference', 'ClaimDocument.ClaimDocumentId'])
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
