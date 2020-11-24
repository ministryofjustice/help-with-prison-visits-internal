function isAuthenticated (req) {
  if (!req.user) {
    const error = new Error('unauthenticated')
    error.status = 401
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

  if (!req.user.roles.includes('caseworker')) {
    const error = new Error('unauthorised')
    error.status = 403
    throw error
  }
}

module.exports.isAuthenticated = isAuthenticated
module.exports.isAdmin = isAdmin
module.exports.isSscl = isSscl
module.exports.isCaseworker = isCaseworker
