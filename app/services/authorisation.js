const log = require('./log')

function isAuthenticated (req) {
  if (!req.user) {
    const error = new Error(`Unauthorized at ${req.originalUrl}`)
    error.status = 401
    throw error
  }
}

function hasRoles (req, roles) {
  isAuthenticated(req)

  let hasDesiredRole = false
  roles.forEach(function (role) {
    if (req.user.roles.includes(role)) {
      hasDesiredRole = true
    }
  })
  if (!hasDesiredRole) {
    const error = new Error(`Forbidden at ${req.originalUrl}`)
    error.status = 403
    throw error
  }
  return true
}

module.exports.isAuthenticated = isAuthenticated
module.exports.hasRoles = hasRoles
