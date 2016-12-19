exports.up = function (knex, Promise) {
  return knex.schema.table('Claim', function (table) {
    table.string('AssistedDigitalCaseworker', 100)
    table.string('Caseworker', 100)
  })
  .catch(function (error) {
    console.log(error)
    throw error
  })
}

exports.down = function (knex, Promise) {
  return knex.schema.table('Claim', function (table) {
    table.dropColumn('AssistedDigitalCaseworker')
    table.dropColumn('Caseworker')
  })
  .catch(function (error) {
    console.log(error)
    throw error
  })
}
