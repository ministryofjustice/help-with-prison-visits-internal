exports.up = function (knex, Promise) {
  return knex.schema.table('Claim', function (table) {
    table.string('ClaimType', 50)
  })
  .catch(function (error) {
    console.log(error)
    throw error
  })
}

exports.down = function (knex, Promise) {
  return knex.schema.table('Claim', function (table) {
    table.dropColumn('ClaimType')
  })
  .catch(function (error) {
    console.log(error)
    throw error
  })
}
