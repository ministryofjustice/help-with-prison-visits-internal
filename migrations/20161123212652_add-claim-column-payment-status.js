exports.up = function (knex, Promise) {
  return knex.schema.table('Claim', function (table) {
    table.string('PaymentStatus', 20)
  })
}

exports.down = function (knex, Promise) {
  return knex.schema.table('Claim', function (table) {
    table.dropColumn('PaymentStatus')
  })
}
