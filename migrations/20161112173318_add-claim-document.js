exports.up = function (knex, Promise) {
  return knex.schema.createTable('ClaimDocument', function (table) {
    table.integer('ClaimDocumentId').unsigned().primary()
    table.integer('EligibilityId').unsigned().notNullable().references('Eligibility.EligibilityId')
    table.string('Reference', 10).notNullable().index().references('Eligibility.Reference')
    table.integer('ClaimId').unsigned().notNullable().references('Claim.ClaimId')
    table.integer('ClaimExpenseId').unsigned().references('ClaimExpense.ClaimExpenseId')
    table.string('DocumentType', 20).notNullable()
    table.string('DocumentStatus', 20).notNullable()
    table.string('Filepath', 250)
    table.string('Caseworker', 100)
    table.dateTime('DateSubmitted')
    table.boolean('IsEnabled')
    table.string('Status', 20)
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
