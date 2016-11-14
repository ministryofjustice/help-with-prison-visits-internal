exports.up = function (knex, Promise) {
  return knex.schema.table('Claim', function (table) {
    table.string('VisitConfirmationCheck', 20)
  })
}

exports.down = function (knex, Promise) {
  return knex.schema.table('Claim', function (table) {
    table.dropColumn('VisitConfirmationCheck')
  })
}
