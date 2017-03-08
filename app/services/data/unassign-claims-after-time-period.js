const config = require('../../../knexfile').intweb
const knex = require('knex')(config)
const enviromentVariables = require('../../../config')
const dateFormatter = require('../date-formatter')

module.exports = function () {
  return knex('Claim')
    .whereNotNull('AssignedTo')
    .andWhere('AssignmentTime', '<=', dateFormatter.now().subtract(enviromentVariables.TIME_FOR_UNASSIGNMENT, 'minutes').toDate())
    .update({ 'AssignedTo': null, 'AssignmentTime': null })
}
