const moment = require('moment')
const authorisation = require('../../services/authorisation')
const applicationRoles = require('../../constants/application-roles-enum')
const audit = require('../../constants/audit-enum')
const addAuditSessionData = require('../../services/add-audit-session-data')
const getAuditSessionData = require('../../services/get-audit-session-data')

let validationErrors

module.exports = function (router) {
  router.get('/audit/create-report-percent', function (req, res, next) {
    authorisation.hasRoles(req, [applicationRoles.BAND_9, applicationRoles.CASEWORK_MANAGER_BAND_5])

    const startDate = getAuditSessionData(req, audit.SESSION.START_DATE)
    const endDate = getAuditSessionData(req, audit.SESSION.END_DATE)
    const claimCount = getAuditSessionData(req, audit.SESSION.CLAIM_COUNT)
    const claimCountOverThreshold = getAuditSessionData(req, audit.SESSION.CLAIM_COUNT_OVER_THRESHOLD)
    const thresholdAmount = getAuditSessionData(req, audit.SESSION.THRESHOLD_AMOUNT)
    res.render('audit/create-report-percent', {
      startDate: moment(startDate).format(audit.DATE_FORMAT),
      endDate: moment(endDate).format(audit.DATE_FORMAT),
      claimCount,
      claimCountOverThreshold,
      thresholdAmount,
      backLinkHref: '/audit/create-report-date'
    })
  })

  router.post('/audit/create-report-percent', function (req, res, next) {
    authorisation.hasRoles(req, [applicationRoles.BAND_9, applicationRoles.CASEWORK_MANAGER_BAND_5])
    validationErrors = {}
    const auditReportPercent = req.body.auditReportPercent

    if (!auditReportPercent || isNaN(auditReportPercent)) {
      validationErrors.auditReportPercent = ['Enter the percentage in numbers']
    } else if (auditReportPercent <= 0 || auditReportPercent > 100) {
      validationErrors.auditReportPercent = ['The percentage should be between 0 and 100']
    }

    for (const field in validationErrors) {
      if (Object.prototype.hasOwnProperty.call(validationErrors, field)) {
        if (validationErrors[field].length > 0) {
          const startDate = getAuditSessionData(req, audit.SESSION.START_DATE)
          const endDate = getAuditSessionData(req, audit.SESSION.END_DATE)
          return res.status(400).render('audit/create-report-percent', {
            query: req.body,
            errors: validationErrors,
            startDate: moment(startDate).format(audit.DATE_FORMAT),
            endDate: moment(endDate).format(audit.DATE_FORMAT),
            backLinkHref: '/audit/create-report-date'
          })
        }
      }
    }

    const claimCount = getAuditSessionData(req, audit.SESSION.CLAIM_COUNT)
    const claimCountOverThreshold = getAuditSessionData(req, audit.SESSION.CLAIM_COUNT_OVER_THRESHOLD)

    const percentClaim = Math.ceil((claimCount - claimCountOverThreshold) * auditReportPercent * 0.01)
    addAuditSessionData(req, audit.SESSION.REPORT_ID, undefined)
    addAuditSessionData(req, audit.SESSION.PERCENT_CLAIM, percentClaim)
    res.redirect('/audit/create-report')
  })
}
