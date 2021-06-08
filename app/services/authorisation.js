// APVS0246
function isAuthenticated (req) {
  if (!req.user) {
    const error = new Error('Unauthorized')
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
    const error = new Error('Forbidden')
    error.status = 403
    throw error
  }
  return true
}

module.exports.isAuthenticated = isAuthenticated
module.exports.hasRoles = hasRoles
