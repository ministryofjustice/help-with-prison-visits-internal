const R = require('ramda')

const getFileUploadPath = function (req) {
  return R.pathOr('', ['file', 'path'], req)
}

const getUploadFilename = function (req) {
  return R.path(['file', 'filename'], req)
}

const getFilenamePrefix = function (params, query) {
  let filenamePrefix = `${params.referenceId}-${query.eligibilityId}/${params.claimId}/${params.documentType}`

  if (params.documentType !== 'VISIT_CONFIRMATION' && params.documentType !== 'RECEIPT') {
    filenamePrefix = `${params.referenceId}-${query.eligibilityId}/${params.documentType}`
  } else if (query.claimExpenseId) {
    filenamePrefix = `${params.referenceId}-${query.eligibilityId}/${params.claimId}/${query.claimExpenseId}/${params.documentType}`
  }

  return filenamePrefix
}

module.exports = {
  getFileUploadPath,
  getUploadFilename,
  getFilenamePrefix
}
