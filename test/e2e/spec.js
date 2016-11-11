var moment = require('moment')
var databaseHelper = require('../helpers/database-setup-for-tests')
var expect = require('chai').expect

// Variables for creating and deleting a record
var reference = '1111111'
var date
var claimId
var eligibilityId
var prisonerId
var visitorId
var expenseId1
var expenseId2
var childId1
var childId2

describe('First time claim viewing flow', () => {
  before(function () {
    date = moment('20010101').toDate()
    return databaseHelper.insertTestData(reference, date, 'New').then(function (ids) {
      claimId = ids.claimId
      eligibilityId = ids.eligibilityId
      prisonerId = ids.prisonerId
      visitorId = ids.visitorId
      expenseId1 = ids.expenseId1
      expenseId2 = ids.expenseId2
      childId1 = ids.childId1
      childId2 = ids.childId2
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
      .selectByVisibleText('#dwp-check', 'Approve')
      .selectByVisibleText('#nomis-check', 'Approve')
      .selectByVisibleText(`#claim-expense-${expenseId1}-status`, 'Approve')
      .selectByVisibleText(`#claim-expense-${expenseId2}-status`, 'Approve')
      .click('#approve')
      .click('#approve-submit')

      // Back to index with changed results
      .waitForExist('#claims_wrapper')
      .click('#approved')

      // Go to approved list
      .waitForExist('#claim' + claimId)
  })

  after(function () {
    return databaseHelper.deleteTestData(claimId, eligibilityId, visitorId, prisonerId, expenseId1, expenseId2, childId1, childId2)
  })
})
