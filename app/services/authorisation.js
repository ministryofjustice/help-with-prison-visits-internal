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
      return
    }
  })
  if (!hasDesiredRole) {
    const error = new Error('unauthorised')
    error.status = 403
    throw error
  }
}

function isAdmin (req) {
  isAuthenticated(req)

  if (!req.user.roles.includes('admin')) {
    const error = new Error('unauthorised')
    error.status = 403
    throw error
  }
}

function isSscl (req) {
  isAuthenticated(req)

  if (!req.user.roles.includes('sscl')) {
    const error = new Error('unauthorised')
    error.status = 403
    throw error
  }
}

function isCaseworker (req) {
  isAuthenticated(req)

  if (!req.user.roles.includes('caseworker') && !req.user.roles.includes('HWPV_CASEWORKER')) {
    const error = new Error('unauthorised')
    error.status = 403
    throw error
  }
}

module.exports.isAuthenticated = isAuthenticated
module.exports.isAdmin = isAdmin
module.exports.isSscl = isSscl
module.exports.isCaseworker = isCaseworker
module.exports.hasRoles = hasRoles
