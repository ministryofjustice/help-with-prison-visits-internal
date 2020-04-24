const config = require('../../../knexfile').intweb
const knex = require('knex')(config)
const dateFormatter = require('../date-formatter')
const environmentVariables = require('../../../config')

module.exports = function (claimId, assignedTo) {
  var assignmentExpiry = null
  if (assignedTo) {
    assignmentExpiry = dateFormatter.now().add(environmentVariables.ASSIGNMENT_EXPIRY_TIME, 'minutes').toDate()
  }
  return knex('Claim')
    .where({ ClaimId: claimId })
    .update({ AssignedTo: assignedTo, AssignmentExpiry: assignmentExpiry, LastUpdated: dateFormatter.now().toDate() })
}
