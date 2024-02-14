const moment = require('moment')
const authorisation = require('../../services/authorisation')
const applicationRoles = require('../../constants/application-roles-enum')
const getReportData = require('../../services/data/audit/get-report-data')
const getReportDates = require('../../services/data/audit/get-report-dates')
const getAuditConfig = require('../../services/data/audit/get-audit-config')
const setForVerification = require('../../services/data/audit/set-for-verification')
const updateAuditStatus = require('../../services/data/audit/update-audit-data')

module.exports = function (router) {
  router.get('/audit/view-report/:reportId', function (req, res, next) {
    authorisation.hasRoles(req, [applicationRoles.BAND_9, applicationRoles.CASEWORK_MANAGER_BAND_5])
    const reportId = req.params.reportId
    getReportData(reportId).then(function (result) {
      getReportDates(reportId).then(function (dates) {
        if (result) {
          const startDate = dates[0].StartDate
          const endDate = dates[0].EndDate
          const claimCheckList = result.map(res => getClaimCheckList(res))
          const uncheckedClaimCount = claimCheckList.filter(claim => claim.initialCheck === 'Not checked').length
          const isCheckCompleted = uncheckedClaimCount === 0
          const checkStatus = isCheckCompleted ? 'Completed' : uncheckedClaimCount === claimCheckList.length ? 'NotStarted' : 'InProgress'
          const isClaimsForVerificationNotSet = claimCheckList.filter(claim => claim.verificationCheck !== '').length === 0 && isCheckCompleted
          const isVerificationCompleted = claimCheckList.filter(claim => claim.verificationCheck !== 'Valid' && claim.verificationCheck !== 'Invalid' && claim.verificationCheck !== 'Not required').length === 0
          const isVerificationStarted = claimCheckList.filter(claim => claim.verificationCheck === 'Valid' || claim.verificationCheck === 'Invalid').length !== 0
          const verificationStatus = isVerificationCompleted ? 'Completed' : isVerificationStarted ? 'InProgress' : 'NotStarted'

          const finalStatus = isCheckCompleted && isVerificationCompleted ? 'Completed' : uncheckedClaimCount === claimCheckList.length ? 'NotStarted' : 'InProgress'
          updateAuditStatus(reportId, checkStatus, verificationStatus, finalStatus).then(function () {
            getAuditConfig().then(function (result) {
              const verificationPercent = result.VerificationPercent
              const initialCheckValidClaimCount = claimCheckList.filter(claim => claim.initialCheck === 'Valid').length
              const noOfValidClaimsToBeVerified = Math.ceil(initialCheckValidClaimCount * verificationPercent * 0.01)
              if (isClaimsForVerificationNotSet) {
                setForVerification(reportId, noOfValidClaimsToBeVerified).then(function (result) {
                  getReportData(reportId).then(function (result) {
                    const updatedClaimCheckList = result.map(res => getClaimCheckList(res))
                    res.render('audit/view-report', {
                      startDate: moment(startDate).format('DD MMMM YYYY'),
                      endDate: moment(endDate).format('DD MMMM YYYY'),
                      claimCheckList: updatedClaimCheckList,
                      reportId,
                      auditStatus: finalStatus
                    })
                  })
                })
              } else {
                res.render('audit/view-report', {
                  startDate: moment(startDate).format('DD MMMM YYYY'),
                  endDate: moment(endDate).format('DD MMMM YYYY'),
                  claimCheckList,
                  reportId,
                  auditStatus: finalStatus
                })
              }
            })
          })
        } else {
          res.render('audit/view-report', {
            reportDeleted: true
          })
        }
      })
    })
  })
}

function getClaimCheckList (data) {
  return {
    reference: data.Reference,
    initialCheck: data.Band5Validity,
    verificationCheck: data.Band9Validity
  }
}
