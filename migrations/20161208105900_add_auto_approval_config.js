exports.up = function (knex, Promise) {
  return knex.schema.createTable('AutoApprovalConfig', function (table) {
    table.increments('AutoApprovalConfigId')
    table.string('Caseworker', 100)
    table.dateTime('DateCreated')
    table.boolean('AutoApprovalEnabled')
    table.decimal('CostVariancePercentage')
    table.decimal('MaxClaimTotal')
    table.integer('MaxDaysAfterAPVUVisit')
    table.integer('MaxNumberOfClaimsPerYear')
    table.integer('MaxNumberOfClaimsPerMonth')
    table.string('RulesDisabled', 4000)
    table.boolean('IsEnabled')
  })
    .catch(function (error) {
      console.log(error)
      throw error
    })
}

exports.down = function (knex, Promise) {
  return knex('AutoApprovalConfig')
    .del()
    .then(function () {
      return knex.schema.dropTable('AutoApprovalConfig')
    })
    .catch(function (error) {
      console.log(error)
      throw error
    })
}
