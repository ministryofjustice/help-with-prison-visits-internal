const config = require('../../../knexfile').intweb
const knex = require('knex')(config)
const dateFormatter = require('../date-formatter')

module.exports = function (reference, claimId, assignedTo) {
  return knex('Claim')
    .where({'Reference': reference, 'ClaimId': claimId})
    .update({ 'AssignedTo': assignedTo, 'AssignmentTime': dateFormatter.now().toDate(), 'LastUpdated': dateFormatter.now().toDate() })
}
