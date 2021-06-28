exports.up = function (knex, Promise) {
  return knex.schema.createTable('TopUp', function (table) {
    table.integer('TopUpId').unsigned().primary()
    table.integer('ClaimId').unsigned().notNullable().references('Claim.ClaimId')
    table.string('PaymentStatus', 100).notNullable()
    table.string('CaseWorker', 100).notNullable()
    table.decimal('TopUpAmount').notNullable()
    table.string('Reason', 2000).notNullable()
    table.dateTime('DateAdded').notNullable()
    table.dateTime('PaymentDate')
  })
    .catch(function (error) {
      console.log(error)
      throw error
    })
}

exports.down = function (knex, Promise) {
  return knex.schema.dropTable('TopUp')
}
