exports.up = function (knex, Promise) {
  return knex.schema.table('Claim', function (table) {
    table.string('AssignedTo', 100)
    table.dateTime('AssignmentTime')
  })
  .catch(function (error) {
    console.log(error)
    throw error
  })
}

exports.down = function (knex, Promise) {
  return knex.schema.table('Claim', function (table) {
    table.dropColumn('AssignedTo')
    table.dropColumn('AssignmentTime')
  })
  .catch(function (error) {
    console.log(error)
    throw error
  })
}
