const authorisation = require('../services/authorisation')
const getPayoutFiles = require('../services/data/get-payout-files')
const dateHelper = require('../views/helpers/date-helper')

module.exports = function (router) {
  router.get('/download-payout-files', function (req, res, next) {
    authorisation.isAdmin(req)

    getPayoutFiles()
      .then(function (payoutFiles) {
        var topPayoutFile
        var previousPayoutFiles

        if (payoutFiles && payoutFiles.length > 0) {
          topPayoutFile = payoutFiles[0]
          previousPayoutFiles = payoutFiles.slice(1)
        }

        return res.render('download-payout-files', {
          title: 'APVS Download payout files',
          topPayoutFile: topPayoutFile,
          previousPayoutFiles: previousPayoutFiles,
          dateHelper: dateHelper
        })
      })
      .catch(function (error) {
        next(error)
      })
  })

  router.get('/download-payout-files/download', function (req, res) {
    authorisation.isAdmin(req)

    var path = req.query.path
    if (path) {
      res.download(path)
    } else {
      throw new Error('No path to file provided')
    }
  })
}
