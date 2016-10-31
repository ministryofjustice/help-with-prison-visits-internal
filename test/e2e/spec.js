// TODO: Will need to add check on each of the pages that has a constructed URL path.
var moment = require('moment')
var databaseHelper = require('../helpers/database-setup-for-tests')
var expect = require('chai').expect

// variables for creating and deleting a record
var reference = 'AAAAAAA'
var date
var claimId
var eligibilityId
var prisonerId
var visitorId

describe('First time claim viewing flow', () => {
  before(function () {
    date = moment().toDate()
    return databaseHelper.setup(reference, date, 'New').then(function (ids) {
      claimId = ids.claimId
      eligibilityId = ids.eligibilityId
      prisonerId = ids.prisonerId
      visitorId = ids.visitorId
    })
  })

  it('should display a list of claims and select the one to view details', () => {
    return browser.url('/')

      // Index
      .waitForExist('#claims_wrapper')
      .waitForExist('#claim' + claimId)
      .click('#claim' + claimId)

      // view-claim
      .waitForExist('#reference')
      .getText('#visitor-name').then(function (text) {
        expect(text).to.be.equal('John Smith')
      })
  })

  after(function () {
    // Clean up
    return databaseHelper.delete(claimId, eligibilityId, visitorId, prisonerId)
  })
})
