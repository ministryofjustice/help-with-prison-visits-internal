exports.up = function (knex, Promise) {
  return knex.schema.createTable('ClaimEvent', function (table) {
    table.increments('ClaimEventId')
    table.integer('EligibilityId').unsigned().notNullable().references('Eligibility.EligibilityId')
    table.string('Reference', 10).notNullable().index().references('Eligibility.Reference')
    table.integer('ClaimId').unsigned().notNullable().references('Claim.ClaimId')
    table.integer('ClaimDocumentId').unsigned().references('ClaimDocument.ClaimDocumentId')
    table.dateTime('DateAdded').notNullable()
    table.string('Event', 100).notNullable()
    table.string('AdditionalData', 100)
    table.string('Note', 2000)
    table.string('Caseworker', 100)
    table.boolean('IsInternal').defaultTo(true)
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
