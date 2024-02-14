const authorisation = require('../../services/authorisation')
const applicationRoles = require('../../constants/application-roles-enum')
const ValidationError = require('../../services/errors/validation-error')
const getClaimData = require('../../services/data/audit/get-claim-data')
const updateClaimData = require('../../services/data/audit/update-claim-data')
const addAuditSessionData = require('../../services/add-audit-session-data')
const getAuditSessionData = require('../../services/get-audit-session-data')

module.exports = function (router) {
  router.get('/audit/check-claim/:reportId/:reference', function (req, res, next) {
    authorisation.hasRoles(req, [applicationRoles.BAND_9, applicationRoles.CASEWORK_MANAGER_BAND_5])
    const isBand9 = req.user.roles.includes("HWPV_BAND_9")
    const isBand5 = req.user.roles.includes("HWPV_CASEWORK_MANAGER_BAND_5")
    const {
      reportId,
      reference
    } = req.params
    getClaimData(reference).then(function (result) {
      const claimData = result[0]
      addAuditSessionData(req, 'claimData', claimData)
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
        validationErrors['band5Validation'] = ['Please select one of the option']
      } else if (band5Validation === 'Invalid' && ! band5Description) {
        validationErrors['band5Description'] = ['Please provide reason for invalid']
      }
    } else {
      if (!band9Validation) {
        validationErrors['band9Validation'] = ['Please select one of the option']
      } else if (band9Validation === 'Invalid' && ! band9Description) {
        validationErrors['band9Description'] = ['Please provide reason for invalid']
      }
    }
    for (const field in validationErrors) {
      if (Object.prototype.hasOwnProperty.call(validationErrors, field)) {
        if (validationErrors[field].length > 0) {
            const isBand9 = req.user.roles.includes("HWPV_BAND_9")
            const isBand5 = req.user.roles.includes("HWPV_CASEWORK_MANAGER_BAND_5")
          return res.status(400).render('audit/check-claim', {
            reportId,
            reference,
            claimData: getAuditSessionData(req, 'claimData'),
            errors: validationErrors,
            validationValue: band ==5 ? band5Validation : band9Validation,
            isBand9,
            isBand5
          })
        }
      }
    }
    updateClaimData(claimData, reference).then(function () {
      res.redirect(`/audit/view-report/${reportId}`)
    })
  })
}