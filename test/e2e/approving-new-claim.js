const config = require('../../config')
const moment = require('moment')
const databaseHelper = require('../helpers/database-setup-for-tests')
const expect = require('chai').expect
const dateFormatter = require('../../app/services/date-formatter')

// Variables for creating and deleting a record
const reference = '1111111'
let date
let claimId
let expenseId1
let expenseId2
const expiryDate = dateFormatter.now().add(14, 'days')

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
          const email = await $('#user_email')
          const password = await $('#user_password')
          const commit = await $('[name="commit"]')
          await email.setValue(config.TEST_SSO_EMAIL)
          await password.setValue(config.TEST_SSO_PASSWORD)
          await commit.click()
        }
      })
  })

  it('should display a list of claims and approve a claim', async () => {
    await browser.url('/')

    // Index
    let submitButton = await $('#claim' + claimId)
    await submitButton.click()

    // View-claim
    const assignSelf = await $('#assign-self')
    await assignSelf.click()

    let visitorName = await $('#visitor-name')
    visitorName = await visitorName.getText()
    expect(visitorName).to.be.equal('John Smith')

    const dwpStatus = await $('#dwp-status')
    const nomisCheck = await $('#nomis-check')
    const visitConfirmationCheck = await $('#visit-confirmation-check')
    const expense1 = await $(`#claim-expense-${expenseId1}-status`)
    const expense2 = await $(`#claim-expense-${expenseId2}-status`)
    const approve = await $('[for="approve"]')
    submitButton = await $('#approve-submit')
    const expiryDay = await $('#expiry-day-input')
    const expiryMonth = await $('#expiry-month-input')
    const expiryYear = await $('#expiry-year-input')

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
    const searchBox = await $('#input-search-query')
    submitButton = await $('#search')

    await searchBox.setValue('1111111')
    await submitButton.click()

    const claim = await $('#claim' + claimId)
    expect(claim).to.not.equal(null)
    expect(claim).to.not.equal(undefined)
  })

  after(function () {
    return databaseHelper.deleteAll(reference)
  })
})
