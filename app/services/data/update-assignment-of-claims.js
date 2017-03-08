const config = require('../../../knexfile').intweb
const knex = require('knex')(config)
const dateFormatter = require('../date-formatter')
const environmentVariables = require('../../../config')

module.exports = function (claimId, assignedTo) {
  return knex('Claim')
    .where({'ClaimId': claimId})
    .update({ 'AssignedTo': assignedTo, 'AssignmentExpiry': dateFormatter.now().add(environmentVariables.ASSIGNMENT_EXPIRY_TIME, 'minutes').toDate() })
}
