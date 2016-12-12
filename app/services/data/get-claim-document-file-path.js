const config = require('../../../knexfile').intweb
const knex = require('knex')(config)

module.exports = function (claimDocumentId) {
  return knex('ClaimDocument')
    .where({
      'ClaimDocument.ClaimDocumentId': claimDocumentId,
      'ClaimDocument.IsEnabled': true
    })
    .first('ClaimDocument.Filepath')
}
