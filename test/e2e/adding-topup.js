const config = require('../../config')
const moment = require('moment')
const databaseHelper = require('../helpers/database-setup-for-tests')
const expect = require('chai').expect
const TopUpStatusEnum = require('../../app/constants/top-up-status-enum')

// Variables for creating and deleting a record
const reference = '1111111'
let date
let claimId
const expectedTopUpAmount = '99.02'
const expectedTopUpReason = 'This is a test'

describe('Adding a new top up flow', () => {
  before(function () {
    date = moment('20010101').toDate()
    return databaseHelper.insertTestData(reference, date, 'APPROVED', undefined, undefined, 'PROCESSED').then(function (ids) {
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

  it('should add a top up of ' + expectedTopUpAmount + ' with reason: ' + expectedTopUpReason, async () => {
    await browser.url('/')

    await browser.url('/claim/' + claimId)

    // View-claim
    const assignSelf = await $('#assign-self')
    await assignSelf.click()

    const topUpClaimLabel = await $('#top-up-claim-label')
    await topUpClaimLabel.click()

    const topUpAmount = await $('#top-up-amount')
    await topUpAmount.setValue(expectedTopUpAmount)

    const topUpReason = await $('#top-up-reason')
    await topUpReason.setValue(expectedTopUpReason)

    const submitButton = await $('#add-top-up')
    await submitButton.click()

    await browser.pause(5000)
    const topUp = await databaseHelper.getLastTopUpAdded(claimId)
    expect(topUp.TopUpAmount, 'TopUp Amount be equal to ' + expectedTopUpAmount).to.equal(expectedTopUpAmount)
    expect(topUp.Reason, 'TopUp Reason be equal to ' + expectedTopUpReason).to.equal(expectedTopUpReason)
    expect(topUp.PaymentStatus, 'TopUp PaymentStatus should be equal to ' + TopUpStatusEnum.PENDING).to.equal(TopUpStatusEnum.PENDING)
  })

  after(function () {
    return databaseHelper.deleteAll(reference)
  })
})
