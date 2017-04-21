exports.up = function (knex, Promise) {
  return knex.schema.table('Visitor', function (table) {
    table.string('DWPBenefitCheckerResult', 100)
    table.string('DWPCheck', 100)
  })
}

exports.down = function (knex, Promise) {
  return knex.schema.table('Visitor', function (table) {
    table.dropColumn('DWPBenefitCheckerResult')
    table.dropColumn('DWPCheck')
  })
}
