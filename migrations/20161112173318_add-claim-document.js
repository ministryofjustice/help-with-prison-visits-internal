exports.up = function (knex, Promise) {
  return knex.schema.createTable('ClaimDocument', function (table) {
    table.integer('ClaimDocumentId').unsigned().primary()
    table.integer('EligibilityId').unsigned().notNullable()
    table.string('Reference', 10).notNullable().index()
    table.integer('ClaimId').unsigned().notNullable()
    table.string('DocumentType', 20).notNullable()
    table.integer('ClaimExpenseId').unsigned()
    table.string('DocumentStatus', 20).notNullable()
    table.string('Filepath', 250)
    table.string('Caseworker', 100)
    table.dateTime('DateSubmitted')
    table.boolean('IsEnabled')
    table.string('Status', 20)
  })
  .then(function () {
    return knex.schema.alterTable('ClaimDocument', function (table) {
      table
        .foreign(['ClaimId', 'EligibilityId', 'Reference', 'ClaimExpenseId'])
        .references(['Claim.ClaimId', 'Claim.EligibilityId', 'Claim.Reference', 'ClaimExpense.ClaimExpenseId'])
    })
  })
  .catch(function (error) {
    console.log(error)
    throw error
  })
}

exports.down = function (knex, Promise) {
  return knex.schema.dropTable('ClaimDocument')
  .catch(function (error) {
    console.log(error)
    throw error
  })
}
