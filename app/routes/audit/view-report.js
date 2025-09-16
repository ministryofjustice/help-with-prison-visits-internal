/* eslint-disable eqeqeq */
const moment = require('moment')
const authorisation = require('../../services/authorisation')
const applicationRoles = require('../../constants/application-roles-enum')
const audit = require('../../constants/audit-enum')
const getReportData = require('../../services/data/audit/get-report-data')
const getReportDates = require('../../services/data/audit/get-report-dates')
const getAuditConfig = require('../../services/data/audit/get-audit-config')
const setForVerification = require('../../services/data/audit/set-for-verification')
const updateAuditStatus = require('../../services/data/audit/update-audit-data')

module.exports = router => {
  router.get('/audit/view-report/:reportId', (req, res, next) => {
    authorisation.hasRoles(req, [applicationRoles.BAND_9, applicationRoles.CASEWORK_MANAGER_BAND_5])
    const reportId = req.params?.reportId
    getReportData(reportId).then(result => {
      getReportDates(reportId).then(dates => {
        if (result) {
          const startDate = dates[0].StartDate
          const endDate = dates[0].EndDate
          const claimCheckList = result.map(mapRes => getClaimCheckList(mapRes))
          const uncheckedClaimCount = claimCheckList.filter(
            claim => claim.initialCheck === audit.STATUS.NOT_CHECKED,
          ).length
          const isCheckCompleted = uncheckedClaimCount == 0
          const uncheckedClaimCountResult =
            uncheckedClaimCount == claimCheckList.length ? audit.STATUS.NOT_STARTED : audit.STATUS.IN_PROGRESS
          const checkStatus = isCheckCompleted ? audit.STATUS.COMPLETED : uncheckedClaimCountResult
          const isClaimsForVerificationNotSet =
            claimCheckList.filter(claim => claim.verificationCheck !== '').length == 0 && isCheckCompleted
          const isVerificationCompleted =
            claimCheckList.filter(
              claim =>
                claim.verificationCheck !== audit.CLAIM_STATUS.VALID &&
                claim.verificationCheck !== audit.CLAIM_STATUS.INVALID &&
                claim.verificationCheck !== audit.STATUS.NOT_REQUIRED,
            ).length == 0
          const isVerificationStarted =
            claimCheckList.filter(
              claim =>
                claim.verificationCheck === audit.CLAIM_STATUS.VALID ||
                claim.verificationCheck === audit.CLAIM_STATUS.INVALID,
            ).length != 0
          const isVerificationStartedResult = isVerificationStarted
            ? audit.STATUS.IN_PROGRESS
            : audit.STATUS.NOT_STARTED
          const verificationStatus = isVerificationCompleted ? audit.STATUS.COMPLETED : isVerificationStartedResult

          const finalStatus =
            isCheckCompleted && isVerificationCompleted ? audit.STATUS.COMPLETED : uncheckedClaimCountResult
          updateAuditStatus(reportId, checkStatus, verificationStatus, finalStatus).then(() => {
            getAuditConfig().then(auditConfigResult => {
              const verificationPercent = auditConfigResult.VerificationPercent
              const initialCheckValidClaimCount = claimCheckList.filter(
                claim => claim.initialCheck === audit.CLAIM_STATUS.VALID,
              ).length
              const noOfValidClaimsToBeVerified = Math.ceil(initialCheckValidClaimCount * verificationPercent * 0.01)
              if (isClaimsForVerificationNotSet) {
                setForVerification(reportId, noOfValidClaimsToBeVerified).then(() => {
                  getReportData(reportId).then(reportDataResult => {
                    const updatedClaimCheckList = reportDataResult.map(reportDataRes =>
                      getClaimCheckList(reportDataRes),
                    )
                    res.render('audit/view-report', {
                      startDate: moment(startDate).format(audit.DATE_FORMAT),
                      endDate: moment(endDate).format(audit.DATE_FORMAT),
                      claimCheckList: updatedClaimCheckList,
                      reportId,
                      auditStatus: finalStatus,
                      backLinkHref: '/audit',
                    })
                  })
                })
              } else {
                res.render('audit/view-report', {
                  startDate: moment(startDate).format(audit.DATE_FORMAT),
                  endDate: moment(endDate).format(audit.DATE_FORMAT),
                  claimCheckList,
                  reportId,
                  auditStatus: finalStatus,
                  backLinkHref: '/audit',
                })
              }
            })
          })
        } else {
          res.render('audit/view-report', {
            reportDeleted: true,
            backLinkHref: '/audit',
          })
        }
      })
    })
  })
}

function getClaimCheckList(data) {
  return {
    reference: data.Reference,
    initialCheck: data.Band5Validity,
    verificationCheck: data.Band9Validity,
  }
}
