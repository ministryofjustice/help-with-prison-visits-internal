const config = require('../../../knexfile').intweb
const knex = require('knex')(config)
const dateFormatter = require('../date-formatter')

module.exports = function (claimId, assignedTo) {
  return knex('Claim')
    .where({'ClaimId': claimId})
    .update({ 'AssignedTo': assignedTo, 'AssignmentTime': dateFormatter.now().toDate() })
}
