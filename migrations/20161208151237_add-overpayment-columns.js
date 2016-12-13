exports.up = function (knex, Promise) {
  return knex.schema.table('Claim', function (table) {
    table.boolean('IsOverpaid')
    table.decimal('OverpaymentAmount')
    table.decimal('RemainingOverpaymentAmount')
    table.string('OverpaymentReason', 250)
  })
}

exports.down = function (knex, Promise) {
  return knex.schema.table('Claim', function (table) {
    table.dropColumn('IsOverpaid')
    table.dropColumn('OverpaymentAmount')
    table.dropColumn('RemainingOverpaymentAmount')
    table.dropColumn('OverpaymentReason')
  })
}
