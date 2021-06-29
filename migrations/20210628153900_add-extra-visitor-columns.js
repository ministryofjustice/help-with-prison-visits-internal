exports.up = function (knex, Promise) {
  return knex.schema.table('Visitor', function (table) {
    table.dateTime('BenefitExpiryDate')
  })
    .catch(function (error) {
      console.log(error)
      throw error
    })
}

exports.down = function (knex, Promise) {
  return knex.schema.table('Visitor', function (table) {
    table.dropColumn('BenefitExpiryDate')
  })
    .catch(function (error) {
      console.log(error)
      throw error
    })
}
