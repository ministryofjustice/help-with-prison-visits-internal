module.exports = function (req, property) {
  return req.session.audit[property]
}
