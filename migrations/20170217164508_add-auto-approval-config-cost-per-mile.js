exports.up = function (knex, Promise) {
  return knex.schema.table('AutoApprovalConfig', function (table) {
    table.decimal('CostPerMile')
  })
    .then(function () {
      const DEFAULT_COST_PER_MILE = 0.13

      return knex('AutoApprovalConfig')
        .update({ CostPerMile: DEFAULT_COST_PER_MILE })
    })
    .catch(function (error) {
      console.log(error)
      throw error
    })
}

exports.down = function (knex, Promise) {
  return knex.schema.table('AutoApprovalConfig', function (table) {
    table.dropColumn('CostPerMile')
  })
    .catch(function (error) {
      console.log(error)
      throw error
    })
}
