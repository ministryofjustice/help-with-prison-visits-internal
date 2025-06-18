const authorisation = require('../../services/authorisation')
const applicationRoles = require('../../constants/application-roles-enum')
const audit = require('../../constants/audit-enum')
const dateFormatter = require('../../services/date-formatter')
const validationFieldNames = require('../../services/validators/validation-field-names')
const getClaimCount = require('../../services/data/audit/get-claim-count')
const addAuditSessionData = require('../../services/add-audit-session-data')
const getAuditSessionData = require('../../services/get-audit-session-data')
const getAuditConfig = require('../../services/data/audit/get-audit-config')
const getClaimCountOverThreshold = require('../../services/data/audit/get-claim-count-over-threshold')

const MIN_YEAR = 1900
let validationErrors

module.exports = function (router) {
  router.get('/audit/create-report-date', function (req, res, next) {
    authorisation.hasRoles(req, [applicationRoles.BAND_9, applicationRoles.CASEWORK_MANAGER_BAND_5])

    getAuditConfig().then(function (result) {
      const thresholdAmount = result.ThresholdAmount
      addAuditSessionData(req, audit.SESSION.THRESHOLD_AMOUNT, thresholdAmount)
      res.render('audit/create-report-date', {
        thresholdAmount
      })
    })
  })

  router.post('/audit/create-report-date', function (req, res, next) {
    authorisation.hasRoles(req, [applicationRoles.BAND_9, applicationRoles.CASEWORK_MANAGER_BAND_5])
    validationErrors = {}
    const auditReportStartDate = validateDate(
      'auditReportStartDate',
      req.body['auditReportStartDate-Day'],
      req.body['auditReportStartDate-Month'],
      req.body['auditReportStartDate-Year']
    )
    const auditReportEndDate = validateDate(
      'auditReportEndDate',
      req.body['auditReportEndDate-Day'],
      req.body['auditReportEndDate-Month'],
      req.body['auditReportEndDate-Year']
    )
    if (auditReportStartDate && auditReportEndDate && auditReportStartDate.isAfter(auditReportEndDate)) {
      validationErrors.auditReportStartDate = ['The start date must be before the end date']
    }
    for (const field in validationErrors) {
      if (Object.prototype.hasOwnProperty.call(validationErrors, field)) {
        if (validationErrors[field].length > 0) {
          return res.status(400).render('audit/create-report-date', {
            query: req.body,
            errors: validationErrors
          })
        }
      }
    }

    addAuditSessionData(req, audit.SESSION.START_DATE, auditReportStartDate)
    addAuditSessionData(req, audit.SESSION.END_DATE, auditReportEndDate)
    const thresholdAmount = getAuditSessionData(req, audit.SESSION.THRESHOLD_AMOUNT)
    getClaimCount(auditReportStartDate, auditReportEndDate).then(function (result) {
      getClaimCountOverThreshold(auditReportStartDate, auditReportEndDate, thresholdAmount).then(function (result1) {
        addAuditSessionData(req, audit.SESSION.CLAIM_COUNT, result[0].Count)
        addAuditSessionData(req, audit.SESSION.CLAIM_COUNT_OVER_THRESHOLD, result1[0].Count)
        return res.redirect('/audit/create-report-percent')
      })
    })
  })
}

function validateDate (fieldName, day, month, year) {
  const validationFieldName = validationFieldNames[fieldName] || 'Date'
  if (day || month || year) {
    const date = dateFormatter.build(day, month, year)
    if (year >= MIN_YEAR && date.isValid()) {
      if (dateFormatter.isFutureDate(date)) {
        validationErrors[fieldName] = [validationFieldName + ' must be in the past']
        return false
      }
      return date
    } else {
      validationErrors[fieldName] = [validationFieldName + ' is invalid']
      return false
    }
  } else {
    validationErrors[fieldName] = [validationFieldName + ' is not provided']
    return false
  }
}
