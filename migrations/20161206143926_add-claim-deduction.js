exports.up = function (knex, Promise) {
  return knex.schema.createTable('ClaimDeduction', function (table) {
    table.increments('ClaimDeductionId')
    table.integer('EligibilityId').unsigned().notNullable()
    table.string('Reference', 10).notNullable().index()
    table.integer('ClaimId').unsigned().notNullable()
    table.string('DeductionType', 100).notNullable()
    table.decimal('Amount').notNullable()
    table.boolean('IsEnabled')
  })
  .then(function () {
    return knex.schema.alterTable('ClaimDeduction', function (table) {
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
  return knex.schema.dropTable('ClaimDeduction')
    .catch(function (error) {
      console.log(error)
      throw error
    })
}
