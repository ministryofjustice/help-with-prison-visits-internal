const DocumentTypeEnum = require('../../constants/document-type-enum')
// const csrfProtection = require('csurf')({ cookie: true })
// const generateCSRFToken = require('../../../../services/generate-csrf-token')
// var csrfToken

module.exports = function (router) {
  router.get('/claim/file-upload/:referenceId/:claimId/:documentType', function (req, res) {
    // csrfToken = generateCSRFToken(req)

    if (DocumentTypeEnum.hasOwnProperty(req.params.documentType)) {
      res.render('claim/file-upload', {
        document: req.params.documentType,
        fileUploadGuidingText: DocumentTypeEnum
      })
    } else {
      throw new Error('Not a valid document type')
    }
  })
}
