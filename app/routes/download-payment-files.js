const authorisation = require('../services/authorisation')
const getDirectPaymentFiles = require('../services/data/get-direct-payment-files')
const dateHelper = require('../views/helpers/date-helper')

module.exports = function (router) {
  router.get('/download-payment-files', function (req, res, next) {
    authorisation.isSscl(req)

    getDirectPaymentFiles()
      .then(function (directPaymentFiles) {
        var topAccessPayFile
        var previousAccessPayFiles
        var topAdiJournalFile
        var previousAdiJournalFiles

        if (directPaymentFiles) {
          if (directPaymentFiles.accessPayFiles && directPaymentFiles.accessPayFiles.length > 0) {
            topAccessPayFile = directPaymentFiles.accessPayFiles[0]
            previousAccessPayFiles = directPaymentFiles.accessPayFiles.slice(1)
          }
          if (directPaymentFiles.adiJournalFiles && directPaymentFiles.adiJournalFiles.length > 0) {
            topAdiJournalFile = directPaymentFiles.adiJournalFiles[0]
            previousAdiJournalFiles = directPaymentFiles.adiJournalFiles.slice(1)
          }
        }

        return res.render('download-payment-files', {
          title: 'APVS Download payment files',
          topAccessPayFile: topAccessPayFile,
          previousAccessPayFiles: previousAccessPayFiles,
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
    authorisation.isSscl(req)

    var id = parseInt(req.query.id)
    if (id) {
      getDirectPaymentFiles()
        .then(function (directPaymentFiles) {
          var matchingFile = directPaymentFiles.accessPayFiles.find(function (file) { return file.PaymentFileId === id })
          if (!matchingFile && directPaymentFiles.adiJournalFiles) {
            matchingFile = directPaymentFiles.adiJournalFiles.find(function (file) { return file.PaymentFileId === id })
          }
          if (!matchingFile) {
            throw new Error('Unable to find file')
          }

          return res.download(matchingFile.Filepath)
        })
        .catch(function (error) {
          next(error)
        })
    } else {
      throw new Error('No Id for file provided')
    }
  })
}
