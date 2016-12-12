exports.up = function (knex, Promise) {
  return knex.schema.table('Claim', function (table) {
    table.boolean('IsOverpaid')
    table.decimal('OverpaymentAmount')
    table.decimal('OutstandingOverpaymentAmount')
  })
}

exports.down = function (knex, Promise) {
  return knex.schema.table('Claim', function (table) {
    table.dropColumn('IsOverpaid')
    table.dropColumn('OverpaymentAmount')
    table.dropColumn('RemainingOverpaymentAmount')
  })
}
