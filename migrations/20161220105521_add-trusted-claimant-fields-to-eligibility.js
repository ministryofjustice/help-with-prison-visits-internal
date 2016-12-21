exports.up = function (knex, Promise) {
  return knex.schema.table('Eligibility', function (table) {
    table.boolean('IsTrusted').defaultTo(true)
    table.string('UntrustedReason')
    table.dateTime('UntrustedDate')
  })
}

exports.down = function (knex, Promise) {
  return knex.schema.table('Eligibility', function (table) {
    table.dropColumn('IsTrusted')
    table.dropColumn('UntrustedReason')
    table.dropColumn('UntrustedDate')
  })
}
