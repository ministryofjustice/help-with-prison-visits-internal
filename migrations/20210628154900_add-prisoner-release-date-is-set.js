exports.up = function (knex, Promise) {
  return knex.schema.table('Prisoner', function (table) {
    table.boolean('ReleaseDateIsSet')
  })
    .catch(function (error) {
      console.log(error)
      throw error
    })
}

exports.down = function (knex, Promise) {
  return knex.schema.table('Prisoner', function (table) {
    table.dropColumn('ReleaseDateIsSet')
  })
    .catch(function (error) {
      console.log(error)
      throw error
    })
}
