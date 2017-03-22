exports.up = function (knex, Promise) {
  return knex.schema.table('AutoApprovalConfig', function (table) {
    table.integer('NumberOfConsecutiveAutoApprovals')
  })
  .catch(function (error) {
    console.log(error)
    throw error
  })
}

exports.down = function (knex, Promise) {
  return knex.schema.table('AutoApprovalConfig', function (table) {
    table.dropColumn('NumberOfConsecutiveAutoApprovals')
  })
  .catch(function (error) {
    console.log(error)
    throw error
  })
}
