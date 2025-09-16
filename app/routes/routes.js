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

  // Audit
  require('./audit/audit'),
  require('./audit/create-report-date'),
  require('./audit/create-report-percent'),
  require('./audit/create-report'),
  require('./audit/view-report'),
  require('./audit/delete-report'),
  require('./audit/print-report'),
  require('./audit/check-claim'),

  // SSCL Download payment files
  require('./download-payment-files'),

  // Authentication routes
  require('./authentication'),

  // Health check routes
  require('./health-check/status'),

  // Submit claim on behalf of a claimant
  require('./submit-claim-on-behalf-of-claimant'),
]

module.exports = router => {
  routes.forEach(route => {
    route(router)
  })
}
