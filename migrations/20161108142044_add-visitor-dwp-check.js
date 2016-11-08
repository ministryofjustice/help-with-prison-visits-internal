exports.up = function (knex, Promise) {
  return knex.schema.table('Visitor', function (table) {
    table.string('DWPCheck', 100)
  })
}

exports.down = function (knex, Promise) {
  return knex.schema.table('Visitor', function (table) {
    table.dropColumn('DWPCheck')
  })
}
