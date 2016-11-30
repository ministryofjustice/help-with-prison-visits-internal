exports.up = function (knex, Promise) {
  return knex.schema.table('Claim', function (table) {
    table.decimal('PaymentAmount')
  })
}

exports.down = function (knex, Promise) {
  return knex.schema.table('Claim', function (table) {
    table.decimal('PaymentAmount')
  })
}
