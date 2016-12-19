exports.up = function (knex, Promise) {
  return knex.schema.table('Claim', function (table) {
    table.string('VisitConfirmationCheck', 20)
  })
  .catch(function (error) {
    console.log(error)
    throw error
  })
}

exports.down = function (knex, Promise) {
  return knex.schema.table('Claim', function (table) {
    table.dropColumn('VisitConfirmationCheck')
  })
  .catch(function (error) {
    console.log(error)
    throw error
  })
}
