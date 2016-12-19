exports.up = function (knex, Promise) {
  return knex.schema.table('Claim', function (table) {
    table.dateTime('DateReviewed')
  })
  .catch(function (error) {
    console.log(error)
    throw error
  })
}

exports.down = function (knex, Promise) {
  return knex.schema.table('Claim', function (table) {
    table.dropColumn('DateReviewed')
  })
  .catch(function (error) {
    console.log(error)
    throw error
  })
}
