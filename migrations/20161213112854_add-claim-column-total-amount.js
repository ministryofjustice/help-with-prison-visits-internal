exports.up = function (knex, Promise) {
  return knex.schema.table('Claim', function (table) {
    table.decimal('TotalAmount')
  })
}

exports.down = function (knex, Promise) {
  return knex.schema.table('Claim', function (table) {
    table.dropColumn('TotalAmount')
  })
}
