const config = require('../../config')
const expect = require('chai').expect

describe('Smoke test', () => {
  before(async function () {
    // IF SSO ENABLED LOGIN TO SSO
    if (config.AUTHENTICATION_ENABLED === 'true') {
      await browser.url(config.TOKEN_HOST)
      const email = await $('#user_email')
      const password = await $('#user_password')
      const commit = await $('[name="commit"]')
      await email.setValue(config.TEST_SSO_EMAIL)
      await password.setValue(config.TEST_SSO_PASSWORD)
      await commit.click()
    }
  })

  it('should display the dashboard which calls the database', async () => {
    await browser.url('/')

    // Dashboard
    await browser.url('/dashboard')
    const title = await browser.getTitle()
    expect(title).to.be.equal('Help with Prison Visits')
  })
})
