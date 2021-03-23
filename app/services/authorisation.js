// APVS0246
function isAuthenticated (req) {
  if (!req.user) {
    const error = new Error('unauthenticated')
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
    const error = new Error('unauthorised')
    error.status = 403
    throw error
  }
}

module.exports.isAuthenticated = isAuthenticated
module.exports.hasRoles = hasRoles
