exports.up = function (knex, Promise) {
  return knex.schema.table('Claim', function (table) {
    table.decimal('ManuallyProcessedAmount')
  })
}

exports.down = function (knex, Promise) {
  return knex.schema.table('Claim', function (table) {
    table.dropColumn('ManuallyProcessedAmount')
  })
}
