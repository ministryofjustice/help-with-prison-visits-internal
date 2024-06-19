const authorisation = require('../services/authorisation')
const getAutoApprovalConfig = require('../services/data/get-auto-approval-config')
const getAuditConfig = require('../services/data/audit/get-audit-config')
const updateAutoApprovalConfig = require('../services/data/update-auto-approval-config')
const updateAuditConfig = require('../services/data/audit/update-audit-config')
const autoApprovalRulesEnum = require('../constants/auto-approval-rules-enum')
const AutoApprovalConfig = require('../services/domain/auto-approval-config')
const AuditConfig = require('../services/domain/audit-config')
const ValidationError = require('../services/errors/validation-error')
const applicationRoles = require('../constants/application-roles-enum')

module.exports = function (router) {
  router.get('/config', function (req, res, next) {
    authorisation.hasRoles(req, [applicationRoles.BAND_9])

    return getAutoApprovalConfig()
      .then(function (autoApprovalConfig) {
        getAuditConfig()
          .then(function (auditConfig) {
            const rulesDisabled = autoApprovalConfig.RulesDisabled ? autoApprovalConfig.RulesDisabled : ''
            res.render('config', {
              autoApprovalConfig,
              auditConfig,
              autoApprovalRulesEnum,
              rulesDisabled
            })
          })
      })
      .catch(function (error) {
        next(error)
      })
  })

  router.post('/config', function (req, res, next) {
    authorisation.hasRoles(req, [applicationRoles.BAND_9])

    const rulesDisabled = generateRulesDisabled(req.body.rulesEnabled || [])
    try {
      const autoApprovalConfig = new AutoApprovalConfig(
        req.user.email,
        req.body.AutoApprovalEnabled,
        req.body.CostVariancePercentage,
        req.body.MaxClaimTotal,
        req.body.MaxDaysAfterAPVUVisit,
        req.body.MaxNumberOfClaimsPerYear,
        req.body.MaxNumberOfClaimsPerMonth,
        req.body.NumberOfConsecutiveAutoApprovals,
        rulesDisabled
      )

      const auditConfig = new AuditConfig(
        req.body.AuditThreshold,
        req.body.VerificationPercentage
      )

      updateAutoApprovalConfig(autoApprovalConfig)
        .then(function () {
          updateAuditConfig(auditConfig)
            .then(function () {
              res.redirect('/config')
            })
            .catch(function (error) {
              next(error)
            })
        })
        .catch(function (error) {
          next(error)
        })
    } catch (error) {
      if (error instanceof ValidationError) {
        const autoApprovalConfig = {
          ...req.body,
          AutoApprovalEnabled: req.body.AutoApprovalEnabled === 'true'
        }
        const auditConfig = {
          ThresholdAmount: req.body.ThresholdAmount,
          VerificationPercent: req.body.VerificationPercentage
        }
        const errors = error.validationErrors
        res.status(400).render('config', {
          autoApprovalConfig,
          auditConfig,
          autoApprovalRulesEnum,
          rulesDisabled,
          errors
        })
      } else {
        next(error)
      }
    }
  })
}

const generateRulesDisabled = (rulesEnabled) => {
  const rules = Object.values(autoApprovalRulesEnum).map(rule => rule.value)
  const rulesDisabled = rules.filter(rule => !rulesEnabled.includes(rule))

  return rulesDisabled
}
