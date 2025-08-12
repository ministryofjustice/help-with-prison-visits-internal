const moment = require('moment')
const authorisation = require('../../services/authorisation')
const audit = require('../../constants/audit-enum')
const applicationRoles = require('../../constants/application-roles-enum')
const getReportData = require('../../services/data/audit/get-report-data')
const getReportDates = require('../../services/data/audit/get-report-dates')

module.exports = function (router) {
  router.post('/audit/print-report', function (req, res, next) {
    authorisation.hasRoles(req, [applicationRoles.BAND_9, applicationRoles.CASEWORK_MANAGER_BAND_5])
    const reportId = req.body?.reportId

    getReportData(reportId).then(function (claims) {
      getReportDates(reportId).then(function (dates) {
        if (claims) {
          const checkedClaimCount = claims.filter(claim => claim.Band5Validity === audit.CLAIM_STATUS.VALID || claim.Band5Validity === audit.CLAIM_STATUS.INVALID).length
          const validCheckedClaimCount = claims.filter(claim => claim.Band5Validity === audit.CLAIM_STATUS.VALID).length
          const invalidCheckedClaimCount = claims.filter(claim => claim.Band5Validity === audit.CLAIM_STATUS.INVALID).length
          const claimSelectedForVerificationCount = claims.filter(claim => claim.Band9Validity !== audit.STATUS.NOT_REQUIRED).length
          const verifiedClaimCount = claims.filter(claim => claim.Band9Validity === audit.CLAIM_STATUS.VALID || claim.Band9Validity === audit.CLAIM_STATUS.INVALID).length
          const validVerifiedClaimCount = claims.filter(claim => claim.Band9Validity === audit.CLAIM_STATUS.VALID).length
          const invalidVerifiedClaim = claims.filter(claim => claim.Band9Validity === audit.CLAIM_STATUS.INVALID)
          const invalidVerifiedClaimCount = invalidVerifiedClaim.length

          const invalidConfirmedClaimCount = claims.filter(claim => claim.Band5Validity === audit.CLAIM_STATUS.INVALID && claim.Band9Validity === audit.CLAIM_STATUS.INVALID).length
          const validConfirmedClaimCount = claims.filter(claim => claim.Band5Validity === audit.CLAIM_STATUS.INVALID && claim.Band9Validity === audit.CLAIM_STATUS.VALID).length

          const totalCheckedAmount = claims.reduce((n, {
            PaymentAmount
          }) => n + PaymentAmount, 0)
          const startDate = moment(dates[0].StartDate).format(audit.DATE_FORMAT)
          const endDate = moment(dates[0].EndDate).format(audit.DATE_FORMAT)
          const dateTime = moment().format('MMMM Do YYYY, h:mm:ss a')
          const reportData = invalidVerifiedClaim
          const userName = req.user.name
          res.render('audit/print-report', {
            startDate,
            endDate,
            reportData,
            userName,
            dateTime,
            checkedClaimCount,
            validCheckedClaimCount,
            verifiedClaimCount,
            validVerifiedClaimCount,
            totalCheckedAmount,
            invalidCheckedClaimCount,
            claimSelectedForVerificationCount,
            invalidVerifiedClaimCount,
            invalidConfirmedClaimCount,
            validConfirmedClaimCount,
            backLinkHref: `/audit/view-report/${reportId}`
          })
        } else {
          res.render('audit/view-report', {
            reportDeleted: true,
            backLinkHref: `/audit/view-report/${reportId}`
          })
        }
      })
    })
  })
}
