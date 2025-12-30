const { generateToken, isRequestValid, invalidCsrfTokenError } = require('csrf-sync')

const authorisation = require('../../services/authorisation')
const DocumentTypeEnum = require('../../constants/document-type-enum')
const Upload = require('../../services/upload')
const ValidationError = require('../../services/errors/validation-error')
const ERROR_MESSAGES = require('../../services/validators/validation-error-messages')
const FileUpload = require('../../services/domain/file-upload')
const ClaimDocumentUpdate = require('../../services/data/update-file-upload-details-for-claim')
const applicationRoles = require('../../constants/application-roles-enum')
const { AWSHelper } = require('../../services/aws-helper')
const { getFileUploadPath, getUploadFilename, getFilenamePrefix } = require('./file-upload-path-helper')

const aws = new AWSHelper()

let csrfToken
const allowedRoles = [applicationRoles.CLAIM_PAYMENT_BAND_3, applicationRoles.CASEWORK_MANAGER_BAND_5]

module.exports = router => {
  router.get('/claim/file-upload/:referenceId/:claimId/:documentType', (req, res) => {
    authorisation.hasRoles(req, allowedRoles)

    csrfToken = generateToken(req, true)

    if (Object.prototype.hasOwnProperty.call(DocumentTypeEnum, req.params?.documentType)) {
      return res.render('claim/file-upload', {
        claimType: req.params?.claimType,
        document: req.params?.documentType,
        fileUploadGuidingText: DocumentTypeEnum,
        URL: req.url,
      })
    }

    throw new Error('Not a valid document type')
  })

  router.post('/claim/file-upload/:referenceId/:claimId/:documentType', (req, res, next) => {
    authorisation.hasRoles(req, allowedRoles)

    return Upload(req, res, async error => {
      try {
        // If there was no file attached, we still need to check the CSRF token
        if (!req.file) {
          if (!isRequestValid(req)) {
            throw invalidCsrfTokenError
          }
        }

        if (error) {
          if (error.message === 'File too large') {
            throw new ValidationError({ upload: [ERROR_MESSAGES.getUploadTooLarge] })
          } else {
            throw error
          }
        }

        const originalUploadPath = getFileUploadPath(req)

        if (!Object.prototype.hasOwnProperty.call(DocumentTypeEnum, req.params?.documentType)) {
          throw new Error('Not a valid document type')
        }

        const filenamePrefix = getFilenamePrefix(req.params, req.query)
        const filename = getUploadFilename(req)
        const targetFileName = `${filenamePrefix}/${filename}`

        if (req.file) {
          req.file.destination = ''
          req.file.path = targetFileName
        } else {
          req.file = {
            destination: '',
            path: targetFileName,
          }
        }

        const fileUpload = new FileUpload(req.file, req.error, req.query?.claimDocumentId, req.user.email)

        await aws.upload(targetFileName, originalUploadPath)

        return ClaimDocumentUpdate(req.params?.referenceId, fileUpload)
          .then(() => {
            return res.redirect(`/claim/${req.params?.claimId}`)
          })
          .catch(claimDocumentUpdateError => {
            return next(claimDocumentUpdateError)
          })
      } catch (catchError) {
        if (catchError instanceof ValidationError) {
          return res.status(400).render('claim/file-upload', {
            errors: catchError.validationErrors,
            claimType: req.params?.claimType,
            document: req.params?.documentType,
            fileUploadGuidingText: DocumentTypeEnum,
            URL: req.url,
            csrfToken,
          })
        }
        return next(catchError)
      }
    })
  })
}
