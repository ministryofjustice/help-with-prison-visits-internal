const authorisation = require('../../services/authorisation')
const DocumentTypeEnum = require('../../constants/document-type-enum')
const Upload = require('../../services/upload')
const log = require('../../services/log')
const ValidationError = require('../../services/errors/validation-error')
const ERROR_MESSAGES = require('../../services/validators/validation-error-messages')
const FileUpload = require('../../services/domain/file-upload')
const ClaimDocumentUpdate = require('../../services/data/update-file-upload-details-for-claim')
const csrfProtection = require('csurf')({ cookie: true })
const generateCSRFToken = require('../../services/generate-csrf-token')
const applicationRoles = require('../../constants/application-roles-enum')
const config = require('../config')
const fs = require('fs')
const AWS = require('aws-sdk')
const s3 = new AWS.S3({
  accessKeyId: config.AWS_ACCESS_KEY_ID,
  secretAccessKey: config.AWS_SECRET_ACCESS_KEY
})

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

          if (Object.prototype.hasOwnProperty.call(DocumentTypeEnum, documentType)) {
            const fileUpload = new FileUpload(req.file, req.error, req.query.claimDocumentId, req.user.email)
            const claimId = req.params.claimId
            const referenceId = req.params.referenceId
            const filename = req.file.filename
            let targetDir

            if (documentType !== 'VISIT_CONFIRMATION' && documentType !== 'RECEIPT') {
              targetDir = `${referenceId}${config.FILE_SEPARATOR}${config.FILE_SEPARATOR}${config.FILE_SEPARATOR}${documentType}`
            } else {
              targetDir = `${referenceId}${config.FILE_SEPARATOR}${claimId}${config.FILE_SEPARATOR}${config.FILE_SEPARATOR}${documentType}`
            }

            const targetFileName = `${targetDir}${config.FILE_SEPARATOR}${filename}`
            const uploadParams = {
              Bucket: config.AWS_S3_BUCKET_NAME,
              Key: targetFileName,
              Body: ''
            }

            const fileStream = fs.createReadStream(req.file.path)
              .on('error', function (error) {
                log.error('Error occurred writing file ' + targetFileName)
                next(error)
              })
              .on('finish', function () {
                log.info(`Move file to location ${targetFileName}`)
              })

            uploadParams.Body = fileStream

            // call S3 to retrieve upload file to specified bucket
            s3.upload(uploadParams, function (error, data) {
              if (error) {
                log.error('Error', error)
                next(error)
              } if (data) {
                log.info('Upload Success', data.Location)
              }
            })

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
