const config = require('../../../knexfile').intweb
const knex = require('knex')(config)
const FileUpload = require('../domain/file-upload')

module.exports = function (reference, eligibilityId, claimId, fileUpload) {
  if (!(fileUpload instanceof FileUpload)) {
    throw new Error('Provided fileUpload object is not an instance of the expected class')
  }
  return knex('ClaimDocument')
    .where('ClaimDocumentId', '=', fileUpload.claimDocumentId)
    .update({
      DocumentStatus: fileUpload.documentStatus,
      Filepath: fileUpload.path,
      DateSubmitted: fileUpload.dateSubmitted,
      Caseworker: fileUpload.caseworker
    })
}
