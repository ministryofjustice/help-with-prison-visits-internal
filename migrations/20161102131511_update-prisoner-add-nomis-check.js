exports.up = function (knex, Promise) {
  return knex.schema.table('Prisoner', function (table) {
    table.string('NomisCheck', 20)
  })
}

exports.down = function (knex, Promise) {
  return knex.schema.table('Prisoner', function (table) {
    table.dropColumn('NomisCheck')
  })
}
