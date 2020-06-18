const config = require('../../config')
var moment = require('moment')
var databaseHelper = require('../helpers/database-setup-for-tests')
var expect = require('chai').expect
var dateFormatter = require('../../app/services/date-formatter')

// Variables for creating and deleting a record
var reference = '1111111'
var date
var claimId
var expenseId1
var expenseId2
var expiryDate = dateFormatter.now().add(14, 'days')

describe('First time claim viewing flow', () => {
  before(function () {
    date = moment('20010101').toDate()
    return databaseHelper.insertTestData(reference, date, 'New').then(function (ids) {
      claimId = ids.claimId
      expenseId1 = ids.expenseId1
      expenseId2 = ids.expenseId2
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
    await browser.url('/')

    // Index
    var submitButton = await $('#claim' + claimId)
    await submitButton.click()

    // View-claim
    var assignSelf = await $('#assign-self')
    await assignSelf.click()

    var visitorName = await $('#visitor-name')
    visitorName = await visitorName.getText()
    expect(visitorName).to.be.equal('John Smith')

    var dwpStatus = await $('#dwp-status')
    var nomisCheck = await $('#nomis-check')
    var visitConfirmationCheck = await $('#visit-confirmation-check')
    var expense1 = await $(`#claim-expense-${expenseId1}-status`)
    var expense2 = await $(`#claim-expense-${expenseId2}-status`)
    var approve = await $('[for="approve"]')
    submitButton = await $('#approve-submit')
    var expiryDay = await $('#expiry-day-input')
    var expiryMonth = await $('#expiry-month-input')
    var expiryYear = await $('#expiry-year-input')

    await dwpStatus.selectByVisibleText('Approve')
    await expiryDay.setValue(expiryDate.date())
    await expiryMonth.setValue(expiryDate.month() + 1)
    await expiryYear.setValue(expiryDate.year())
    await nomisCheck.selectByVisibleText('Approve')
    await visitConfirmationCheck.selectByVisibleText('Approve')
    await expense1.selectByVisibleText('Approve')
    await expense2.selectByVisibleText('Approve')
    await approve.click()
    await submitButton.click()

    // Search for approved claim
    var searchBox = await $('#input-search-query')
    submitButton = await $('#search')

    await searchBox.setValue('1111111')
    await submitButton.click()

    var claim = await $('#claim' + claimId)
    expect(claim).to.not.equal(null)
    expect(claim).to.not.equal(undefined)
  })

  after(function () {
    return databaseHelper.deleteAll(reference)
  })
})
