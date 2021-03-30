/**
 * This file defines all routes used in this application. Any logic that is applicable to all routes can be added here.
 */

const routes = [
  require('./index'),

  require('./dashboard'),
  require('./search'),
  require('./advanced-search'),
  require('./claim/view-claim'),
  require('./claim/file-upload'),
  require('./claim/update-contact-details'),

  // Configuration
  require('./config'),

  // SSCL Download payment files
  require('./download-payment-files'),

  // Authentication routes
  require('./authentication'),

  // Health check routes
  require('./health-check/status'),

  // Submit claim on behalf of a claimant
  require('./submit-claim-on-behalf-of-claimant')
]

module.exports = function (router) {
  routes.forEach(function (route) {
    route(router)
  })
}
