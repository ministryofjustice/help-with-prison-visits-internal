exports.up = function (knex, Promise) {
  return knex.schema.table('AutoApprovalConfig', function (table) {
    table.integer('NumberOfConsecutiveAutoApprovals')
  })
    .then(function () {
      const DEFAULT_NUMBER_OF_CONSECUTIVE_AUTO_APPROVALS = 4

      return knex('AutoApprovalConfig')
        .update({ NumberOfConsecutiveAutoApprovals: DEFAULT_NUMBER_OF_CONSECUTIVE_AUTO_APPROVALS })
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
