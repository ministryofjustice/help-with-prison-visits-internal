const { getDatabaseConnector } = require('../../databaseConnector')
const dateFormatter = require('../date-formatter')
const environmentVariables = require('../../../config')

module.exports = function (claimId, assignedTo) {
  var assignmentExpiry = null
  const db = getDatabaseConnector()

  if (assignedTo) {
    assignmentExpiry = dateFormatter.now().add(environmentVariables.ASSIGNMENT_EXPIRY_TIME, 'minutes').toDate()
  }
  return db('Claim')
    .where({ ClaimId: claimId })
    .update({ AssignedTo: assignedTo, AssignmentExpiry: assignmentExpiry, LastUpdated: dateFormatter.now().toDate() })
}
