const moment = require('moment')
const authorisation = require('../../services/authorisation')
const applicationRoles = require('../../constants/application-roles-enum')
const addAuditSessionData = require('../../services/add-audit-session-data')
const getAuditSessionData = require('../../services/get-audit-session-data')
const getAllClaimsDataBelowThreshold = require('../../services/data/audit/get-all-claims-data-below-threshold')
const getAllClaimsDataOverThreshold = require('../../services/data/audit/get-all-claims-data-over-threshold')
const updateReport = require('../../services/data/audit/update-report')

module.exports = function (router) {
  router.get('/audit/create-report', function (req, res, next) {
    authorisation.hasRoles(req, [applicationRoles.BAND_9, applicationRoles.CASEWORK_MANAGER_BAND_5])

            const startDate = getAuditSessionData(req, 'startDate')
            const endDate = getAuditSessionData(req, 'endDate')
            const percentClaim = getAuditSessionData(req, 'percentClaim')
            const claimCountOver250 = getAuditSessionData(req, 'claimCountOver250')
            const thresholdAmount = getAuditSessionData(req, 'thresholdAmount')

            res.render('audit/create-report', {
                startDate: moment(startDate).format("DD MMMM YYYY"),
                endDate: moment(endDate).format("DD MMMM YYYY"),
                totalReviewClaim: percentClaim + claimCountOver250,
                claimCountOver250,
                thresholdAmount
            })
  })

  router.post('/audit/create-report', function (req, res, next) {
    authorisation.hasRoles(req, [applicationRoles.BAND_9, applicationRoles.CASEWORK_MANAGER_BAND_5])

                const startDate = getAuditSessionData(req, 'startDate')
                const endDate = getAuditSessionData(req, 'endDate')
                const percentClaim = getAuditSessionData(req, 'percentClaim')
                const claimCount = getAuditSessionData(req, 'claimCountOver250')
                const reportId = getAuditSessionData(req, 'reportId')
                const thresholdAmount = getAuditSessionData(req, 'thresholdAmount')

        if(reportId) {
            return res.render('audit/report-created', { reportId })
        } else {
            getAllClaimsDataBelowThreshold(startDate, endDate, percentClaim, thresholdAmount).then(function(result) {
                getAllClaimsDataOverThreshold(startDate, endDate, thresholdAmount).then(function(result1) {
                   const claims = [...result, ...result1]
                    updateReport(claims, startDate, endDate, claimCount).then(function(reportId) {
                    addAuditSessionData(req, 'reportId', reportId)
                     return res.render('audit/report-created', { reportId: reportId })
                    });
                });
            });
        }
  })
}
