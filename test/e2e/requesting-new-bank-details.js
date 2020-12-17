const config = require('../../config')
const moment = require('moment')
const databaseHelper = require('../helpers/database-setup-for-tests')
const expect = require('chai').expect

// Variables for creating and deleting a record
const reference = '2222222'
let date
let claimId

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
          const email = await $('#user_email')
          const password = await $('#user_password')
          const commit = await $('[name="commit"]')
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
    let submitButton = await $('#claim' + claimId)
    await submitButton.click()

    const assignSelf = await $('#assign-self')
    await assignSelf.click()

    const requestNewPaymentDetailsLabel = await $('#request-new-payment-details-label')
    await requestNewPaymentDetailsLabel.click()

    const paymentDetailsAdditionalInformation = await $('#payment-details-additional-information')
    await paymentDetailsAdditionalInformation.setValue('TESTING')

    submitButton = await $('#request-new-payment-details')
    await submitButton.click()

    // Check that claim is pending new bank details
    await browser.url('/?status=REQUEST-INFO-PAYMENT')
    const claim = await $('#claim' + claimId)
    expect(claim).to.not.equal(null)
    expect(claim).to.not.equal(undefined)
  })

  after(function () {
    return databaseHelper.deleteAll(reference)
  })
})
