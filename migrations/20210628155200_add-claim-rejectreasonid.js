exports.up = function (knex, Promise) {
  return knex.schema.table('Claim', function (table) {
    table.integer('RejectionReasonId').unsigned()
  })
    .catch(function (error) {
      console.log(error)
      throw error
    })
}

exports.down = function (knex, Promise) {
  return knex.schema.table('Claim', function (table) {
    table.dropColumn('RejectionReasonId')
  })
    .catch(function (error) {
      console.log(error)
      throw error
    })
}
