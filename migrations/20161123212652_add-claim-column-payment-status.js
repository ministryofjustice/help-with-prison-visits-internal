exports.up = function (knex, Promise) {
  return knex.schema.table('Claim', function (table) {
    table.string('PaymentStatus', 20).notNullable().defaultTo('PENDING')
  })
}

exports.down = function (knex, Promise) {
  return knex.schema.table('Claim', function (table) {
    table.dropColumn('PaymentStatus')
  })
}
