exports.up = function (knex, Promise) {
  return knex.schema.table('ClaimBankDetail', function (table) {
    table.string('NameOnAccount', 100).notNullable()
  })
    .catch(function (error) {
      console.log(error)
      throw error
    })
}

exports.down = function (knex, Promise) {
  return knex.schema.table('ClaimBankDetail', function (table) {
    table.dropColumn('NameOnAccount')
  })
    .catch(function (error) {
      console.log(error)
      throw error
    })
}
