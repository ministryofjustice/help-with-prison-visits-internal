const moment = require('moment')
const authorisation = require('../../services/authorisation')
const applicationRoles = require('../../constants/application-roles-enum')
const audit = require('../../constants/audit-enum')
const addAuditSessionData = require('../../services/add-audit-session-data')
const getAuditSessionData = require('../../services/get-audit-session-data')
const getAllClaimsDataBelowThreshold = require('../../services/data/audit/get-all-claims-data-below-threshold')
const getAllClaimsDataOverThreshold = require('../../services/data/audit/get-all-claims-data-over-threshold')
const updateReport = require('../../services/data/audit/update-report')

module.exports = function (router) {
  router.get('/audit/create-report', function (req, res, next) {
    authorisation.hasRoles(req, [applicationRoles.BAND_9, applicationRoles.CASEWORK_MANAGER_BAND_5])

    const startDate = getAuditSessionData(req, audit.SESSION.START_DATE)
    const endDate = getAuditSessionData(req, audit.SESSION.END_DATE)
    const percentClaim = getAuditSessionData(req, audit.SESSION.PERCENT_CLAIM)
    const claimCountOverThreshold = getAuditSessionData(req, audit.SESSION.CLAIM_COUNT_OVER_THRESHOLD)
    const thresholdAmount = getAuditSessionData(req, audit.SESSION.THRESHOLD_AMOUNT)

    res.render('audit/create-report', {
      startDate: moment(startDate).format(audit.DATE_FORMAT),
      endDate: moment(endDate).format(audit.DATE_FORMAT),
      totalReviewClaim: percentClaim + claimCountOverThreshold,
      claimCountOverThreshold,
      thresholdAmount,
      backLinkHref: "/audit/create-report-percent"
    })
  })

  router.post('/audit/create-report', function (req, res, next) {
    authorisation.hasRoles(req, [applicationRoles.BAND_9, applicationRoles.CASEWORK_MANAGER_BAND_5])

    const startDate = getAuditSessionData(req, audit.SESSION.START_DATE)
    const endDate = getAuditSessionData(req, audit.SESSION.END_DATE)
    const percentClaim = getAuditSessionData(req, audit.SESSION.PERCENT_CLAIM)
    const claimCount = getAuditSessionData(req, audit.SESSION.CLAIM_COUNT_OVER_THRESHOLD)
    const thresholdAmount = getAuditSessionData(req, audit.SESSION.THRESHOLD_AMOUNT)
    const reportId = getAuditSessionData(req, audit.SESSION.REPORT_ID)

    if (reportId) {
      return res.render('audit/report-created', {
        reportId,
        backLinkHref: "/audit"
      })
    }
    getAllClaimsDataBelowThreshold(startDate, endDate, percentClaim, thresholdAmount).then(function (claimsDataBelowThreshold) {
      getAllClaimsDataOverThreshold(startDate, endDate, thresholdAmount).then(function (claimsDataOverThreshold) {
        const claims = [...claimsDataBelowThreshold, ...claimsDataOverThreshold]
        updateReport(claims, startDate, endDate, claimCount).then(function (reportId) {
          addAuditSessionData(req, audit.SESSION.REPORT_ID, reportId)
          return res.render('audit/report-created', {
            reportId,
            backLinkHref: "/audit"
          })
        })
      })
    })
  })
}
