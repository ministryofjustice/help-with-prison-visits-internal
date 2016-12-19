exports.up = function (knex, Promise) {
  return knex.schema.table('AutoApprovalConfig', function (table) {
    table.integer('MaxNumberOfClaimsPerMonth')
  })
}

exports.down = function (knex, Promise) {
  return knex.schema.table('ClaimEvent', function (table) {
    table.dropColumn('MaxNumberOfClaimsPerMonth')
  })
}

