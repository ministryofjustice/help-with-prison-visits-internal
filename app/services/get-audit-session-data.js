module.exports = (req, property) => {
  return req.session.audit[property]
}
