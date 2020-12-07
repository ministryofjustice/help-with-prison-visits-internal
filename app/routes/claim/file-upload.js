const authorisation = require('../../services/authorisation')
const DocumentTypeEnum = require('../../constants/document-type-enum')
const DirectoryCheck = require('../../services/directory-check')
const Upload = require('../../services/upload')
const ValidationError = require('../../services/errors/validation-error')
const ERROR_MESSAGES = require('../../services/validators/validation-error-messages')
const FileUpload = require('../../services/domain/file-upload')
const ClaimDocumentUpdate = require('../../services/data/update-file-upload-details-for-claim')
const csrfProtection = require('csurf')({ cookie: true })
const generateCSRFToken = require('../../services/generate-csrf-token')
let csrfToken

module.exports = function (router) {
  router.get('/claim/file-upload/:referenceId/:claimId/:documentType', function (req, res) {
    authorisation.isCaseworker(req)

    csrfToken = generateCSRFToken(req)

    if (Object.prototype.hasOwnProperty.call(DocumentTypeEnum, req.params.documentType)) {
      let claimId
      if (req.query.document === 'VISIT_CONFIRMATION' || req.query.document === 'RECEIPT') {
        claimId = req.params.claimId
      } else {
        claimId = null
      }
      DirectoryCheck(`${req.params.referenceId}-${req.query.eligibilityId}`, claimId, req.query.claimExpenseId, req.params.documentType)
      return res.render('claim/file-upload', {
        claimType: req.params.claimType,
        document: req.params.documentType,
        fileUploadGuidingText: DocumentTypeEnum,
        URL: req.url
      })
    } else {
      throw new Error('Not a valid document type')
    }
  })

  router.post('/claim/file-upload/:referenceId/:claimId/:documentType', function (req, res, next) {
    authorisation.isCaseworker(req)

    Upload(req, res, function (error) {
      try {
        // If there was no file attached, we still need to check the CSRF token
        if (!req.file) {
          csrfProtection(req, res, function (error) {
            if (error) { throw error }
          })
        }
        if (error) {
          if (error.message === 'File too large') {
            throw new ValidationError({ upload: [ERROR_MESSAGES.getUploadTooLarge] })
          } else {
            throw error
          }
        } else {
          if (Object.prototype.hasOwnProperty.call(DocumentTypeEnum, req.params.documentType)) {
            const fileUpload = new FileUpload(req.file, req.error, req.query.claimDocumentId, req.user.email)
            ClaimDocumentUpdate(req.params.referenceId, fileUpload).then(function () {
              res.redirect(`/claim/${req.params.claimId}`)
            }).catch(function (error) {
              next(error)
            })
          } else {
            throw new Error('Not a valid document type')
          }
        }
      } catch (error) {
        if (error instanceof ValidationError) {
          return res.status(400).render('claim/file-upload', {
            errors: error.validationErrors,
            claimType: req.params.claimType,
            document: req.params.documentType,
            fileUploadGuidingText: DocumentTypeEnum,
            URL: req.url,
            csrfToken: csrfToken
          })
        } else {
          next(error)
        }
      }
    })
  })
}
