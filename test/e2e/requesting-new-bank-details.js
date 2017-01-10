const config = require('../../config')
var moment = require('moment')
var databaseHelper = require('../helpers/database-setup-for-tests')

// Variables for creating and deleting a record
var reference = '2222222'
var date
var claimId

describe('Requesting bank details flow', () => {
  before(function () {
    date = moment('20010101').toDate()
    return databaseHelper.insertTestData(reference, date, 'APPROVED').then(function (ids) {
      claimId = ids.claimId
    })
    .then(function () {
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
  })

  it('request new bank account details from an approved claim', () => {
    return browser.url('/')

      // Go to approved claim and request new bank details
      .url('/?status=APPROVED')
      .waitForExist('#claim' + claimId)
      .click('#claim' + claimId)
      .waitForExist('#reference')
      .click('[for="request-new-payment-details-toggle"]')
      .setValue('#payment-details-additional-information', 'TESTING')
      .click('#request-new-payment-details')

      // Check that claim is pending new bank details
      .url('/?status=REQUEST-INFO-PAYMENT')
      .waitForExist('#claim' + claimId)
  })

  after(function () {
    return databaseHelper.deleteAll(reference)
  })
})
