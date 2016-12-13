const config = require('../../config')
var moment = require('moment')
var databaseHelper = require('../helpers/database-setup-for-tests')
var expect = require('chai').expect

// Variables for creating and deleting a record
var reference = '1111111'
var date
var claimId
var expenseId1
var expenseId2

describe('First time claim viewing flow', () => {
  before(function () {
    date = moment('20010101').toDate()
    return databaseHelper.insertTestData(reference, date, 'New').then(function (ids) {
      claimId = ids.claimId
      expenseId1 = ids.expenseId1
      expenseId2 = ids.expenseId2
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

  it('should display a list of claims and select the one to view details', () => {
    return browser.url('/')

      // Index
      .waitForExist('#claims_wrapper')
      .waitForExist('#claim' + claimId)
      .click('#claim' + claimId)

      // View-claim
      .waitForExist('#reference')
      .getText('#visitor-name').then(function (text) {
        expect(text).to.be.equal('John Smith')
      })
      .selectByVisibleText('#dwp-status', 'Approve')
      .selectByVisibleText('#nomis-check', 'Approve')
      .selectByVisibleText('#visit-confirmation-check', 'Approve')
      .selectByVisibleText(`#claim-expense-${expenseId1}-status`, 'Approve')
      .selectByVisibleText(`#claim-expense-${expenseId2}-status`, 'Approve')
      .click('[for="approve"]')
      .click('#approve-submit')

      // Check that claim has been rejected
      .url('/?status=APPROVED')
      .waitForExist('#claim' + claimId)
  })

  after(function () {
    return databaseHelper.deleteAll(reference)
  })
})
