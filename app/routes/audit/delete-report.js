const authorisation = require('../../services/authorisation')
const applicationRoles = require('../../constants/application-roles-enum')
const deleteReport = require('../../services/data/audit/delete-report')

let validationErrors

module.exports = function (router) {
  router.post('/audit/delete-report', function (req, res, next) {
    authorisation.hasRoles(req, [applicationRoles.BAND_9, applicationRoles.CASEWORK_MANAGER_BAND_5])
    const reportId = req.body.reportId
    const deleteConfirmation = req.body.deleteConfirmation
    validationErrors = {}
    if (!deleteConfirmation) {
      validationErrors.deleteConfirmation = ['Please select one of the choices']
    }
    for (const field in validationErrors) {
      if (Object.prototype.hasOwnProperty.call(validationErrors, field)) {
        if (validationErrors[field].length > 0) {
          return res.status(400).render('audit/delete-report-confirmation', {
            errors: validationErrors,
            reportId,
            backLinkHref: `/audit/view-report/${reportId}`
          })
        }
      }
    }

    if (deleteConfirmation === 'yes') {
      deleteReport(reportId).then(function () {
        res.render('audit/report-deleted', { backLinkHref: '/audit' })
      })
    } else {
      res.redirect(`/audit/view-report/${reportId}`)
    }
  })

  router.post('/audit/delete-report-confirmation', function (req, res, next) {
    authorisation.hasRoles(req, [applicationRoles.BAND_9, applicationRoles.CASEWORK_MANAGER_BAND_5])
    const reportId = req.body.reportId

    res.render('audit/delete-report-confirmation', {
      reportId,
      backLinkHref: `/audit/view-report/${reportId}`
    })
  })
}
