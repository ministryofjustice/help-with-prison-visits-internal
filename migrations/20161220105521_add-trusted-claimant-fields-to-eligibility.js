exports.up = function (knex, Promise) {
  return knex.schema.table('Eligibility', function (table) {
    table.boolean('IsUntrusted').defaultTo(false)
    table.string('UntrustedReason')
  })
}

exports.down = function (knex, Promise) {
  return knex.schema.table('Eligibility', function (table) {
    table.dropColumn('IsUntrusted')
    table.dropColumn('UntrustedReason')
  })
}
