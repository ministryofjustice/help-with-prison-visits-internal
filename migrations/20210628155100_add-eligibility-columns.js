exports.up = function (knex, Promise) {
  return knex.schema.table('Eligibility', function (table) {
    table.string('DisabledReason', 2000)
    table.string('ReEnabledReason', 2000)
  })
    .catch(function (error) {
      console.log(error)
      throw error
    })
}

exports.down = function (knex, Promise) {
  return knex.schema.table('Eligibility', function (table) {
    table.dropColumn('DisabledReason')
    table.dropColumn('ReEnabledReason')
  })
    .catch(function (error) {
      console.log(error)
      throw error
    })
}
