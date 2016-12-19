exports.up = function (knex, Promise) {
  return knex.schema.table('ClaimDocument', function (table) {
    table.string('Caseworker', 100)
  })
  .catch(function (error) {
    console.log(error)
    throw error
  })
}

exports.down = function (knex, Promise) {
  return knex.schema.table('ClaimDocument', function (table) {
    table.dropColumn('Caseworker')
  })
  .catch(function (error) {
    console.log(error)
    throw error
  })
}
