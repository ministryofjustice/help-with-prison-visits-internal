exports.up = function (knex, Promise) {
  return knex.schema.table('ClaimDocument', function (table) {
    table.string('Caseworker', 100)
  })
}

exports.down = function (knex, Promise) {
  return knex.schema.table('ClaimDocument', function (table) {
    table.dropColumn('Caseworker')
  })
}
