const { getDatabaseConnector } = require('../../databaseConnector')
const FileUpload = require('../domain/file-upload')

module.exports = (reference, fileUpload) => {
  if (!(fileUpload instanceof FileUpload)) {
    throw new Error('Provided fileUpload object is not an instance of the expected class')
  }

  const db = getDatabaseConnector()

  return db('ClaimDocument').where('ClaimDocumentId', '=', fileUpload.claimDocumentId).update({
    DocumentStatus: fileUpload.documentStatus,
    Filepath: fileUpload.path,
    DateSubmitted: fileUpload.dateSubmitted,
    Caseworker: fileUpload.caseworker,
  })
}
