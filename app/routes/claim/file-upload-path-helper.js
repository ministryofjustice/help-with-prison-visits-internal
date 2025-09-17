const getFileUploadPath = req => {
  return req.file?.path ?? ''
}

const getUploadFilename = req => {
  return req.file?.filename
}

const getFilenamePrefix = (params, query) => {
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
  getFilenamePrefix,
}
