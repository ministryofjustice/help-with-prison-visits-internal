const config = require('../../config')

describe('Smoke test', () => {
  before(function () {
    // IF SSO ENABLED LOGIN TO SSO
    if (config.AUTHENTICATION_ENABLED === 'true') {
      return browser.url(config.TOKEN_HOST)
        .waitForExist('#user_email')
        .setValue('#user_email', config.TEST_SSO_EMAIL)
        .setValue('#user_password', config.TEST_SSO_PASSWORD)
        .click('[name="commit"]')
        .waitForExist('[href="/users/sign_out"]')
    }
  })

  it('should display the dashboard which calls the database', () => {
    return browser.url('/dashboard')

      // Dashboard
      .waitForExist('#dashboard')
  })
})
