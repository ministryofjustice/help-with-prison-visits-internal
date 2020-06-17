const config = require('../../config')
var moment = require('moment')
var databaseHelper = require('../helpers/database-setup-for-tests')
var expect = require('chai').expect

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
      .then(async () => {
      // IF SSO ENABLED LOGIN TO SSO
        if (config.AUTHENTICATION_ENABLED === 'true') {
          await browser.url(config.TOKEN_HOST)
          var email = await $('#user_email')
          var password = await $('#user_password')
          var commit = await $('[name="commit"]')
          await email.setValue(config.TEST_SSO_EMAIL)
          await password.setValue(config.TEST_SSO_PASSWORD)
          await commit.click()
        }
      })
  })

  it('request new bank account details from an approved claim', async () => {
    await browser.url('/')

    // Go to approved claim and request new bank details
    await browser.url('/?status=APPROVED')
    var submitButton = await $('#claim' + claimId)
    await submitButton.click()

    var assignSelf = await $('#assign-self')
    await assignSelf.click()

    var requestNewPaymentDetailsLabel = await $('#request-new-payment-details-label')
    await requestNewPaymentDetailsLabel.click()

    var paymentDetailsAdditionalInformation = await $('#payment-details-additional-information')
    await paymentDetailsAdditionalInformation.setValue('TESTING')

    submitButton = await $('#request-new-payment-details')
    await submitButton.click()

    // Check that claim is pending new bank details
    await browser.url('/?status=REQUEST-INFO-PAYMENT')
    var claim = await $('#claim' + claimId)
    expect(claim).to.not.equal(null)
    expect(claim).to.not.equal(undefined)
  })

  after(function () {
    return databaseHelper.deleteAll(reference)
  })
})
