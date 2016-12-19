exports.up = function (knex, Promise) {
  return knex.schema.table('Claim', function (table) {
    table.decimal('PaymentAmount')
  })
  .catch(function (error) {
    console.log(error)
    throw error
  })
}

exports.down = function (knex, Promise) {
  return knex.schema.table('Claim', function (table) {
    table.dropColumn('PaymentAmount')
  })
  .catch(function (error) {
    console.log(error)
    throw error
  })
}
