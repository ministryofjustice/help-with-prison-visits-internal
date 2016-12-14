exports.up = function (knex, Promise) {
  return knex.schema.table('Claim', function (table) {
    table.dropColumn('PaymentAmount')
    table.decimal('BankPaymentAmount')
  })
}

exports.down = function (knex, Promise) {
  return knex.schema.table('Claim', function (table) {
    table.dropColumn('BankPaymentAmount')
    table.decimal('PaymentAmount')
  })
}
