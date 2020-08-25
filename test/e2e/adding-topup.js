const config = require('../../config')
var moment = require('moment')
var databaseHelper = require('../helpers/database-setup-for-tests')
var expect = require('chai').expect
const getIndividualClaimDetails = require('../../app/services/data/get-individual-claim-details')
const TopUpStatusEnum = require('../../app/constants/top-up-status-enum')

// Variables for creating and deleting a record
var reference = '1111111'
var date
var claimId
var expectedTopUpAmount = '99.02'
var expectedTopUpReason = 'This is a test'

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
          var email = await $('#user_email')
          var password = await $('#user_password')
          var commit = await $('[name="commit"]')
          await email.setValue(config.TEST_SSO_EMAIL)
          await password.setValue(config.TEST_SSO_PASSWORD)
          await commit.click()
        }
      })
  })

  it('should display a list of claims and approve a claim', async () => {
    await browser.url('/claim/' + claimId)

    // View-claim
    var assignSelf = await $('#assign-self')
    await assignSelf.click()

    var topUpClaimLabel = await $('#top-up-claim-label')
    await topUpClaimLabel.click()

    var topUpAmount = await $('#top-up-amount')
    await topUpAmount.setValue(expectedTopUpAmount)

    var topUpReason = await $('#top-up-reason')
    await topUpReason.setValue(expectedTopUpReason)

    var submitButton = await $('#add-top-up')
    await submitButton.click()

    var topUpsTable = await $('#top-ups-table')
    await topUpsTable.click()

    var claimDetails = await getIndividualClaimDetails(claimId)
    expect(claimDetails.TopUps.length, 'TopUps should be an array of length 1').to.equal(1)
    expect(claimDetails.TopUps[0].TopUpAmount, 'TopUp Amount be equal to ' + expectedTopUpAmount).to.equal(expectedTopUpAmount)
    expect(claimDetails.TopUps[0].Reason, 'TopUp Reason be equal to ' + expectedTopUpReason).to.equal(expectedTopUpReason)
    expect(claimDetails.TopUps[0].PaymentStatus, 'TopUp PaymentStatus should be equal to ' + TopUpStatusEnum.PENDING).to.equal(TopUpStatusEnum.PENDING)
  })

  after(function () {
    return databaseHelper.deleteAll(reference)
  })
})
