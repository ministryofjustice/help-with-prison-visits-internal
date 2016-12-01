exports.up = function (knex, Promise) {
  return knex.schema.table('Claim', function (table) {
    table.dateTime('DateReviewed')
  })
}

exports.down = function (knex, Promise) {
  return knex.schema.table('Claim', function (table) {
    table.dropColumn('DateReviewed')
  })
}
