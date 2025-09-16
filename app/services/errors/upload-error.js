module.exports = function uploadError(message) {
  Error.captureStackTrace(this, this.constructor)
  this.name = this.constructor.name
  this.message = message
}
