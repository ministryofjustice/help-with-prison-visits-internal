exports.up = function (knex, Promise) {
  return knex.schema.table('Prisoner', function (table) {
    table.dateTime('ReleaseDate')
  })
    .catch(function (error) {
      console.log(error)
      throw error
    })
}

exports.down = function (knex, Promise) {
  return knex.schema.table('Prisoner', function (table) {
    table.dropColumn('ReleaseDate')
  })
    .catch(function (error) {
      console.log(error)
      throw error
    })
}
