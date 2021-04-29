const authorisation = require('../services/authorisation')
const getDirectPaymentFiles = require('../services/data/get-direct-payment-files')
const dateHelper = require('../views/helpers/date-helper')
const applicationRoles = require('../constants/application-roles-enum')
const config = require('../../config')
const fs = require('fs')
const AWS = require('aws-sdk')
const s3 = new AWS.S3({
  accessKeyId: config.AWS_ACCESS_KEY_ID,
  secretAccessKey: config.AWS_SECRET_ACCESS_KEY
})

module.exports = function (router) {
  router.get('/download-payment-files', function (req, res, next) {
    authorisation.hasRoles(req, [applicationRoles.HWPV_SSCL])

    getDirectPaymentFiles()
      .then(function (directPaymentFiles) {
        let topAccessPayFile
        let previousAccessPayFiles
        let topAdiJournalFile
        let previousAdiJournalFiles
        let topApvuAccessPayFile
        let previousApvuAccessPayFiles

        if (directPaymentFiles) {
          if (directPaymentFiles.accessPayFiles && directPaymentFiles.accessPayFiles.length > 0) {
            topAccessPayFile = directPaymentFiles.accessPayFiles[0]
            previousAccessPayFiles = directPaymentFiles.accessPayFiles.slice(1)
          }
          if (directPaymentFiles.adiJournalFiles && directPaymentFiles.adiJournalFiles.length > 0) {
            topAdiJournalFile = directPaymentFiles.adiJournalFiles[0]
            previousAdiJournalFiles = directPaymentFiles.adiJournalFiles.slice(1)
          }
          if (directPaymentFiles.apvuAccessPayFiles && directPaymentFiles.apvuAccessPayFiles.length > 0) {
            topApvuAccessPayFile = directPaymentFiles.apvuAccessPayFiles[0]
            previousApvuAccessPayFiles = directPaymentFiles.apvuAccessPayFiles.slice(1)
          }
        }

        return res.render('download-payment-files', {
          title: 'APVS Download payment files',
          topAccessPayFile: topAccessPayFile,
          previousAccessPayFiles: previousAccessPayFiles,
          topApvuAccessPayFile: topApvuAccessPayFile,
          previousApvuAccessPayFiles: previousApvuAccessPayFiles,
          topAdiJournalFile: topAdiJournalFile,
          previousAdiJournalFiles: previousAdiJournalFiles,
          dateHelper: dateHelper
        })
      })
      .catch(function (error) {
        next(error)
      })
  })

  router.get('/download-payment-files/download', function (req, res, next) {
    authorisation.hasRoles(req, [applicationRoles.HWPV_SSCL])

    const id = parseInt(req.query.id)
    if (id) {
      getDirectPaymentFiles()
        .then(function (directPaymentFiles) {
          let matchingFile = directPaymentFiles.accessPayFiles.find(function (file) { return file.PaymentFileId === id })
          if (!matchingFile && directPaymentFiles.adiJournalFiles) {
            matchingFile = directPaymentFiles.adiJournalFiles.find(function (file) { return file.PaymentFileId === id })
          }
          if (!matchingFile && directPaymentFiles.apvuAccessPayFiles) {
            matchingFile = directPaymentFiles.apvuAccessPayFiles.find(function (file) { return file.PaymentFileId === id })
          }
          if (!matchingFile) {
            throw new Error('Unable to find file')
          }

          const filename = matchingFile.Filepath
          if (filename) {
            const downloadParams = {
              Bucket: config.AWS_S3_BUCKET_NAME,
              Key: filename
            }

            s3.getObject(downloadParams).promise().then((data) => {
              const tempFilename = filename.split('/').join('')
              const tempFile = `${config.FILE_TMP_DIR}/${tempFilename}`
              fs.writeFileSync(tempFile, data.Body)
              return res.download(tempFile, filename)
            }).catch((err) => {
              throw err
            })
          } else {
            throw new Error('No path to file provided')
          }
        })
        .catch(function (error) {
          next(error)
        })
    } else {
      throw new Error('No Id for file provided')
    }
  })
}
