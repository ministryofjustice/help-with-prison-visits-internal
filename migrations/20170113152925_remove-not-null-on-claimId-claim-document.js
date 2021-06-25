exports.up = function (knex, Promise) {
  return knex.schema.alterTable('ClaimDocument', function (table) {
    table.integer('ClaimId').unsigned().alter()
  })
    .catch(function (error) {
      console.log(error)
      throw error
    })
}

exports.down = function (knex, Promise) {
  return knex.schema.alterTable('ClaimDocument', function (table) {
    table.integer('ClaimId').unsigned().notNullable().alter()
  })
    .catch(function (error) {
      console.log(error)
      throw error
    })
}
