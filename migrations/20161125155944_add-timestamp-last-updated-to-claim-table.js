exports.up = function (knex, Promise) {
  return knex.schema.table('Claim', function (table) {
    table.timestamp('LastUpdated').defaultTo(knex.fn.now())
  })
}

exports.down = function (knex, Promise) {
  return knex.schema.table('Claim', function (table) {
    table.dropColumn('LastUpdated')
  })
}
