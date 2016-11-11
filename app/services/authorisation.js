function isAuthenticated (req) {
  if (!req.user) {
    var error = new Error('unauthenticated')
    error.status = 401
    throw error
  }
}

module.exports.isAuthenticated = isAuthenticated
