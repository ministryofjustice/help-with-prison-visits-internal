const moment = require('moment')
const authorisation = require('../../services/authorisation')
const ValidationError = require('../../services/errors/validation-error')
const applicationRoles = require('../../constants/application-roles-enum')
const getAuditData = require('../../services/data/audit/get-audit-data')
module.exports = function (router) {
  router.get('/audit', function (req, res, next) {
    authorisation.hasRoles(req, [applicationRoles.BAND_9, applicationRoles.CASEWORK_MANAGER_BAND_5])
        getAuditData().then(function(result) {
           const checkList = result.filter((audit => audit.CheckStatus != 'Completed'))
           const checkListDisplay = checkList.map(audit => getDisplayData(audit, 'check'))

           const verificationList = result.filter((audit => audit.CheckStatus == 'Completed' && audit.VerificationStatus != 'Completed'))
           const verificationListDisplay = verificationList.map(audit => getDisplayData(audit, 'verification'))

           const completeList = result.filter((audit => audit.FinalStatus == 'Completed'))
           const completeListDisplay = completeList.map(audit => getDisplayData(audit, 'complete'))
           const isReportExist = result.length != 0
           res.render('audit/audit', { checkListDisplay, verificationListDisplay, completeListDisplay, isReportExist })
        })
        .catch(function (error) {
            next(error)
         })
  })

  router.post('/audit', function (req, res, next) {
    authorisation.hasRoles(req, [applicationRoles.BAND_9, applicationRoles.CASEWORK_MANAGER_BAND_5])
    res.redirect('/audit/create-report-date')
  })
}

function getDisplayData(audit, type) {
    return {
            startDate: moment(audit.StartDate).format("DD MMMM YYYY"),
            endDate: moment(audit.EndDate).format("DD MMMM YYYY"),
            reportId: audit.ReportId,
            status: getStatus(audit, type)
        }
}

function getStatus(audit, type) {
    switch(type) {
      case 'check':
            return audit.CheckStatus
      case 'verification':
            return audit.VerificationStatus
      case 'complete':
            return 'COMPLETED'
    }
}