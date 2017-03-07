const config = require('../../../knexfile').intweb
const knex = require('knex')(config)
const dateFormatter = require('../date-formatter')

module.exports = function (reference, claimId, assignedTo, assignmentTime) {
  return knex('Claim')
    .where({'Reference': reference, 'ClaimId': claimId})
    .update({ 'AssignedTo': assignedTo, 'AssignmentTime': assignmentTime, 'LastUpdated': dateFormatter.now().toDate() })
}
