exports.up = function (knex, Promise) {
  return knex.schema.table('Claim', function (table) {
    table.dateTime('PaymentDate')
    table.dateTime('DateApproved')
  })
    .catch(function (error) {
      console.log(error)
      throw error
    })
}

exports.down = function (knex, Promise) {
  return knex.schema.table('Claim', function (table) {
    table.dropColumn('PaymentDate')
    table.dropColumn('DateApproved')
  })
    .catch(function (error) {
      console.log(error)
      throw error
    })
}
