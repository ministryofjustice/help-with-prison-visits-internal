exports.up = function (knex, Promise) {
  return knex.schema.createTable('ClaimRejectionReason', function (table) {
    table.integer('ClaimRejectionReasonId').unsigned().primary()
    table.string('RejectionReason', 1000).notNullable()
    table.boolean('IsEnabled')
  })
    .catch(function (error) {
      console.log(error)
      throw error
    })
}

exports.down = function (knex, Promise) {
  return knex.schema.dropTable('ClaimRejectionReason')
}
