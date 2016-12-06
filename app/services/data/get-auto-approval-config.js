const config = require('../../../knexfile').intweb
const knex = require('knex')(config)

module.exports = function () {
  return knex('AutoApprovalConfig')
    .where('IsEnabled', true)
    .orderBy('DateCreated', 'desc')
    .first()
}
