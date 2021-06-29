exports.up = function (knex, Promise) {
  return knex.schema.table('Eligibility', function (table) {
    table.integer('ReferenceDisabled').unsigned()
  })
    .catch(function (error) {
      console.log(error)
      throw error
    })
}

exports.down = function (knex, Promise) {
  return knex.schema.table('Eligibility', function (table) {
    table.dropColumn('ReferenceDisabled')
  })
    .catch(function (error) {
      console.log(error)
      throw error
    })
}
