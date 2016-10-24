/**
 * This file defines all routes used in this application. Any logic that is applicable to all routes can be added here.
 */

var routes = [
  require('./index'),

  // Health check routes
  require('./health-check/status')
]

module.exports = function (router) {
  routes.forEach(function (route) {
    route(router)
  })
}
