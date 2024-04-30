const applicationRoles = require('../constants/application-roles-enum')

const userNavigationOptions = {
  dashboard: false,
  claims: false,
  audit: false,
  download: false,
  config: false
}

for (const role of Object.keys(applicationRoles)) {
  const value = applicationRoles[role]
  if (value === applicationRoles.CLAIM_ENTRY_BAND_2 || value === applicationRoles.CLAIM_PAYMENT_BAND_3) {
    userNavigationOptions.dashboard = true
    userNavigationOptions.claims = true
  } else if (value === applicationRoles.CASEWORK_MANAGER_BAND_5) {
    userNavigationOptions.dashboard = true
    userNavigationOptions.claims = true
    userNavigationOptions.audit = true
  } else if (value === applicationRoles.HWPV_SSCL) {
    userNavigationOptions.download = true
  } else if (value === applicationRoles.BAND_9) {
    userNavigationOptions.dashboard = true
    userNavigationOptions.claims = true
    userNavigationOptions.audit = true
    userNavigationOptions.config = true
  }
}

module.exports = () => {
  return (req, res, next) => {
    res.locals.userNavigationOptions = userNavigationOptions
    next()
  }
}
