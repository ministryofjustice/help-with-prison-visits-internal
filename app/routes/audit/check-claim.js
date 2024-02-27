/* eslint-disable eqeqeq, multiline-ternary */
const authorisation = require('../../services/authorisation')
const applicationRoles = require('../../constants/application-roles-enum')
const audit = require('../../constants/audit-enum')
const getClaimData = require('../../services/data/audit/get-claim-data')
const updateClaimData = require('../../services/data/audit/update-claim-data')
const addAuditSessionData = require('../../services/add-audit-session-data')
const getAuditSessionData = require('../../services/get-audit-session-data')

let validationErrors

module.exports = function (router) {
  router.get('/audit/check-claim/:reportId/:reference', function (req, res, next) {
    authorisation.hasRoles(req, [applicationRoles.BAND_9, applicationRoles.CASEWORK_MANAGER_BAND_5])
    const isBand9 = req.user.roles.includes(applicationRoles.BAND_9)
    const isBand5 = req.user.roles.includes(applicationRoles.CASEWORK_MANAGER_BAND_5)
    const {
      reportId,
      reference
    } = req.params
    getClaimData(reference, reportId).then(function (result) {
      const claimData = result[0]
      addAuditSessionData(req, audit.SESSION.CLAIM_DATA, claimData)
      res.render('audit/check-claim', {
        reportId,
        reference,
        claimData,
        isBand9,
        isBand5
      })
    })
  })

  router.post('/audit/check-claim/:reportId/:reference', function (req, res, next) {
    authorisation.hasRoles(req, [applicationRoles.BAND_9, applicationRoles.CASEWORK_MANAGER_BAND_5])
    validationErrors = {}
    const {
      reportId,
      reference
    } = req.params
    const {
      band,
      band5Validation,
      band5Description,
      band9Validation,
      band9Description
    } = req.body
    const claimData = band == 5 ? {
      Band5Validity: band5Validation,
      Band5Description: band5Description,
      Band5Username: req.user.name
    } : {
      Band9Validity: band9Validation,
      Band9Description: band9Description,
      Band9Username: req.user.name
    }
    if (band == 5) {
      if (!band5Validation) {
        validationErrors.band5Validation = ['Please select one of the option']
      } else if (band5Validation === audit.CLAIM_STATUS.INVALID && !band5Description) {
        validationErrors.band5Description = ['Please provide reason for invalid']
      }
    } else {
      if (!band9Validation) {
        validationErrors.band9Validation = ['Please select one of the option']
      } else if (band9Validation === audit.CLAIM_STATUS.INVALID && !band9Description) {
        validationErrors.band9Description = ['Please provide reason for invalid']
      }
    }
    for (const field in validationErrors) {
      if (Object.prototype.hasOwnProperty.call(validationErrors, field)) {
        if (validationErrors[field].length > 0) {
          const isBand9 = req.user.roles.includes(applicationRoles.BAND_9)
          const isBand5 = req.user.roles.includes(applicationRoles.CASEWORK_MANAGER_BAND_5)
          return res.status(400).render('audit/check-claim', {
            reportId,
            reference,
            claimData: getAuditSessionData(req, audit.SESSION.CLAIM_DATA),
            errors: validationErrors,
            validationValue: band == 5 ? band5Validation : band9Validation,
            isBand9,
            isBand5
          })
        }
      }
    }
    updateClaimData(claimData, reference, reportId).then(function () {
      res.redirect(`/audit/view-report/${reportId}`)
    })
  })
}
