const config = require('../../../knexfile').intweb
const knex = require('knex')(config)

module.exports = function (deductionId) {
  return knex('ClaimDeduction')
    .where('ClaimDeductionId', deductionId)
    .update({
      IsEnabled: false
    })
}
