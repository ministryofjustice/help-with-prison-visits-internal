const moment = require('moment')
const authorisation = require('../../services/authorisation')
const applicationRoles = require('../../constants/application-roles-enum')
const auditReport = require('../../constants/audit-enum')
const getAuditData = require('../../services/data/audit/get-audit-data')

module.exports = router => {
  router.get('/audit', (req, res, next) => {
    authorisation.hasRoles(req, [applicationRoles.BAND_9, applicationRoles.CASEWORK_MANAGER_BAND_5])
    getAuditData()
      .then(result => {
        const checkListDisplay = result
          .filter(audit => audit.CheckStatus !== auditReport.STATUS.COMPLETED)
          .map(audit => getDisplayData(audit, auditReport.STATUS.CHECK))

        const verificationListDisplay = result
          .filter(
            audit =>
              audit.CheckStatus === auditReport.STATUS.COMPLETED &&
              audit.VerificationStatus !== auditReport.STATUS.COMPLETED,
          )
          .map(audit => getDisplayData(audit, auditReport.STATUS.VERIFICATION))

        const completeList = result.filter(audit => audit.FinalStatus === auditReport.STATUS.COMPLETED)
        const completeListDisplay = completeList.map(audit => getDisplayData(audit, auditReport.STATUS.COMPLETE))
        const isReportExist = result.length !== 0
        res.render('audit/audit', {
          checkListDisplay,
          verificationListDisplay,
          completeListDisplay,
          isReportExist,
        })
      })
      .catch(error => {
        next(error)
      })
  })

  router.post('/audit', (req, res, next) => {
    authorisation.hasRoles(req, [applicationRoles.BAND_9, applicationRoles.CASEWORK_MANAGER_BAND_5])
    res.redirect('/audit/create-report-date')
  })
}

function getDisplayData(audit, type) {
  return {
    startDate: moment(audit.StartDate).format(auditReport.DATE_FORMAT),
    endDate: moment(audit.EndDate).format(auditReport.DATE_FORMAT),
    reportId: audit.ReportId,
    status: getStatus(audit, type),
  }
}

function getStatus(audit, type) {
  switch (type) {
    case auditReport.STATUS.CHECK:
      return audit.CheckStatus
    case auditReport.STATUS.VERIFICATION:
      return audit.VerificationStatus
    case auditReport.STATUS.COMPLETE:
      return auditReport.STATUS.U_COMPLETED
    default:
      return ''
  }
}
