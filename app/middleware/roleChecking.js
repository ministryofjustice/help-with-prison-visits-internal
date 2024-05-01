const { CLAIM_ENTRY_BAND_2, CLAIM_PAYMENT_BAND_3, CASEWORK_MANAGER_BAND_5, HWPV_SSCL, BAND_9 } = require('../constants/application-roles-enum')
const applicationRoles = require('../constants/application-roles-enum')

const userNavigationOptions = {
  dashboard: false,
  claims: false,
  audit: false,
  download: false,
  config: false
}

const setNavigationOptions = (role, options) => {
  if (role === CLAIM_ENTRY_BAND_2 || role === CLAIM_PAYMENT_BAND_3) {
    options.dashboard = true
    options.claims = true
  } else if (role === CASEWORK_MANAGER_BAND_5) {
    options.dashboard = true
    options.claims = true
    options.audit = true
  } else if (role === HWPV_SSCL) {
    options.download = true
  } else if (role === BAND_9) {
    options.dashboard = true
    options.claims = true
    options.audit = true
    options.config = true
  } 
}

module.exports = () => {
  return (req, res, next) => {
    Object.keys(applicationRoles).forEach(role => {
      setNavigationOptions(applicationRoles[role], userNavigationOptions)
    })
    res.locals.userNavigationOptions = userNavigationOptions
    next()
  }
}
