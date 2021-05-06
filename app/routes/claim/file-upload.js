const authorisation = require('../../services/authorisation')
const DocumentTypeEnum = require('../../constants/document-type-enum')
const Upload = require('../../services/upload')
const ValidationError = require('../../services/errors/validation-error')
const ERROR_MESSAGES = require('../../services/validators/validation-error-messages')
const FileUpload = require('../../services/domain/file-upload')
const ClaimDocumentUpdate = require('../../services/data/update-file-upload-details-for-claim')
const csrfProtection = require('csurf')({ cookie: true })
const generateCSRFToken = require('../../services/generate-csrf-token')
const applicationRoles = require('../../constants/application-roles-enum')
const { AWSHelper } = require('../../services/aws-helper')
const aws = new AWSHelper()

let csrfToken
const allowedRoles = [applicationRoles.CLAIM_PAYMENT_BAND_3]

module.exports = function (router) {
  router.get('/claim/file-upload/:referenceId/:claimId/:documentType', function (req, res) {
    authorisation.hasRoles(req, allowedRoles)

    csrfToken = generateCSRFToken(req)

    if (Object.prototype.hasOwnProperty.call(DocumentTypeEnum, req.params.documentType)) {
      return res.render('claim/file-upload', {
        claimType: req.params.claimType,
        document: req.params.documentType,
        fileUploadGuidingText: DocumentTypeEnum,
        URL: req.url
      })
    }

    throw new Error('Not a valid document type')
  })

  router.post('/claim/file-upload/:referenceId/:claimId/:documentType', function (req, res, next) {
    authorisation.hasRoles(req, allowedRoles)

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
          const documentType = req.params.documentType
          const originalUploadPath = req.file.path

          if (Object.prototype.hasOwnProperty.call(DocumentTypeEnum, documentType)) {
            let filenamePrefix
            if (req.query.document !== 'VISIT_CONFIRMATION' && req.query.document !== 'RECEIPT') {
              filenamePrefix = `${req.params.referenceId}-${req.query.eligibilityId}/${req.params.documentType}`
            } else if (req.query.claimExpenseId) {
              filenamePrefix = `${req.params.referenceId}-${req.query.eligibilityId}/${req.params.claimId}/${req.query.claimExpenseId}/${req.params.documentType}`
            } else {
              filenamePrefix = `${req.params.referenceId}-${req.query.eligibilityId}/${req.params.claimId}/${req.params.documentType}`
            }

            req.file.path = filenamePrefix

            const fileUpload = new FileUpload(req.file, req.error, req.query.claimDocumentId, req.user.email)
            const filename = req.file.filename
            const targetFileName = `${filenamePrefix}/${filename}`

            try {
              aws.upload(targetFileName, originalUploadPath)
            } catch (error) {
              next(error)
            }

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
