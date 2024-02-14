module.exports = function (req, property, value) {
  if (req.session.audit) {
    req.session.audit[property] = value
  } else {
    req.session.audit = {}
    req.session.audit[property] = value
  }
}
