const { csrfSync } = require('csrf-sync')

module.exports = csrfSync({
  // By default, csrf-sync uses x-csrf-token header, but we use the token in forms and send it in the request body, so change getTokenFromRequest so it grabs from there
  getTokenFromRequest: req => {
    // eslint-disable-next-line no-underscore-dangle
    return req.body?._csrf
  },
})
