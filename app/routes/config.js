const authorisation = require('../services/authorisation')
const getAutoApprovalConfig = require('../services/data/get-auto-approval-config')
const updateAutoApprovalConfig = require('../services/data/update-auto-approval-config')
const autoApprovalRulesEnum = require('../constants/auto-approval-rules-enum')
const AutoApprovalConfig = require('../services/domain/auto-approval-config')
const ValidationError = require('../services/errors/validation-error')
const applicationRoles = require('../constants/application-roles-enum')

module.exports = function (router) {
  router.get('/config', function (req, res, next) {
    authorisation.hasRoles(req, [applicationRoles.BAND_9])

    getAutoApprovalConfig()
      .then(function (autoApprovalConfig) {
        const rulesDisabled = autoApprovalConfig.RulesDisabled ? autoApprovalConfig.RulesDisabled : ''
        res.render('config', {
          autoApprovalConfig: autoApprovalConfig,
          autoApprovalRulesEnum: autoApprovalRulesEnum,
          rulesDisabled: rulesDisabled
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

      updateAutoApprovalConfig(autoApprovalConfig)
        .then(function () {
          res.redirect('/config')
        })
        .catch(function (error) {
          next(error)
        })
    } catch (error) {
      if (error instanceof ValidationError) {
        res.status(400).render('config', {
          autoApprovalConfig: req.body,
          autoApprovalRulesEnum: autoApprovalRulesEnum,
          rulesDisabled: rulesDisabled,
          errors: error.validationErrors
        })
      } else {
        next(error)
      }
    }
  })
}

const generateRulesDisabled = function (rulesEnabled) {
  const rules = []

  for (const rule in autoApprovalRulesEnum) {
    rules.push(autoApprovalRulesEnum[rule].value)
  }
  const rulesDisabled = []

  rules.forEach(function (rule) {
    if (rulesEnabled.indexOf(rule) === -1) {
      rulesDisabled.push(rule)
    }
  })

  return rulesDisabled
}
