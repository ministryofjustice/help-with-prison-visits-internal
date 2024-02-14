const moment = require('moment')
const authorisation = require('../../services/authorisation')
const ValidationError = require('../../services/errors/validation-error')
const applicationRoles = require('../../constants/application-roles-enum')
const validationFieldNames = require('../../services/validators/validation-field-names')
const addAuditSessionData = require('../../services/add-audit-session-data')
const getAuditSessionData = require('../../services/get-audit-session-data')

let validationErrors

module.exports = function(router) {
    router.get('/audit/create-report-percent', function(req, res, next) {
        authorisation.hasRoles(req, [applicationRoles.BAND_9, applicationRoles.CASEWORK_MANAGER_BAND_5])

        const startDate = getAuditSessionData(req, 'startDate')
        const endDate = getAuditSessionData(req, 'endDate')
        const claimCount = getAuditSessionData(req, 'claimCount')
        const claimCountOver250 = getAuditSessionData(req, 'claimCountOver250')
        const thresholdAmount = getAuditSessionData(req, 'thresholdAmount')

        res.render('audit/create-report-percent', {
            startDate: moment(startDate).format("DD MMMM YYYY"),
            endDate: moment(endDate).format("DD MMMM YYYY"),
            claimCount,
            claimCountOver250,
            thresholdAmount
        })
    })

    router.post('/audit/create-report-percent', function(req, res, next) {
        authorisation.hasRoles(req, [applicationRoles.BAND_9, applicationRoles.CASEWORK_MANAGER_BAND_5])
        validationErrors = {}
        const auditReportPercent = req.body.auditReportPercent

        if(!auditReportPercent || isNaN(auditReportPercent)) {
            validationErrors['auditReportPercent'] = ['Enter the percentage in numbers']
        } else if (auditReportPercent <= 0 || auditReportPercent > 100) {
            validationErrors['auditReportPercent'] = ['The percentage should be between 0 and 100']
        }

        for (const field in validationErrors) {
            if (Object.prototype.hasOwnProperty.call(validationErrors, field)) {
                if (validationErrors[field].length > 0) {
                    const startDate = getAuditSessionData(req, 'startDate')
                    const endDate = getAuditSessionData(req, 'endDate')
                    return res.status(400).render('audit/create-report-percent', {
                        query: req.body,
                        errors: validationErrors,
                        startDate: moment(startDate).format("DD MMMM YYYY"),
                        endDate: moment(endDate).format("DD MMMM YYYY")
                    })
                }
            }
        }

       const claimCount = getAuditSessionData(req, 'claimCount')
       const claimCountOver250 = getAuditSessionData(req, 'claimCountOver250')

        const percentClaim = Math.ceil((claimCount - claimCountOver250) * auditReportPercent * .01)
        addAuditSessionData(req, 'reportId', undefined)
        addAuditSessionData(req, 'percentClaim', percentClaim)
        res.redirect('/audit/create-report')
    })

}