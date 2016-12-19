exports.up = function (knex, Promise) {
  return knex.schema.table('Claim', function (table) {
    table.string('PaymentStatus', 20)
  })
  .catch(function (error) {
    console.log(error)
    throw error
  })
}

exports.down = function (knex, Promise) {
  return knex.schema.table('Claim', function (table) {
    table.dropColumn('PaymentStatus')
  })
  .catch(function (error) {
    console.log(error)
    throw error
  })
}
